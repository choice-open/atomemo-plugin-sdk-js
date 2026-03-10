# WebSocket Protocol Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align the JS SDK with the WebSocket protocol document by implementing hub call mechanism, PluginContext construction/injection, FileRef recursive parsing, and register_plugin reply handling.

**Architecture:** Four modules built in dependency order: (1) FileRef recursive parser as a pure utility, (2) HubCaller as the RPC client over Phoenix channels, (3) PluginContext factory that wires HubCaller into schema-compliant `files.*` methods, (4) plugin.ts integration that connects everything. Each module is independently testable.

**Tech Stack:** TypeScript, Bun runtime, Phoenix JS client, Zod v4, `@choiceopen/atomemo-plugin-schema` (local link)

---

### Task 1: FileRef Recursive Parser

**Files:**
- Create: `src/utils/parse-file-refs.ts`
- Test: `tests/utils/parse-file-refs.test.ts`

**Step 1: Write the failing tests**

```typescript
// tests/utils/parse-file-refs.test.ts
import { describe, expect, test } from "bun:test"
import { parseFileRefs } from "../../src/utils/parse-file-refs"

describe("parseFileRefs", () => {
  test("returns primitives unchanged", () => {
    expect(parseFileRefs("hello")).toBe("hello")
    expect(parseFileRefs(42)).toBe(42)
    expect(parseFileRefs(true)).toBe(true)
    expect(parseFileRefs(null)).toBe(null)
    expect(parseFileRefs(undefined)).toBe(undefined)
  })

  test("returns plain objects unchanged when no file_ref", () => {
    const input = { name: "test", value: 123 }
    expect(parseFileRefs(input)).toEqual(input)
  })

  test("parses a top-level file_ref (OSS)", () => {
    const input = {
      __type__: "file_ref",
      source: "oss",
      filename: "doc.pdf",
      extension: ".pdf",
      mime_type: "application/pdf",
      size: 1024,
      res_key: "path/to/doc.pdf",
      remote_url: "https://example.com/doc.pdf",
    }
    const result = parseFileRefs(input) as Record<string, unknown>
    expect(result.__type__).toBe("file_ref")
    expect(result.source).toBe("oss")
    expect(result.filename).toBe("doc.pdf")
  })

  test("parses a top-level file_ref (mem)", () => {
    const input = {
      __type__: "file_ref",
      source: "mem",
      filename: "data.bin",
      content: "SGVsbG8=", // base64 "Hello"
    }
    const result = parseFileRefs(input) as Record<string, unknown>
    expect(result.__type__).toBe("file_ref")
    expect(result.source).toBe("mem")
    expect(result.content).toBe("SGVsbG8=")
  })

  test("parses file_ref nested inside an object", () => {
    const input = {
      name: "test",
      file: {
        __type__: "file_ref",
        source: "oss",
        res_key: "path/to/file.pdf",
      },
    }
    const result = parseFileRefs(input) as Record<string, unknown>
    const file = result.file as Record<string, unknown>
    expect(file.__type__).toBe("file_ref")
    expect(file.source).toBe("oss")
  })

  test("parses file_ref inside arrays", () => {
    const input = [
      { __type__: "file_ref", source: "mem", content: "SGVsbG8=" },
      "not a file ref",
      42,
    ]
    const result = parseFileRefs(input) as unknown[]
    expect((result[0] as Record<string, unknown>).__type__).toBe("file_ref")
    expect(result[1]).toBe("not a file ref")
    expect(result[2]).toBe(42)
  })

  test("parses deeply nested file_refs", () => {
    const input = {
      level1: {
        level2: {
          files: [
            { __type__: "file_ref", source: "oss", res_key: "a.pdf" },
            { __type__: "file_ref", source: "mem", content: "SGVsbG8=" },
          ],
        },
      },
    }
    const result = parseFileRefs(input) as any
    expect(result.level1.level2.files[0].__type__).toBe("file_ref")
    expect(result.level1.level2.files[1].__type__).toBe("file_ref")
  })

  test("throws on invalid file_ref (missing source)", () => {
    const input = { __type__: "file_ref" }
    expect(() => parseFileRefs(input)).toThrow()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `bun test tests/utils/parse-file-refs.test.ts`
Expected: FAIL — module `../../src/utils/parse-file-refs` does not exist

**Step 3: Write minimal implementation**

```typescript
// src/utils/parse-file-refs.ts
import { FileRefSchema } from "@choiceopen/atomemo-plugin-schema/schemas"

