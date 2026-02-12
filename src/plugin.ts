import {
  CredentialDefinitionSchema,
  ModelDefinitionSchema,
  ToolDefinitionSchema,
} from "@choiceopen/atomemo-plugin-schema/schemas"
import type { PluginDefinition } from "@choiceopen/atomemo-plugin-schema/types"
import { isNil } from "es-toolkit"
import { z } from "zod"
import { getEnv } from "./env"
import { getSession } from "./oneauth"
import { createRegistry } from "./registry"
import { createTransporter, type TransporterOptions } from "./transporter"

const CredentialAuthenticateMessage = z.object({
  request_id: z.string(),
  credential: z.record(z.string(), z.any()),
  credential_name: z.string(),
  extra: z.record(z.string(), z.any()),
})

const ToolInvokeMessage = z.object({
  request_id: z.string(),
  tool_name: z.string(),
  parameters: z.record(z.string(), z.any()),
  credentials: z.record(z.string(), z.string()).optional(),
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
  const isDebugMode = env.HUB_MODE === "debug"

  if (isDebugMode && !env.HUB_ORGANIZATION_ID) {
    console.error("DEBUG API Key is invalid. Please run `atomemo plugin refresh-key`")
    process.exit(1)
  }

  let user: { name: string; email: string; inherentOrganizationId?: string }

  if (isDebugMode) {
    // Fetch user session and validate organization
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
  } else {
    const definition = z
      .looseObject({ author: z.string(), email: z.string() })
      .parse(await Bun.file("definition.json").json())
    user = { name: definition.author, email: definition.email }
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
      const topic = isDebugMode
        ? `debug_plugin:${registry.plugin.name}`
        : `release_plugin:${pluginDefinition.organization_id}__${registry.plugin.name}__${env.HUB_MODE}__${pluginDefinition.version}`
      const { channel, dispose } = await transporter.connect(topic)

      if (isDebugMode) {
        const definition = registry.serialize().plugin
        channel.push("register_plugin", definition)
        await Bun.write("definition.json", JSON.stringify(definition, null, 2))
      }

      channel.on("credential_auth_spec", async (message) => {
        const request_id = message.request_id

        try {
          const event = CredentialAuthenticateMessage.parse(message)
          const definition = registry.resolve("credential", event.credential_name)
          if (isNil(definition.authenticate)) {
            throw new Error("Credential authenticate method is not implemented")
          }

          const AuthenticateMethodWrapper = CredentialDefinitionSchema.shape.authenticate.unwrap()
          const authenticate = AuthenticateMethodWrapper.implementAsync(definition.authenticate)

          const { credential, extra } = event
          const data = await authenticate({ args: { credential, extra } })

          channel.push("credential_auth_spec_response", { request_id, data })
        } catch (error) {
          if (error instanceof Error) {
            channel.push("credential_auth_spec_error", { request_id, ...error })
          } else {
            channel.push("credential_auth_spec_error", {
              request_id,
              message: "Unexpected Error",
            })
          }
        }
      })

      channel.on("invoke_tool", async (message) => {
        const request_id = message.request_id

        try {
          const event = ToolInvokeMessage.parse(message)
          const { credentials, parameters } = event
          const definition = registry.resolve("tool", event.tool_name)

          const InvokeMethodWrapper = ToolDefinitionSchema.shape.invoke
          const invoke = InvokeMethodWrapper.implementAsync(definition.invoke)

          const data = await invoke({ args: { credentials, parameters } })
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
