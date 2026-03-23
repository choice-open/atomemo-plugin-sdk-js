import { ResourceLocatorValueSchema } from "@choiceopen/atomemo-plugin-schema/schemas"
import type { ResourceLocatorValue } from "@choiceopen/atomemo-plugin-schema/types"

/**
 * Extracts the raw string value from a ResourceLocatorValue.
 *
 * When `mode_name` is `"url"` and a `urlRegex` is provided, the regex is applied
 * to the URL value and the first capture group is returned.
 *
 * @param value - The raw input to parse and extract from.
 * @param urlRegex - Optional regex applied to the value when `mode_name` is `"url"`.
 *                   The first capture group is used as the extracted value.
 * @returns The extracted string value, or null if the locator has no value.
 * @throws {ZodError} If the input is not a valid ResourceLocatorValue.
 * @throws {Error} If `urlRegex` is provided, mode is `"url"`, but the regex does not match.
 */
export function extractResourceLocator(value: unknown, urlRegex?: RegExp): string | null {
  const parsed: ResourceLocatorValue = ResourceLocatorValueSchema.parse(value)

  if (parsed.mode_name === "url" && urlRegex !== undefined && parsed.value !== null) {
    const match = urlRegex.exec(parsed.value)
    if (!match) {
      throw new Error(`URL value "${parsed.value}" did not match regex ${urlRegex}`)
    }
    return match[1] ?? match[0]
  }

  return parsed.value
}