/**
 * Recursively traverses a value and parses any plain objects with
 * `__type__: "file_ref"` into validated FileRef structures.
 *
 * This mirrors the behavior of Elixir SDK's recursive file_ref parsing
 * in invoke_tool parameter handling.
 */
export function parseFileRefs(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(parseFileRefs)
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>

    if (obj.__type__ === "file_ref") {
      return FileRefSchema.parse(obj)
    }

    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [key, parseFileRefs(val)]),
    )
  }

  return value
}
```

**Step 4: Run test to verify it passes**

Run: `bun test tests/utils/parse-file-refs.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/utils/parse-file-refs.ts tests/utils/parse-file-refs.test.ts
git commit -m "feat: add FileRef recursive parser for invoke_tool parameters"
```

---

### Task 2: Hub Call Mechanism

**Files:**
- Create: `src/hub.ts` (overwrite empty file)
- Test: `tests/core/hub.test.ts`

**Step 1: Write the failing tests**

```typescript
// tests/core/hub.test.ts
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { createHubCaller } from "../../src/hub"

// Minimal mock of Phoenix Channel
function createMockChannel() {
  const listeners = new Map<string, Set<(payload: any) => void>>()

  return {
    on(event: string, callback: (payload: any) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set())
      listeners.get(event)!.add(callback)
      return { off: () => listeners.get(event)?.delete(callback) }
    },
    off(event: string, callback: (payload: any) => void) {
      listeners.get(event)?.delete(callback)
    },
    push: mock((event: string, payload: any) => ({
      // Phoenix push returns a Push object; we don't need receive() for hub_call
    })),
    // Helper to simulate Hub sending a response
    _emit(event: string, payload: any) {
      listeners.get(event)?.forEach((cb) => cb(payload))
    },
    _listenerCount(event: string) {
      return listeners.get(event)?.size ?? 0
    },
  }
}

