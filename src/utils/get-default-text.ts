import { assert } from "es-toolkit/util"
import type { I18nText } from "../plugin"

/**
 * Returns the text for the given locale from an I18nText object.
 *
 * @param text - The I18nText object to extract the text from.
 * @param locale - The locale key to retrieve (defaults to "en_US").
 * @returns The localized string for the specified locale.
 * @throws Error if the specified locale key is not present in the text.
 */
export const getDefaultText = (text: I18nText, locale = "en_US"): string => {
  assert(text[locale], `I18n text requires at least "en_US" key.`)
  return text[locale]
}
