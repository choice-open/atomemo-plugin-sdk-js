import { isFunction } from "es-toolkit/predicate"
import type { Feature } from "../core/provider"

/**
 * Serializes a Feature object by removing any function-type properties.
 *
 * @param feature - The Feature object to serialize.
 * @returns An object with only non-function properties of the Feature.
 */
export const serializeFeature = (feature: Feature) => {
  // biome-ignore lint/suspicious/noExplicitAny: Type is not critical for serialized data
  return Object.keys(feature).reduce<Record<string, any>>((finale, key) => {
    const value = feature[key as keyof typeof feature]

    if (isFunction(value)) {
      return finale
    }

    return Object.assign(finale, { [key]: value })
  }, {})
}
