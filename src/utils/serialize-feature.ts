import { isFunction } from "es-toolkit/predicate"
import type { JsonValue } from "type-fest"

/**
 * Serializes a Feature object by removing any function-type properties.
 *
 * @param feature - The Feature object to serialize.
 * @returns An object with only non-function properties of the Feature.
 */
export const serializeFeature = (feature: Record<string, unknown>) => {
  return Object.keys(feature).reduce<Record<string, JsonValue>>((finale, key) => {
    const value = feature[key]

    if (isFunction(value)) {
      return finale
    }

    return Object.assign(finale, { [key]: value as JsonValue })
  }, {})
}
