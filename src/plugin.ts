import { z } from "zod"
import { createRegistry } from "./core/registry"
import { createTransporter } from "./core/transporter"
import { CredentialDefinitionSchema, ModelDefinitionSchema, ToolDefinitionSchema } from "./schemas"
import type {
  CredentialDefinition,
  ModelDefinition,
  PluginDefinition,
  ToolDefinition,
} from "./types"

const JsonValueSchema = z.json()
export type JsonValue = z.infer<typeof JsonValueSchema>

const ToolInvokeMessage = z.object({
  request_id: z.string(),
  plugin_name: z.string(),
  tool_name: z.string(),
  parameters: z.json(),
})

/**
 * Creates a new plugin instance with the specified options.
 *
 * @param options - The options for configuring the plugin instance.
 * @returns An object containing methods to define providers and run the plugin process.
 */
export function createPlugin<Locales extends string[]>(options: PluginDefinition<Locales>) {
  const { transporterOptions, version = process.env.npm_package_version, ...plugin } = options
  const registry = createRegistry(Object.assign(plugin, { version }))
  const transporter = createTransporter(transporterOptions)

  return {
    /**
     * Adds a new credential definition in the registry.
     *
     * @param credential - The credential to add.
     * @throws Error if the credential is not registered.
     */
    addCredential: (credential: CredentialDefinition) => {
      const definition = CredentialDefinitionSchema.parse(credential)
      registry.register("credential", definition)
    },

    /**
     * Adds a new tool definition in the registry.
     *
     * @param tool - The tool to add.
     * @throws Error if the tool is not registered.
     */
    addTool: (tool: ToolDefinition) => {
      const definition = ToolDefinitionSchema.parse(tool)
      registry.register("tool", definition)
    },

    /**
     * Adds a new model definition in the registry.
     *
     * @param model - The model to add.
     * @throws Error if the model is not registered.
     */
    addModel: (model: ModelDefinition) => {
      const definition = ModelDefinitionSchema.parse(model)
      registry.register("model", definition)
    },

    /**
     * Starts the plugin's main process. This establishes the transporter connection and
     * sets up signal handlers for graceful shutdown on SIGINT and SIGTERM.
     */
    run: async () => {
      console.debug(Bun.env.NODE_ENV)
      const { channel, dispose } = await transporter.connect(`debug_plugin:${registry.plugin.name}`)

      channel.push("register_plugin", registry.serialize().plugin)

      channel.on("invoke_tool", async (message) => {
        const request_id = message.request_id

        try {
          const event = ToolInvokeMessage.parse(message)
          const tool = registry.resolve("tool", event.tool_name)
          const data = await tool.invoke({ args: event.parameters })
          channel.push("invoke_tool_response", { request_id, data })
        } catch (error) {
          if (error instanceof Error) {
            channel.push("invoke_tool_error", { request_id, ...error })
          } else {
            channel.push("invoke_tool_error", { request_id, message: "Unexpected Error" })
          }
        }
      })

      void ["SIGINT", "SIGTERM"].forEach((signal) => {
        void process.on(signal, dispose)
      })
    },
  }
}
