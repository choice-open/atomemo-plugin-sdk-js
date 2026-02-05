import {
  CredentialDefinitionSchema,
  ModelDefinitionSchema,
  ToolDefinitionSchema,
} from "@choiceopen/atomemo-plugin-schema/schemas"
import type { PluginDefinition } from "@choiceopen/atomemo-plugin-schema/types"
import { z } from "zod"
import { getEnv } from "./env"
import { getSession } from "./oneauth"
import { createRegistry } from "./registry"
import { createTransporter, type TransporterOptions } from "./transporter"

const ToolInvokeMessage = z.object({
  request_id: z.string(),
  tool_name: z.string(),
  parameters: z.json(),
  credentials: z.json(),
})

type CredentialDefinition = z.infer<typeof CredentialDefinitionSchema>
type ToolDefinition = z.infer<typeof ToolDefinitionSchema>
type ModelDefinition = z.infer<typeof ModelDefinitionSchema>

/**
 * Creates a new plugin instance with the specified options.
 *
 * @param options - The options for configuring the plugin instance.
 * @returns An object containing methods to define providers and run the plugin process.
 */
export async function createPlugin<Locales extends string[]>(
  options: PluginDefinition<Locales, TransporterOptions>,
) {
  // Validate organization ID before creating registry
  const env = getEnv()
  if (!env.HUB_ORGANIZATION_ID) {
    console.error("DEBUG API Key is invalid. Please run `atomemo plugin refresh-key`")
    process.exit(1)
  }

  // Fetch user session and validate organization
  let user: { name: string; email: string; inherentOrganizationId?: string }
  try {
    const sessionData = await getSession()
    user = sessionData.user

    if (user.inherentOrganizationId !== env.HUB_ORGANIZATION_ID) {
      console.info(
        "Atomemo does not currently support developing plugins for other organizations. Please wait for official support.",
      )
      process.exit(0)
    }
  } catch (error) {
    console.error("Failed to fetch session:", error instanceof Error ? error.message : error)
    process.exit(1)
  }

  // Merge user info into plugin options
  const { transporterOptions, version = process.env.npm_package_version, ...plugin } = options
  const pluginDefinition = Object.assign(plugin, {
    author: user.name,
    email: user.email,
    organization_id: env.HUB_ORGANIZATION_ID,
    version,
  })

  const registry = createRegistry(pluginDefinition)
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
      const { channel, dispose } = await transporter.connect(`debug_plugin:${registry.plugin.name}`)

      if (env.HUB_MODE === "debug") {
        const definition = registry.serialize().plugin
        channel.push("register_plugin", definition)
        await Bun.write("definition.json", JSON.stringify(definition, null, 2))
      }

      channel.on("invoke_tool", async (message) => {
        const request_id = message.request_id

        try {
          const event = ToolInvokeMessage.parse(message)
          const tool = registry.resolve("tool", event.tool_name)
          const { credentials, parameters } = event
          const data = await tool.invoke({ args: { credentials, parameters } })
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
