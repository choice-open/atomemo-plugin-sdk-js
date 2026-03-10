import { describe, expect, test } from "bun:test"
import { ZodError } from "zod"
import { parseFileRefs } from "../../src/utils/parse-file-refs"

describe("parseFileRefs", () => {
  test("returns primitives unchanged", () => {
    expect(parseFileRefs("hello")).toBe("hello")
    expect(parseFileRefs(42)).toBe(42)
    expect(parseFileRefs(true)).toBe(true)
    expect(parseFileRefs(null)).toBeNull()
    expect(parseFileRefs(undefined)).toBeUndefined()
  })

  test("returns plain objects without file_ref unchanged", () => {
    const input = { name: "test", count: 3, nested: { ok: true } }
    const result = parseFileRefs(input)

    expect(result).toEqual(input)
  })

  test("parses top-level file_ref with source 'oss'", () => {
    const input = {
      __type__: "file_ref",
      source: "oss",
      filename: "photo.jpg",
      extension: ".jpg",
      mime_type: "image/jpeg",
      size: 12345,
      res_key: "uploads/photo.jpg",
      remote_url: "https://example.com/photo.jpg",
    }

    const result = parseFileRefs(input)

    expect(result).toEqual(input)
  })

  test("parses top-level file_ref with source 'mem'", () => {
    const input = {
      __type__: "file_ref",
      source: "mem",
      filename: "data.txt",
      content: btoa("hello world"),
    }

    const result = parseFileRefs(input)

    expect(result).toEqual({
      __type__: "file_ref",
      source: "mem",
      filename: "data.txt",
      content: btoa("hello world"),
    })
  })

  test("parses file_ref nested inside an object", () => {
    const input = {
      name: "task",
      attachment: {
        __type__: "file_ref",
        source: "oss",
        filename: "doc.pdf",
        mime_type: "application/pdf",
        size: 99999,
      },
    }

    const result = parseFileRefs(input) as Record<string, unknown>

    expect(result.name).toBe("task")
    expect(result.attachment).toEqual({
      __type__: "file_ref",
      source: "oss",
      filename: "doc.pdf",
      mime_type: "application/pdf",
      size: 99999,
    })
  })

  test("parses file_refs inside arrays", () => {
    const input = [
      {
        __type__: "file_ref",
        source: "oss",
        filename: "a.png",
      },
      {
        __type__: "file_ref",
        source: "mem",
        content: btoa("data"),
      },
    ]

    const result = parseFileRefs(input) as Array<Record<string, unknown>>

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      __type__: "file_ref",
      source: "oss",
      filename: "a.png",
    })
    expect(result[1]).toEqual({
      __type__: "file_ref",
      source: "mem",
      content: btoa("data"),
    })
  })

  test("parses deeply nested file_refs", () => {
    const input = {
      level1: {
        level2: {
          items: [
            {
              level3: {
                file: {
                  __type__: "file_ref",
                  source: "oss",
                  filename: "deep.txt",
                  res_key: "deep/path/deep.txt",
                },
              },
            },
          ],
        },
      },
    }

    const result = parseFileRefs(input) as {
      level1: {
        level2: {
          items: Array<{ level3: { file: Record<string, unknown> } }>
        }
      }
    }

    expect(result.level1.level2.items[0].level3.file).toEqual({
      __type__: "file_ref",
      source: "oss",
      filename: "deep.txt",
      res_key: "deep/path/deep.txt",
    })
  })

  test("throws ZodError on invalid file_ref (missing source)", () => {
    const input = {
      __type__: "file_ref",
      filename: "bad.txt",
    }

    expect(() => parseFileRefs(input)).toThrow(ZodError)
  })

  test("handles circular references safely", () => {
    const obj: Record<string, unknown> = { name: "root" }
    obj.self = obj

    const result = parseFileRefs(obj) as Record<string, unknown>

    expect(result.name).toBe("root")
    // circular ref returned unmodified (the original obj)
    expect(result.self).toBe(obj)
  })
})
