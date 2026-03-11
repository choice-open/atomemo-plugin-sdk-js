import type { Channel } from "phoenix"

export interface HubCallerOptions {
  timeoutMs?: number
}

export interface HubCaller {
  call<T = unknown>(event: string, data: Record<string, unknown>): Promise<T>
  dispose(): void
}

export class HubCallError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = "HubCallError"
    this.code = code
  }
}

export class HubCallTimeoutError extends Error {
  constructor(event: string, timeoutMs: number) {
    super(`Hub call "${event}" timed out after ${timeoutMs}ms`)
    this.name = "HubCallTimeoutError"
  }
}

interface PendingCall {
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
  timer: ReturnType<typeof setTimeout>
}

export function createHubCaller(channel: Channel, options?: HubCallerOptions): HubCaller {
  const timeoutMs = options?.timeoutMs ?? 30_000
  const pending = new Map<string, PendingCall>()
  let disposed = false

  function settlePending(requestId: string) {
    const entry = pending.get(requestId)
    if (!entry) return undefined
    clearTimeout(entry.timer)
    pending.delete(requestId)
    return entry
  }

  const responseRef = channel.on(
    "hub_call_response",
    (payload: { request_id: string; data: unknown }) => {
      const entry = settlePending(payload.request_id)
      if (entry) entry.resolve(payload.data)
    },
  )

  const errorRef = channel.on(
    "hub_call_error",
    (payload: { request_id: string; error: { code: string; message: string } }) => {
      const entry = settlePending(payload.request_id)
      if (entry) entry.reject(new HubCallError(payload.error.code, payload.error.message))
    },
  )

  return {
    call<T = unknown>(event: string, data: Record<string, unknown>): Promise<T> {
      if (disposed) return Promise.reject(new Error("Hub caller is disposed"))

      return new Promise<T>((resolve, reject) => {
        const requestId = crypto.randomUUID()

        const timer = setTimeout(() => {
          pending.delete(requestId)
          reject(new HubCallTimeoutError(event, timeoutMs))
        }, timeoutMs)

        pending.set(requestId, {
          resolve: resolve as (value: unknown) => void,
          reject,
          timer,
        })

        channel
          .push(`hub_call:${event}`, {
            request_id: requestId,
            data,
          })
          .receive("error", (resp: unknown) => {
            const entry = settlePending(requestId)
            if (entry)
              entry.reject(
                new HubCallError("PUSH_FAILED", `Push rejected: ${JSON.stringify(resp)}`),
              )
          })
          .receive("timeout", () => {
            const entry = settlePending(requestId)
            if (entry) entry.reject(new HubCallTimeoutError(event, timeoutMs))
          })
      })
    },

    dispose() {
      disposed = true

      for (const [, entry] of pending) {
        clearTimeout(entry.timer)
        entry.reject(new Error("Hub caller disposed"))
      }
      pending.clear()

      channel.off("hub_call_response", responseRef)
      channel.off("hub_call_error", errorRef)
    },
  }
}
