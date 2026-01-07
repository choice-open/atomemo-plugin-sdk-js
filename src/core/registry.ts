import { assert } from "es-toolkit"
import type { JsonValue, Simplify } from "type-fest"
import type {
  CredentialDefinition,
  DataSourceDefinition,
  Feature,
  ModelDefinition,
  PluginDefinition,
  ToolDefinition,
} from "../types"
import { serializeFeature } from "../utils/serialize-feature"

type PluginRegistry = Simplify<Omit<PluginDefinition, "transporterOptions">>

interface RegistryStore {
  plugin: PluginRegistry
  credential: Map<CredentialDefinition["name"], CredentialDefinition>
  data_source: Map<DataSourceDefinition["name"], DataSourceDefinition>
  model: Map<ModelDefinition["name"], ModelDefinition>
  tool: Map<ToolDefinition["name"], ToolDefinition>
}

export type FeatureType = keyof Pick<RegistryStore, "credential" | "data_source" | "model" | "tool">

export interface Registry {
  /**
   * Registers a feature (credential, data source, model, or tool) into the registry.
   *
   * @param type - The type of the feature to register ("credential", "data_source", "model", or "tool").
   * @param feature - The feature definition to register.
   */
  register: {
    (type: "credential", feature: CredentialDefinition): void
    (type: "data_source", feature: DataSourceDefinition): void
    (type: "model", feature: ModelDefinition): void
    (type: "tool", feature: ToolDefinition): void
  }

  /**
   * Resolves and retrieves a registered feature (credential, data source, model, or tool) by its type and name.
   *
   * @param type - The type of the feature ("credential", "data_source", "model", or "tool").
   * @param featureName - The name of the feature to resolve.
   * @returns The resolved feature definition.
   * @throws If the feature is not registered.
   */
  resolve: {
    (type: "credential", featureName: string): CredentialDefinition
    (type: "data_source", featureName: string): DataSourceDefinition
    (type: "model", featureName: string): ModelDefinition
    (type: "tool", featureName: string): ToolDefinition
  }

  /**
   * Serializes the registry into a JSON-like object.
   *
   * @returns The serialized registry.
   */
  serialize: () => {
    plugin: PluginRegistry & Record<`${FeatureType}s`, Array<Record<string, JsonValue>>>
  }
}

export function createRegistry(plugin: PluginRegistry): Registry {
  const store: RegistryStore = {
    plugin,
    credential: new Map(),
    data_source: new Map(),
    model: new Map(),
    tool: new Map(),
  }

  function register(type: "credential", feature: CredentialDefinition): void
  function register(type: "data_source", feature: DataSourceDefinition): void
  function register(type: "model", feature: ModelDefinition): void
  function register(type: "tool", feature: ToolDefinition): void
  // biome-ignore lint/suspicious/noExplicitAny: any is used to avoid type errors
  function register(type: FeatureType, feature: any): void {
    store[type].set(feature.name, feature)
  }

  function resolve(type: "credential", featureName: string): CredentialDefinition
  function resolve(type: "data_source", featureName: string): DataSourceDefinition
  function resolve(type: "model", featureName: string): ModelDefinition
  function resolve(type: "tool", featureName: string): ToolDefinition
  function resolve(type: FeatureType, featureName: string): Feature {
    const feature = store[type].get(featureName)
    assert(feature, `Feature "${featureName}" not registered`)
    return feature
  }

  return {
    register,
    resolve,
    serialize: () => {
      assert(store.plugin, "Plugin is not registered")

      return {
        plugin: Object.assign(store.plugin, {
          credentials: Array.from(store.credential.values()).map(serializeFeature),
          data_sources: Array.from(store.data_source.values()).map(serializeFeature),
          models: Array.from(store.model.values()).map(serializeFeature),
          tools: Array.from(store.tool.values()).map(serializeFeature),
        }),
      }
    },
  }
}
