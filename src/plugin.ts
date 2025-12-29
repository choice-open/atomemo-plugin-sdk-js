import chalk from "chalk"
import { logger } from "./core/logger"
import {
  createProvider,
  type Provider,
  type ProviderManager,
} from "./core/provider"
import { createRegistry } from "./core/registry"
import { createTransporter, type TransporterOptions } from "./core/transporter"

export interface I18nText {
  en_US: string
  [key: string]: string | undefined
}

interface PluginOptions<Locales> {
  /**
   * The locales to support. Defaults to ["en_US"] and "en_US" is required.
   */
  locales: Locales
  /**
   * The options for the transporter.
   */
  transporterOptions?: TransporterOptions
}

const log = logger.child({ name: "Phoenix" })

/**
 * Creates a new plugin instance with the specified options.
 *
 * @param options - The options for configuring the plugin instance.
 * @returns An object containing methods to define providers and run the plugin process.
 *
 * @property defineProvider
 *   Defines and registers a new provider within the plugin registry.
 *   @param provider - The provider to define.
 *   @returns An object implementing ProviderManager, allowing adding features to the provider.
 *
 * @property run
 *   Starts the plugin's main process by establishing a transporter connection and
 *   setting up signal handlers (SIGINT, SIGTERM) for graceful shutdown.
 */
export function createPlugin<Locales extends string[]>(
  options: PluginOptions<Locales>,
) {
  const registry = createRegistry()
  const transporter = createTransporter(options.transporterOptions)

  return {
    /**
     * Defines and registers a new provider within the plugin registry.
     *
     * @param provider - The provider to define.
     * @returns A ProviderManager object, allowing methods to add features to the provider.
     */
    defineProvider: (provider: Provider): ProviderManager => {
      return createProvider(provider, registry)
    },

    /**
     * Starts the plugin's main process. This establishes the transporter connection and
     * sets up signal handlers for graceful shutdown on SIGINT and SIGTERM.
     */
    run: () => {
      const { channel, dispose } = transporter.connect()

      channel.push("shout", registry.serialize())

      channel.on("shout", async (message) => {
        if (message.providerName && message.featureName) {
          const { providerName, featureName } = message
          const feature = registry.resolve("tool", providerName, featureName)
          const response = await feature.invoke.apply(null, message.args)

          const data = chalk.blueBright(JSON.stringify(response, null, 2))
          log.trace(`${providerName}-${featureName} response:\n${data}`)
        }
      })

      void ["SIGINT", "SIGTERM"].forEach((signal) => {
        void process.on(signal, dispose)
      })
    },
  }
}
