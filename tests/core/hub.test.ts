import { beforeEach, describe, expect, mock, test } from "bun:test"
import type { Channel } from "phoenix"
import { createHubCaller, HubCallError, HubCallTimeoutError } from "../../src/hub"

interface Binding {
  event: string
  ref: number
  callback: Function
}

function createMockChannel() {
  const bindings: Binding[] = []
  let bindingRef = 0

  return {
    on(event: string, callback: Function): number {
      const ref = bindingRef++
      bindings.push({ event, ref, callback })
      return ref
    },
    off(event: string, ref: number) {
      const index = bindings.findIndex((b) => b.event === event && b.ref === ref)
      if (index !== -1) bindings.splice(index, 1)
    },
    push: mock((_event: string, _payload: unknown) => {
      return { receive: mock(() => ({})) }
    }),
    // Test helper: simulate Hub sending an event
    _emit(event: string, payload: unknown) {
      for (const binding of bindings) {
        if (binding.event === event) binding.callback(payload)
      }
    },
    _bindingCount(event: string): number {
      return bindings.filter((b) => b.event === event).length
    },
  }
}

type MockChannel = ReturnType<typeof createMockChannel>

describe("hub caller", () => {
  let mockChannel: MockChannel

  beforeEach(() => {
    mockChannel = createMockChannel()
  })

  describe("createHubCaller", () => {
    test("registers one listener each for hub_call_response and hub_call_error", () => {
      createHubCaller(mockChannel as unknown as Channel)

      expect(mockChannel._bindingCount("hub_call_response")).toBe(1)
      expect(mockChannel._bindingCount("hub_call_error")).toBe(1)
    })
  })

  describe("call", () => {
    test("pushes hub_call:{event} with correct payload shape", () => {
      const caller = createHubCaller(mockChannel as unknown as Channel)
      caller.call("get_file_url", { url: "https://example.com/file.pdf" })

      expect(mockChannel.push).toHaveBeenCalledTimes(1)

      const [event, payload] = mockChannel.push.mock.calls[0] as [string, unknown]
      expect(event).toBe("hub_call:get_file_url")
      expect(payload).toEqual(
        expect.objectContaining({
          request_id: expect.any(String),
          data: { url: "https://example.com/file.pdf" },
        }),
      )
    })

    test("resolves on hub_call_response with matching request_id", async () => {
      const caller = createHubCaller(mockChannel as unknown as Channel)
      const promise = caller.call("get_file_url", { url: "https://example.com" })

      const [, payload] = mockChannel.push.mock.calls[0] as [string, { request_id: string }]
      const requestId = payload.request_id

      mockChannel._emit("hub_call_response", {
        request_id: requestId,
        data: { signed_url: "https://cdn.example.com/signed" },
      })

      const result = await promise
      expect(result).toEqual({ signed_url: "https://cdn.example.com/signed" })
    })

    test("rejects on hub_call_error with HubCallError", async () => {
      const caller = createHubCaller(mockChannel as unknown as Channel)
      const promise = caller.call("get_file_url", { url: "https://example.com" })

      const [, payload] = mockChannel.push.mock.calls[0] as [string, { request_id: string }]
      const requestId = payload.request_id

      mockChannel._emit("hub_call_error", {
        request_id: requestId,
        error: { code: "NOT_FOUND", message: "File not found" },
      })

      try {
        await promise
        throw new Error("Expected promise to reject")
      } catch (err) {
        expect(err).toBeInstanceOf(HubCallError)
        const hubErr = err as HubCallError
        expect(hubErr.code).toBe("NOT_FOUND")
        expect(hubErr.message).toBe("File not found")
      }
    })

    test("rejects on timeout with HubCallTimeoutError", async () => {
      const caller = createHubCaller(mockChannel as unknown as Channel, { timeoutMs: 50 })
      const promise = caller.call("slow_operation", { key: "value" })

      try {
        await promise
        throw new Error("Expected promise to reject")
      } catch (err) {
        expect(err).toBeInstanceOf(HubCallTimeoutError)
        expect((err as HubCallTimeoutError).message).toContain("slow_operation")
        expect((err as HubCallTimeoutError).message).toContain("50ms")
      }
    })

    test("ignores responses with non-matching request_id", async () => {
      const caller = createHubCaller(mockChannel as unknown as Channel, { timeoutMs: 100 })
      const promise = caller.call("get_file_url", { url: "https://example.com" })

      // Emit a response with a different request_id
      mockChannel._emit("hub_call_response", {
        request_id: "non-matching-id",
        data: { should: "be ignored" },
      })

      // The promise should still be pending; it will timeout
      try {
        await promise
        throw new Error("Expected promise to reject")
      } catch (err) {
        expect(err).toBeInstanceOf(HubCallTimeoutError)
      }
    })

    test("handles multiple concurrent calls independently", async () => {
      const caller = createHubCaller(mockChannel as unknown as Channel)

      const promise1 = caller.call("event_a", { id: 1 })
      const promise2 = caller.call("event_b", { id: 2 })

      const [, payload1] = mockChannel.push.mock.calls[0] as [string, { request_id: string }]
      const [, payload2] = mockChannel.push.mock.calls[1] as [string, { request_id: string }]

      // Respond to second call first
      mockChannel._emit("hub_call_response", {
        request_id: payload2.request_id,
        data: { result: "b" },
      })

      // Then respond to first call
      mockChannel._emit("hub_call_response", {
        request_id: payload1.request_id,
        data: { result: "a" },
      })

      expect(await promise1).toEqual({ result: "a" })
      expect(await promise2).toEqual({ result: "b" })
    })
  })

  describe("dispose", () => {
    test("rejects all pending calls", async () => {
      const caller = createHubCaller(mockChannel as unknown as Channel)

      const promise1 = caller.call("event_a", {})
      const promise2 = caller.call("event_b", {})

      caller.dispose()

      try {
        await promise1
        throw new Error("Expected promise1 to reject")
      } catch (err) {
        expect((err as Error).message).toBe("Hub caller disposed")
      }

      try {
        await promise2
        throw new Error("Expected promise2 to reject")
      } catch (err) {
        expect((err as Error).message).toBe("Hub caller disposed")
      }
    })

    test("removes channel listeners using ref numbers", () => {
      createHubCaller(mockChannel as unknown as Channel).dispose()

      expect(mockChannel._bindingCount("hub_call_response")).toBe(0)
      expect(mockChannel._bindingCount("hub_call_error")).toBe(0)
    })

    test("is safe to call dispose with no pending calls", () => {
      const caller = createHubCaller(mockChannel as unknown as Channel)
      expect(() => caller.dispose()).not.toThrow()
    })
  })

  describe("HubCallError", () => {
    test("has correct name, code, and message", () => {
      const err = new HubCallError("RATE_LIMITED", "Too many requests")
      expect(err).toBeInstanceOf(Error)
      expect(err.name).toBe("HubCallError")
      expect(err.code).toBe("RATE_LIMITED")
      expect(err.message).toBe("Too many requests")
    })
  })

  describe("HubCallTimeoutError", () => {
    test("has correct name and descriptive message", () => {
      const err = new HubCallTimeoutError("get_file_url", 5000)
      expect(err).toBeInstanceOf(Error)
      expect(err.name).toBe("HubCallTimeoutError")
      expect(err.message).toBe('Hub call "get_file_url" timed out after 5000ms')
    })
  })
})
