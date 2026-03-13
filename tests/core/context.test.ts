import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import type { FileRef } from "@choiceopen/atomemo-plugin-schema/types"
import { createPluginContext } from "../../src/context"
import type { HubCaller } from "../../src/hub"

function createMockHubCaller() {
  const call: HubCaller["call"] = async (event) => {
    if (event === "get_upload_url") {
      return {
        presigned_url: "https://example.com/upload.bin",
        res_key: "uploads/file.bin",
      } as never
    }

    return {
      url: "https://example.com/file.bin",
    } as never
  }

  return {
    call: mock(call) as unknown as HubCaller["call"],
    dispose: mock(() => {}),
  } satisfies HubCaller
}

describe("createPluginContext", () => {
  const originalFetch = globalThis.fetch
  let hubCaller: ReturnType<typeof createMockHubCaller>

  beforeEach(() => {
    hubCaller = createMockHubCaller()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("parseFileRef parses a valid file_ref", () => {
    const context = createPluginContext(hubCaller)
    const input = {
      __type__: "file_ref",
      source: "oss",
      filename: "report.pdf",
      res_key: "files/report.pdf",
      extension: null,
      mime_type: null,
      size: null,
      remote_url: null,
      content: null,
    } as FileRef

    expect(context.files.parseFileRef(input)).toEqual(input)
  })

  test("parseFileRef throws on invalid input", () => {
    const context = createPluginContext(hubCaller)

    expect(() =>
      context.files.parseFileRef({
        __type__: "file_ref",
        filename: "broken.pdf",
      }),
    ).toThrow()
  })

  test("attachRemoteUrl calls hubCaller.call with get_file_url and res_key", async () => {
    const context = createPluginContext(hubCaller)
    const fileRef = {
      __type__: "file_ref",
      source: "oss",
      filename: null,
      res_key: "uploads/photo.jpg",
      extension: null,
      mime_type: null,
      size: null,
      remote_url: null,
      content: null,
    } satisfies FileRef

    await context.files.attachRemoteUrl(fileRef)

    expect(hubCaller.call).toHaveBeenCalledWith("get_file_url", {
      res_key: "uploads/photo.jpg",
    })
  })

  test("attachRemoteUrl returns file_ref merged with remote_url", async () => {
    const context = createPluginContext(hubCaller)
    const fileRef = {
      __type__: "file_ref",
      source: "oss",
      filename: "photo.jpg",
      res_key: "uploads/photo.jpg",
      extension: null,
      mime_type: null,
      size: null,
      remote_url: null,
      content: null,
    } satisfies FileRef

    expect(await context.files.attachRemoteUrl(fileRef)).toEqual({
      ...fileRef,
      remote_url: "https://example.com/file.bin",
    })
  })

  test("attachRemoteUrl reuses existing remote_url without calling hub", async () => {
    const context = createPluginContext(hubCaller)
    const fileRef = {
      __type__: "file_ref",
      source: "oss",
      filename: "photo.jpg",
      remote_url: "https://cdn.example.com/photo.jpg",
      extension: null,
      mime_type: null,
      size: null,
      res_key: null,
      content: null,
    } satisfies FileRef

    expect(await context.files.attachRemoteUrl(fileRef)).toEqual(fileRef)
    expect(hubCaller.call).not.toHaveBeenCalled()
  })

  test("download returns mem file_ref unchanged", async () => {
    const context = createPluginContext(hubCaller)
    const fileRef = {
      __type__: "file_ref",
      source: "mem",
      filename: "hello.txt",
      content: Buffer.from("hello world").toString("base64"),
      extension: null,
      mime_type: null,
      size: null,
      res_key: null,
      remote_url: null,
    } satisfies FileRef

    expect(await context.files.download(fileRef)).toBe(fileRef)
    expect(hubCaller.call).not.toHaveBeenCalled()
  })

  test("download for oss attaches remote_url, fetches bytes, and returns base64 content", async () => {
    const context = createPluginContext(hubCaller)
    const fileRef = {
      __type__: "file_ref",
      source: "oss",
      filename: "hello.txt",
      res_key: "uploads/hello.txt",
      extension: null,
      mime_type: null,
      size: null,
      remote_url: null,
      content: null,
    } satisfies FileRef
    const fetchMock = mock(async (input: RequestInfo | URL) => {
      expect(input).toBe("https://example.com/file.bin")
      return new Response(Uint8Array.from([104, 101, 108, 108, 111]))
    })

    globalThis.fetch = fetchMock as unknown as typeof fetch

    expect(await context.files.download(fileRef)).toEqual({
      ...fileRef,
      remote_url: "https://example.com/file.bin",
      content: Buffer.from("hello").toString("base64"),
    })
    expect(hubCaller.call).toHaveBeenCalledWith("get_file_url", {
      res_key: "uploads/hello.txt",
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  test("download works when destructured from context.files", async () => {
    const context = createPluginContext(hubCaller)
    const { download } = context.files
    const fileRef = {
      __type__: "file_ref",
      source: "oss",
      filename: "hello.txt",
      res_key: "uploads/hello.txt",
      extension: null,
      mime_type: null,
      size: null,
      remote_url: null,
      content: null,
    } satisfies FileRef
    const fetchMock = mock(async (input: RequestInfo | URL) => {
      expect(input).toBe("https://example.com/file.bin")
      return new Response(Uint8Array.from([104, 101, 108, 108, 111]))
    })

    globalThis.fetch = fetchMock as unknown as typeof fetch

    expect(await download(fileRef)).toEqual({
      ...fileRef,
      remote_url: "https://example.com/file.bin",
      content: Buffer.from("hello").toString("base64"),
    })
    expect(hubCaller.call).toHaveBeenCalledWith("get_file_url", {
      res_key: "uploads/hello.txt",
    })
  })

  test("upload returns oss file_ref unchanged", async () => {
    const context = createPluginContext(hubCaller)
    const fileRef = {
      __type__: "file_ref",
      source: "oss",
      filename: "draft.txt",
      res_key: "uploads/draft.txt",
      extension: null,
      mime_type: null,
      size: null,
      remote_url: null,
      content: null,
    } satisfies FileRef

    expect(await context.files.upload(fileRef, { prefixKey: "uploads/" })).toEqual(fileRef)
    expect(hubCaller.call).not.toHaveBeenCalled()
  })

  test("upload requests presigned url with extension and prefixKey, then uploads bytes", async () => {
    const context = createPluginContext(hubCaller)
    const fileRef = {
      __type__: "file_ref",
      source: "mem",
      filename: "draft.txt",
      extension: ".txt",
      content: Buffer.from("hello").toString("base64"),
      mime_type: null,
      size: null,
      res_key: null,
      remote_url: null,
    } satisfies FileRef
    const fetchMock = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(input).toBe("https://example.com/upload.bin")
      expect(init?.method).toBe("PUT")
      expect(init?.headers).toEqual({ "content-type": "text/plain" })
      expect(Buffer.from(init?.body as Buffer).toString()).toBe("hello")

      return new Response(null, { status: 200 })
    })

    globalThis.fetch = fetchMock as unknown as typeof fetch

    expect(await context.files.upload(fileRef, { prefixKey: "tmp/" })).toEqual({
      ...fileRef,
      source: "oss",
      content: null,
      size: 5,
      res_key: "uploads/file.bin",
      remote_url: null,
    })
    expect(hubCaller.call).toHaveBeenCalledWith("get_upload_url", {
      extension: ".txt",
      prefixKey: "tmp/",
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  test("upload works when destructured from context.files", async () => {
    const context = createPluginContext(hubCaller)
    const { upload } = context.files
    const fileRef = {
      __type__: "file_ref",
      source: "mem",
      extension: ".bin",
      content: Buffer.from("abc").toString("base64"),
      filename: null,
      mime_type: null,
      size: null,
      res_key: null,
      remote_url: null,
    } satisfies FileRef
    const fetchMock = mock(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe("PUT")
      expect(init?.headers).toEqual({ "content-type": "application/octet-stream" })
      return new Response(null, { status: 200 })
    })

    globalThis.fetch = fetchMock as unknown as typeof fetch

    expect(await upload(fileRef, { prefixKey: "bin/" })).toEqual({
      ...fileRef,
      source: "oss",
      content: null,
      size: 3,
      res_key: "uploads/file.bin",
      remote_url: null,
    })
    expect(hubCaller.call).toHaveBeenCalledWith("get_upload_url", {
      extension: ".bin",
      prefixKey: "bin/",
    })
  })
})
