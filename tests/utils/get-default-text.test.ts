import { describe, expect, test } from "bun:test"
import type { I18nText } from "../../src/plugin"
import { getDefaultText } from "../../src/utils/get-default-text"

describe("getDefaultText", () => {
  test("should return text for default locale (en_US)", () => {
    const text: I18nText = {
      en_US: "Hello",
    }
    expect(getDefaultText(text)).toBe("Hello")
  })

  test("should return text for specified locale", () => {
    const text: I18nText = {
      en_US: "Hello",
      zh_CN: "你好",
    }
    expect(getDefaultText(text, "zh_CN")).toBe("你好")
  })

  test("should return text for en_US when locale is explicitly en_US", () => {
    const text: I18nText = {
      en_US: "Hello",
      zh_CN: "你好",
    }
    expect(getDefaultText(text, "en_US")).toBe("Hello")
  })

  test("should throw error when locale does not exist", () => {
    const text: I18nText = {
      en_US: "Hello",
    }
    expect(() => getDefaultText(text, "fr_FR")).toThrow(
      'I18n text requires at least "en_US" key.',
    )
  })

  test("should throw error when en_US is missing", () => {
    const text = {
      zh_CN: "你好",
    }
    // @ts-expect-error - Test case
    expect(() => getDefaultText(text)).toThrow(
      'I18n text requires at least "en_US" key.',
    )
  })

  test("should handle multiple locales", () => {
    const text: I18nText = {
      en_US: "Hello",
      zh_CN: "你好",
      ja_JP: "こんにちは",
      es_ES: "Hola",
    }
    expect(getDefaultText(text, "ja_JP")).toBe("こんにちは")
    expect(getDefaultText(text, "es_ES")).toBe("Hola")
  })
})
