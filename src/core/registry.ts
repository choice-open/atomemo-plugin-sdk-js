import { assert } from "es-toolkit/util"
import type { I18nText } from "../plugin"
import { getDefaultText } from "../utils/get-default-text"
import { serializeProvider } from "../utils/serialize-provider"
import type { Feature, Provider } from "./provider"

interface RegistryStore {
  provider: Map<I18nText["en_US"], ProviderStore>
}

export interface ProviderStore {
  name: I18nText
  tool: Map<I18nText["en_US"], Feature>
}

export type FeatureType = keyof Pick<ProviderStore, "tool">

export interface Registry {
  /**
   * Registers a new provider in the registry.
   *
   * @param provider - The provider to register.
   * @throws Error if the provider with the same name (en_US) is already registered.
   */
  registerProvider: (provider: Provider) => void

  /**
   * Registers a new feature for a specific provider in the registry.
   *
   * @param type - The type of feature to register.
   * @param feature - The feature to register.
   * @param providerName - The name of the provider to register the feature for.
   * @throws Error if the provider is not registered.
   */
  registerFeature: (
    type: FeatureType,
    feature: Feature,
    providerName: I18nText["en_US"],
  ) => void

  /**
   * Resolves a feature from the registry by its type, provider name, and feature name.
   *
   * @param type - The type of feature to resolve.
   * @param providerName - The name of the provider to resolve the feature for.
   * @param featureName - The name of the feature to resolve.
   * @returns The resolved feature.
   * @throws Error if the provider is not registered or the feature is not registered.
   */
  resolve: (
    type: FeatureType,
    providerName: I18nText["en_US"],
    featureName: I18nText["en_US"],
  ) => Feature

  /**
   * Serializes the registry into a JSON-like object.
   *
   * @returns The serialized registry.
   */
  // biome-ignore lint/suspicious/noExplicitAny: Type is not critical for serialized data
  serialize: () => Record<string, any>
}

export function createRegistry(): Registry {
  const store: RegistryStore = { provider: new Map() }

  return {
    registerProvider: (provider: Provider) => {
      const providerName = getDefaultText(provider.name)
      const unregistered = !store.provider.has(providerName)
      assert(unregistered, `Provider "${providerName}" already registered.`)

      store.provider.set(providerName, { name: provider.name, tool: new Map() })
    },

    registerFeature: (
      type: FeatureType,
      feature: Feature,
      providerName: I18nText["en_US"],
    ) => {
      const provider = store.provider.get(providerName)
      assert(provider, `Provider "${providerName}" not registered.`)

      provider[type].set(getDefaultText(feature.name), feature)
    },

    resolve: (
      type: FeatureType,
      providerName: I18nText["en_US"],
      featureName: I18nText["en_US"],
    ) => {
      const provider = store.provider.get(providerName)
      assert(provider, `Provider "${providerName}" not registered.`)

      const feature = provider[type].get(featureName)
      assert(feature, `Feature "${featureName}" not registered.`)

      return feature
    },

    serialize: () => {
      // biome-ignore lint/suspicious/noExplicitAny: Type is not critical for serialized data
      return Array.from(store.provider.values()).reduce<Record<string, any>>(
        (finale, provider) =>
          Object.assign(finale, {
            [provider.name.en_US]: serializeProvider(provider),
          }),
        {},
      )
    },
  }
}
