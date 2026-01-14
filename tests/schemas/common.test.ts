import { describe, expect, test } from "bun:test"
import { I18nEntrySchema } from "../../src/schemas/common"

describe("I18nEntrySchema", () => {
  describe("reject non-object values", () => {
    test("should reject string", () => {
      const result = I18nEntrySchema.safeParse("hello")
      expect(result.success).toBe(false)
    })

    test("should reject array", () => {
      const result = I18nEntrySchema.safeParse(["en_US", "hello"])
      expect(result.success).toBe(false)
    })

    test("should reject null", () => {
      const result = I18nEntrySchema.safeParse(null)
      expect(result.success).toBe(false)
    })

    test("should reject undefined", () => {
      const result = I18nEntrySchema.safeParse(undefined)
      expect(result.success).toBe(false)
    })

    test("should reject number", () => {
      const result = I18nEntrySchema.safeParse(123)
      expect(result.success).toBe(false)
    })

    test("should reject boolean", () => {
      const result = I18nEntrySchema.safeParse(true)
      expect(result.success).toBe(false)
    })
  })

  describe("require en_US key", () => {
    test("should reject empty object", () => {
      const result = I18nEntrySchema.safeParse({})
      expect(result.success).toBe(false)
    })

    test("should reject object without en_US", () => {
      const result = I18nEntrySchema.safeParse({ zh_CN: "你好" })
      expect(result.success).toBe(false)
    })

    test("should accept object with only en_US", () => {
      const result = I18nEntrySchema.safeParse({ en_US: "Hello" })
      expect(result.success).toBe(true)
    })
  })

  describe("require string values", () => {
    test("should reject non-string value for en_US", () => {
      const result = I18nEntrySchema.safeParse({ en_US: 123 })
      expect(result.success).toBe(false)
    })

    test("should reject non-string value for other locales", () => {
      const result = I18nEntrySchema.safeParse({ en_US: "Hello", zh_CN: 123 })
      expect(result.success).toBe(false)
    })

    test("should reject null value", () => {
      const result = I18nEntrySchema.safeParse({ en_US: null })
      expect(result.success).toBe(false)
    })

    test("should reject array value", () => {
      const result = I18nEntrySchema.safeParse({ en_US: ["Hello"] })
      expect(result.success).toBe(false)
    })
  })

  describe("locale format validation", () => {
    test("should reject single-segment locale", () => {
      const result = I18nEntrySchema.safeParse({ en_US: "Hello", en: "Hello" })
      expect(result.success).toBe(false)
    })

    test("should reject lowercase second segment", () => {
      const result = I18nEntrySchema.safeParse({ en_US: "Hello", en_us: "Hello" })
      expect(result.success).toBe(false)
    })

    test("should reject three-segment locale", () => {
      const result = I18nEntrySchema.safeParse({ en_US: "Hello", en_US_Latn: "Hello" })
      expect(result.success).toBe(false)
    })

    test("should reject empty locale key", () => {
      const result = I18nEntrySchema.safeParse({ en_US: "Hello", "": "Empty" })
      expect(result.success).toBe(false)
    })
  })

  describe("valid i18n entries", () => {
    test("should accept valid single locale", () => {
      const result = I18nEntrySchema.safeParse({ en_US: "Hello" })
      expect(result.success).toBe(true)
    })

    test("should accept valid multiple locales", () => {
      const result = I18nEntrySchema.safeParse({
        en_US: "Hello",
        zh_CN: "你好",
        ja_JP: "こんにちは",
      })
      expect(result.success).toBe(true)
    })

    test("should accept script-based locale", () => {
      const result = I18nEntrySchema.safeParse({
        en_US: "Hello",
        zh_Hant: "你好",
      })
      expect(result.success).toBe(true)
    })

    test("should accept empty string value", () => {
      const result = I18nEntrySchema.safeParse({ en_US: "" })
      expect(result.success).toBe(true)
    })
  })
})
