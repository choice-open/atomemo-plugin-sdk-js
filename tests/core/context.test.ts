import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import type { FileRef } from "@choiceopen/atomemo-plugin-schema/types"
import { createPluginContext } from "../../src/context"
import type { HubCaller } from "../../src/hub"

function createMockHubCaller() {
  const call: HubCaller["call"] = async () =>
    ({
      url: "https://example.com/file.bin",
    }) as never

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
    }

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
    const fileRef: FileRef = {
      __type__: "file_ref",
      source: "oss",
      res_key: "uploads/photo.jpg",
    }

    await context.files.attachRemoteUrl(fileRef)

    expect(hubCaller.call).toHaveBeenCalledWith("get_file_url", {
      res_key: "uploads/photo.jpg",
    })
  })

  test("attachRemoteUrl returns file_ref merged with remote_url", async () => {
    const context = createPluginContext(hubCaller)
    const fileRef: FileRef = {
      __type__: "file_ref",
      source: "oss",
      filename: "photo.jpg",
      res_key: "uploads/photo.jpg",
    }

    expect(await context.files.attachRemoteUrl(fileRef)).toEqual({
      ...fileRef,
      remote_url: "https://example.com/file.bin",
    })
  })

  test("attachRemoteUrl reuses existing remote_url without calling hub", async () => {
    const context = createPluginContext(hubCaller)
    const fileRef: FileRef = {
      __type__: "file_ref",
      source: "oss",
      filename: "photo.jpg",
      remote_url: "https://cdn.example.com/photo.jpg",
    }

    expect(await context.files.attachRemoteUrl(fileRef)).toEqual(fileRef)
    expect(hubCaller.call).not.toHaveBeenCalled()
  })

  test("download returns mem file_ref unchanged", async () => {
    const context = createPluginContext(hubCaller)
    const fileRef: FileRef = {
      __type__: "file_ref",
      source: "mem",
      filename: "hello.txt",
      content: Buffer.from("hello world").toString("base64"),
    }

    expect(await context.files.download(fileRef)).toBe(fileRef)
    expect(hubCaller.call).not.toHaveBeenCalled()
  })

  test("download for oss attaches remote_url, fetches bytes, and returns base64 content", async () => {
    const context = createPluginContext(hubCaller)
    const fileRef: FileRef = {
      __type__: "file_ref",
      source: "oss",
      filename: "hello.txt",
      res_key: "uploads/hello.txt",
    }
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
    const fileRef: FileRef = {
      __type__: "file_ref",
      source: "oss",
      filename: "hello.txt",
      res_key: "uploads/hello.txt",
    }
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

  test("upload rejects with not implemented error", async () => {
    const context = createPluginContext(hubCaller)

    await expect(context.files.upload({ filename: "draft.txt" })).rejects.toThrow(
      "upload is not implemented yet",
    )
  })
})
