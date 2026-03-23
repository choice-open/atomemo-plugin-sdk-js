import { ResourceMapperValueSchema } from "@choiceopen/atomemo-plugin-schema/schemas"
import type { ResourceMapperValue } from "@choiceopen/atomemo-plugin-schema/types"

/**
 * Extracts the value from a ResourceMapperValue.
 *
 * @param value - The raw input to parse and extract from.
 * @returns The extracted mapping value, or null if no value is set.
 * @throws {ZodError} If the input is not a valid ResourceMapperValue.
 */
export function extractResourceMapper(
  value: unknown,
): Record<string, unknown> | string | null {
  const parsed: ResourceMapperValue = ResourceMapperValueSchema.parse(value)
  if(typeof parsed.value === "string") {
    throw new Error(`Expected ResourceMapperValue to have an object value, but got string: ${parsed.value}`)
  }
  return parsed.value as Record<string, unknown> | null
}
