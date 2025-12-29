import { isFunction, isMap } from "es-toolkit/predicate"
import type { ProviderStore } from "../core/registry"
import { serializeFeature } from "./serialize-feature"

/**
 * Serializes a ProviderStore object into a JSON-like structure,
 * omitting any function properties and recursively serializing
 * Map-based feature collections using serializeFeature.
 *
 * @param provider - The ProviderStore object to serialize.
 * @returns An object with only serializable, non-function properties, and denormalized feature maps.
 */
export const serializeProvider = (provider: ProviderStore) => {
  // biome-ignore lint/suspicious/noExplicitAny: Type is not critical for serialized data
  return Object.keys(provider).reduce<Record<string, any>>((finale, key) => {
    const value = provider[key as keyof ProviderStore]

    if (isFunction(value)) {
      return finale
    }

    if (isMap(value)) {
      return Object.assign(finale, {
        // biome-ignore lint/suspicious/noExplicitAny: Type is not critical for serialized data
        [key]: Array.from(value.values()).reduce<Record<string, any>>(
          (finale, feature) =>
            Object.assign(finale, {
              [feature.name.en_US]: serializeFeature(feature),
            }),
          {},
        ),
      })
    }

    return Object.assign(finale, { [key]: value })
  }, {})
}