describe("createHubCaller", () => {
  let channel: ReturnType<typeof createMockChannel>

  beforeEach(() => {
    channel = createMockChannel()
  })

  test("call() pushes hub_call:{event} with request_id and data", async () => {
    const hubCaller = createHubCaller(channel as any)

    // Don't await — we'll simulate the response
    const promise = hubCaller.call("get_file_url", { res_key: "path/to/file.pdf" })

    // Verify push was called
    expect(channel.push).toHaveBeenCalledTimes(1)
    const [event, payload] = channel.push.mock.calls[0]
    expect(event).toBe("hub_call:get_file_url")
    expect(payload.data).toEqual({ res_key: "path/to/file.pdf" })
    expect(typeof payload.request_id).toBe("string")

    // Simulate Hub response
    channel._emit("hub_call_response", {
      request_id: payload.request_id,
      data: { url: "https://example.com/presigned" },
    })

    const result = await promise
    expect(result).toEqual({ url: "https://example.com/presigned" })

    hubCaller.dispose()
  })

  test("call() rejects on hub_call_error", async () => {
    const hubCaller = createHubCaller(channel as any)

    const promise = hubCaller.call("get_file_url", { res_key: "bad" })
    const [, payload] = channel.push.mock.calls[0]

    channel._emit("hub_call_error", {
      request_id: payload.request_id,
      error: { code: "NOT_FOUND", message: "File not found" },
    })

    await expect(promise).rejects.toThrow("File not found")

    hubCaller.dispose()
  })

  test("call() rejects on timeout", async () => {
    const hubCaller = createHubCaller(channel as any, { timeoutMs: 100 })

    const promise = hubCaller.call("slow_call", { data: "test" })

    await expect(promise).rejects.toThrow(/timed out/i)

    hubCaller.dispose()
  })

  test("ignores responses with non-matching request_id", async () => {
    const hubCaller = createHubCaller(channel as any)

    const promise = hubCaller.call("get_file_url", { res_key: "a.pdf" })

    // Emit a response with wrong request_id
    channel._emit("hub_call_response", {
      request_id: "wrong-id",
      data: { url: "should-not-resolve" },
    })

    // The promise should still be pending — verify by racing with a timeout
    const raceResult = await Promise.race([
      promise.then(() => "resolved"),
      new Promise((r) => setTimeout(() => r("timeout"), 50)),
    ])
    expect(raceResult).toBe("timeout")

    hubCaller.dispose()
  })

  test("dispose() rejects all pending calls", async () => {
    const hubCaller = createHubCaller(channel as any)

    const p1 = hubCaller.call("call1", {})
    const p2 = hubCaller.call("call2", {})

    hubCaller.dispose()

    await expect(p1).rejects.toThrow(/disposed/i)
    await expect(p2).rejects.toThrow(/disposed/i)
  })

  test("dispose() removes channel listeners", () => {
    const hubCaller = createHubCaller(channel as any)

    // After creation, listeners should be registered
    expect(channel._listenerCount("hub_call_response")).toBeGreaterThan(0)
    expect(channel._listenerCount("hub_call_error")).toBeGreaterThan(0)

    hubCaller.dispose()

    expect(channel._listenerCount("hub_call_response")).toBe(0)
    expect(channel._listenerCount("hub_call_error")).toBe(0)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `bun test tests/core/hub.test.ts`
Expected: FAIL — `createHubCaller` not exported from empty `src/hub.ts`

**Step 3: Write minimal implementation**

```typescript
// src/hub.ts
import type { Channel } from "phoenix"

export interface HubCallerOptions {
  /** Timeout in milliseconds for hub calls. Default: 30000 (30 seconds) */
  timeoutMs?: number
}

export interface HubCaller {
  /**
   * Calls a Hub capability via WebSocket RPC.
   * Pushes `hub_call:{event}` and waits for `hub_call_response` or `hub_call_error`.
   */
  call<T = unknown>(event: string, data: Record<string, unknown>): Promise<T>

  /**
   * Disposes the hub caller, rejecting all pending calls and removing listeners.
   */
  dispose(): void
}

interface PendingCall {
  resolve: (value: unknown) => void
  reject: (reason: Error) => void
  timer: ReturnType<typeof setTimeout>
}

export class HubCallError extends Error {
  code: string

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

export function createHubCaller(channel: Channel, options: HubCallerOptions = {}): HubCaller {
  const timeoutMs = options.timeoutMs ?? 30_000
  const pending = new Map<string, PendingCall>()

  const onResponse = (payload: { request_id: string; data: unknown }) => {
    const entry = pending.get(payload.request_id)
    if (!entry) return
    clearTimeout(entry.timer)
    pending.delete(payload.request_id)
    entry.resolve(payload.data)
  }

  const onError = (payload: { request_id: string; error: { code?: string; message?: string } }) => {
    const entry = pending.get(payload.request_id)
    if (!entry) return
    clearTimeout(entry.timer)
    pending.delete(payload.request_id)
    const err = payload.error ?? {}
    entry.reject(new HubCallError(err.code ?? "UNKNOWN", err.message ?? "Unknown hub call error"))
  }

  channel.on("hub_call_response", onResponse)
  channel.on("hub_call_error", onError)

  return {
    call<T = unknown>(event: string, data: Record<string, unknown>): Promise<T> {
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

        channel.push(`hub_call:${event}`, {
          request_id: requestId,
          data,
        })
      })
    },

    dispose() {
      for (const [id, entry] of pending) {
        clearTimeout(entry.timer)
        entry.reject(new Error("Hub caller disposed"))
      }
      pending.clear()
      channel.off("hub_call_response", onResponse as any)
      channel.off("hub_call_error", onError as any)
    },
  }
}
```

**Important note on Phoenix `channel.off()`:** The Phoenix JS client's `channel.off(event, ref)` takes a **ref number** returned by `channel.on()`, not a callback function. The test mock above uses a callback-based API for simplicity. The actual implementation will need to store the ref numbers returned by `channel.on()` and use those for `channel.off()`. Adjust during implementation:

```typescript
const responseRef = channel.on("hub_call_response", onResponse)
const errorRef = channel.on("hub_call_error", onError)

// In dispose():
channel.off("hub_call_response", responseRef)
channel.off("hub_call_error", errorRef)
```

Check Phoenix JS source to confirm the `off()` signature and adjust both implementation and test mock accordingly.

**Step 4: Run test to verify it passes**

Run: `bun test tests/core/hub.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/hub.ts tests/core/hub.test.ts
git commit -m "feat: implement hub call RPC mechanism"
```

---

### Task 3: PluginContext Factory

**Files:**
- Create: `src/context.ts`
- Test: `tests/core/context.test.ts`

**Step 1: Write the failing tests**

```typescript
// tests/core/context.test.ts
import { describe, expect, mock, test } from "bun:test"
import { createPluginContext } from "../../src/context"
import type { HubCaller } from "../../src/hub"

function createMockHubCaller(responses: Record<string, unknown> = {}): HubCaller {
  return {
    call: mock(async (event: string, data: Record<string, unknown>) => {
      if (responses[event]) return responses[event]
      throw new Error(`No mock response for hub call: ${event}`)
    }),
    dispose: mock(() => {}),
  }
}

describe("createPluginContext", () => {
  describe("files.parseFileRef", () => {
    test("parses a valid file_ref object", () => {
      const ctx = createPluginContext(createMockHubCaller())
      const result = ctx.files.parseFileRef({
        __type__: "file_ref",
        source: "oss",
        filename: "test.pdf",
        res_key: "path/to/test.pdf",
      })
      expect(result.__type__).toBe("file_ref")
      expect(result.source).toBe("oss")
    })

    test("throws on invalid input", () => {
      const ctx = createPluginContext(createMockHubCaller())
      expect(() => ctx.files.parseFileRef({ not: "a file ref" })).toThrow()
    })
  })

  describe("files.attachRemoteUrl", () => {
    test("calls hub get_file_url and returns FileRef with remote_url", async () => {
      const hubCaller = createMockHubCaller({
        get_file_url: { url: "https://example.com/presigned.pdf" },
      })
      const ctx = createPluginContext(hubCaller)

      const fileRef = {
        __type__: "file_ref" as const,
        source: "oss" as const,
        res_key: "path/to/doc.pdf",
      }
      const result = await ctx.files.attachRemoteUrl(fileRef)

      expect(result.remote_url).toBe("https://example.com/presigned.pdf")
      expect(result.res_key).toBe("path/to/doc.pdf")
      expect(hubCaller.call).toHaveBeenCalledWith("get_file_url", {
        res_key: "path/to/doc.pdf",
      })
    })
  })

  describe("files.download", () => {
    test("returns mem file_ref as-is (content already present)", async () => {
      const ctx = createPluginContext(createMockHubCaller())
      const fileRef = {
        __type__: "file_ref" as const,
        source: "mem" as const,
        content: "SGVsbG8=",
      }
      const result = await ctx.files.download(fileRef)
      expect(result).toEqual(fileRef)
    })

    // Note: OSS download test would need fetch mocking — handle during implementation
  })

  describe("files.upload", () => {
    test("throws not implemented error", async () => {
      const ctx = createPluginContext(createMockHubCaller())
      await expect(ctx.files.upload({})).rejects.toThrow(/not implemented/i)
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `bun test tests/core/context.test.ts`
Expected: FAIL — `src/context.ts` does not exist

**Step 3: Write minimal implementation**

```typescript
// src/context.ts
import { FileRefSchema } from "@choiceopen/atomemo-plugin-schema/schemas"
import type { FileRef, PluginContext } from "@choiceopen/atomemo-plugin-schema/types"
import type { HubCaller } from "./hub"

/**
 * Creates a PluginContext object that conforms to the schema definition.
 * Wires the HubCaller into file operation methods.
 */
export function createPluginContext(hubCaller: HubCaller): PluginContext {
  return {
    files: {
      parseFileRef(input: unknown): FileRef {
        return FileRefSchema.parse(input)
      },

      async attachRemoteUrl(fileRef: FileRef): Promise<FileRef & { remote_url: string }> {
        const response = (await hubCaller.call("get_file_url", {
          res_key: fileRef.res_key,
        })) as { url: string }

        return {
          ...fileRef,
          remote_url: response.url,
        }
      },

      async download(fileRef: FileRef): Promise<FileRef> {
        if (fileRef.source === "mem") {
          return fileRef
        }

        // OSS: get remote URL then fetch content
        const withUrl = await this.attachRemoteUrl(fileRef)
        const response = await fetch(withUrl.remote_url)
        const buffer = await response.arrayBuffer()
        const base64 = Buffer.from(buffer).toString("base64")

        return {
          ...withUrl,
          content: base64,
        }
      },

      async upload(_input: unknown): Promise<FileRef> {
        throw new Error("upload is not implemented yet")
      },
    },
  }
}
```

**Step 4: Run test to verify it passes**

Run: `bun test tests/core/context.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/context.ts tests/core/context.test.ts
git commit -m "feat: implement PluginContext factory with files operations"
```

---

### Task 4: Plugin.ts Integration

**Files:**
- Modify: `src/plugin.ts`

This task integrates all three modules into the plugin lifecycle. No new test file — adjustments to existing code paths.

**Step 1: Import new modules**

Add these imports to `src/plugin.ts`:

```typescript
import { createHubCaller } from "./hub"
import { createPluginContext } from "./context"
import { parseFileRefs } from "./utils/parse-file-refs"
```

**Step 2: Create HubCaller and PluginContext after channel join**

In `run()`, after `transporter.connect(topic)` resolves, create the hub caller and context:

```typescript
const hubCaller = createHubCaller(channel)
const pluginContext = createPluginContext(hubCaller)
```

**Step 3: Add register_plugin reply handling**

Replace the bare `channel.push("register_plugin", definition)` with:

```typescript
channel
  .push("register_plugin", definition)
  .receive("ok", (resp) => {
    console.log("register_plugin ok", resp)
  })
  .receive("error", (err) => {
    console.error("register_plugin error:", err)
  })
  .receive("timeout", () => {
    console.error("register_plugin timed out")
  })
```

Consider using the project's logger (`pino`) instead of bare `console.log/error` — check existing logging patterns in the codebase.

**Step 4: Inject context into invoke_tool handler**

In the `invoke_tool` handler, add FileRef parsing and context injection:

```diff
  channel.on("invoke_tool", async (message) => {
    const request_id = message.request_id

    try {
      const event = ToolInvokeMessage.parse(message)
-     const { credentials, parameters } = event
+     const { credentials } = event
+     const parameters = parseFileRefs(event.parameters) as Record<string, unknown>
      const definition = registry.resolve("tool", event.tool_name)

      const InvokeMethodWrapper = ToolDefinitionSchema.shape.invoke
      const invoke = InvokeMethodWrapper.implementAsync(definition.invoke)

-     const data = await invoke({ args: { credentials, parameters } })
+     const data = await invoke({ args: { credentials, parameters }, context: pluginContext })
      channel.push("invoke_tool_response", { request_id, data })
```

**Step 5: Inject context into credential_auth_spec handler**

```diff
  channel.on("credential_auth_spec", async (message) => {
    // ...
      const { credential, extra } = event
-     const data = await authenticate({ args: { credential, extra } })
+     const data = await authenticate({ args: { credential, extra }, context: pluginContext })
```

**Step 6: Update dispose to clean up HubCaller**

The dispose function returned from `transporter.connect()` is used in signal handlers. We need to also dispose the hub caller. Since `dispose` is constructed inside `transporter.connect()`, we add hub caller disposal before channel leave:

```typescript
void ["SIGINT", "SIGTERM"].forEach((signal) => {
  void process.on(signal, () => {
    hubCaller.dispose()
    dispose()
  })
})
```

**Step 7: Run all existing tests**

Run: `bun test`
Expected: All existing tests still PASS. If any fail due to the new `context` parameter requirement in `invoke`/`authenticate` calls, update the test mocks accordingly.

**Step 8: Run build**

Run: `bun run build`
Expected: Build succeeds with no type errors.

**Step 9: Run typecheck**

Run: `bun run typecheck`
Expected: No type errors.

**Step 10: Commit**

```bash
git add src/plugin.ts
git commit -m "feat: integrate hub call, PluginContext, and FileRef parsing into plugin lifecycle"
```

---

### Task 5: Final Verification

**Step 1: Run full test suite**

Run: `bun test`
Expected: All tests PASS

**Step 2: Run build**

Run: `bun run build`
Expected: Clean build

**Step 3: Run typecheck**

Run: `bun run typecheck`
Expected: No errors

**Step 4: Run linter**

Run: `bun run check`
Expected: No errors (or auto-fixed)
