import { describe, expect, test } from "bun:test"
import { serializeError } from "../../src/utils/serialize-error"

describe("serializeError", () => {
  test("serializes basic Error with name and message", () => {
    const err = new Error("something went wrong")

    const result = serializeError(err)

    expect(result.name).toBe("Error")
    expect(result.message).toBe("something went wrong")
    // stack 可能不存在，不做强约束，只要 stringify 不炸就行
    expect(() => JSON.stringify(result)).not.toThrow()
  })

  test("includes enumerable custom properties when serializable", () => {
    const err = new Error("error with meta") as Error & {
      code: string
      status: number
      meta: { foo: string }
    }
    err.code = "E_TEST"
    err.status = 500
    err.meta = { foo: "bar" }

    const result = serializeError(err)

    expect(result).toHaveProperty("code", "E_TEST")
    expect(result).toHaveProperty("status", 500)
    expect(result).toHaveProperty("meta", { foo: "bar" })
    expect(() => JSON.stringify(result)).not.toThrow()
  })

  test("drops non-serializable top-level properties", () => {
    const err = new Error("invalid") as Error & {
      fn: () => void
      big: bigint
      sym: symbol
      undef: undefined
    }
    err.fn = () => {}
    err.big = 10n
    err.sym = Symbol("x")
    err.undef = undefined

    const result = serializeError(err) as unknown as {
      fn: undefined
      big: undefined
      sym: undefined
      undef: undefined
    }

    expect(result.fn).toBeUndefined()
    expect(result.big).toBeUndefined()
    expect(result.sym).toBeUndefined()
    expect(result.undef).toBeUndefined()
    expect(() => JSON.stringify(result)).not.toThrow()
  })

  test("normalizes array items to JSON-safe values", () => {
    const err = new Error("array") as Error & {
      items: unknown[]
    }
    err.items = [1, "a", () => {}, undefined, null]

    const result = serializeError(err) as unknown as { items: (number | string | null)[] }

    expect(Array.isArray(result.items)).toBe(true)
    // 函数和 undefined 会按实现变成 null
    expect(result.items).toEqual([1, "a", null, null, null])
    expect(() => JSON.stringify(result)).not.toThrow()
  })

  test("serializes nested objects and drops inner non-serializable values", () => {
    const err = new Error("nested") as Error & {
      meta: {
        level: number
        inner: {
          ok: boolean
          fn: () => void
        }
      }
    }
    err.meta = {
      level: 1,
      inner: {
        ok: true,
        fn: () => {},
      },
    }

    const result = serializeError(err) as unknown as {
      meta: { level: number; inner: { ok: boolean; fn: undefined } }
    }

    expect(result.meta.level).toBe(1)
    expect(result.meta.inner.ok).toBe(true)
    expect(result.meta.inner.fn).toBeUndefined()
    expect(() => JSON.stringify(result)).not.toThrow()
  })

  test("serializes Date properties to ISO strings", () => {
    const err = new Error("with date") as Error & { at: Date }
    const at = new Date("2020-01-01T00:00:00.000Z")
    err.at = at

    const result = serializeError(err) as unknown as { at: string }

    expect(typeof result.at).toBe("string")
    expect(result.at).toBe(at.toISOString())
    expect(() => JSON.stringify(result)).not.toThrow()
  })

  test("handles cause property including nested Error", () => {
    const inner = new Error("inner") as Error & { code: string }
    inner.code = "INNER"

    const outer = new Error("outer") as Error & { cause?: unknown }
    outer.cause = inner

    const result = serializeError(outer) as unknown as {
      message: string
      cause: { name: string; message: string; code: string }
    }

    expect(result.message).toBe("outer")
    expect(result.cause).toBeDefined()
    expect(result.cause.message).toBe("inner")
    expect(result.cause.code).toBe("INNER")
    expect(() => JSON.stringify(result)).not.toThrow()
  })

  test("handles circular references safely", () => {
    const err = new Error("circular") as Error & { meta: unknown }
    const meta: Record<string, unknown> = { a: 1 }
    meta.self = meta
    err.meta = meta

    const result = serializeError(err) as unknown as { meta: { a: number; self: unknown } }

    expect(result.meta.a).toBe(1)
    // 循环引用应该被剔除
    expect(result.meta.self).toBeUndefined()
    expect(() => JSON.stringify(result)).not.toThrow()
  })
})
