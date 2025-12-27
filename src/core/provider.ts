import type { I18nText } from "../plugin"
import type { Registry } from "./registry"

interface NamedEntity {
  name: I18nText
  description: I18nText
}

export interface Provider extends NamedEntity {}

export interface Feature extends NamedEntity {
  // biome-ignore lint/suspicious/noExplicitAny: Any is OK for the invoke function
  invoke: (context: any) => Promise<any>
}

export interface ProviderManager {
  /**
   * Adds a new tool to the provider in the registry.
   *
   * @param tool - The tool to add.
   * @throws Error if the tool is not registered.
   */
  addTool: (tool: Feature) => void
}

export function createProvider(
  provider: Provider,
  registry: Registry,
): ProviderManager {
  registry.registerProvider(provider)

  return {
    addTool: (tool: Feature) => {
      registry.registerFeature("tool", tool, provider.name.en_US)
    },
  }
}
