import { isNil } from "es-toolkit/predicate"
import z from "zod"

declare module "bun" {
  interface Env {
    /** The URL of the Hub Server WebSocket. */
    readonly HUB_SERVER_WS_URL: string | undefined
    /** Whether to enable debug mode. */
    readonly DEBUG: boolean
    /** The API key for the Hub Server. */
    readonly DEBUG_API_KEY: string | undefined
    /** The organization ID for the plugin. */
    readonly ORGANIZATION_ID: string | undefined
  }
}

const EnvSchema = z.object({
  HUB_SERVER_WS_URL: z.url({
    protocol: /wss?/,
    error: "HUB_SERVER_WS_URL must be a valid WebSocket URL.",
  }),
  DEBUG_API_KEY: z
    .string({
      error: "DEBUG_API_KEY must be a string.",
    })
    .meta({ description: `The API key for the Hub Server` }),
  DEBUG: z
    .string()
    .optional()
    .transform((value) => {
      return isNil(value) ? process.env.NODE_ENV !== "production" : value.toLowerCase() === "true"
    })
    .meta({
      description: `Whether to enable debug mode. This will be enabled automatically when NODE_ENV is not "production". The value must be "true" (case-insensitive) to enable debug mode, otherwise it will be treated as false.`,
    }),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development").meta({
    description: `The environment mode. This will be "development" by default.`,
  }),
  ORGANIZATION_ID: z
    .string()
    .optional()
    .meta({ description: `The organization ID for the plugin.` }),
})

let env: z.infer<typeof EnvSchema> | undefined

export function getEnv() {
  if (isNil(env)) {
    const result = EnvSchema.safeParse(process.env)

    if (!result.success) {
      console.error(z.prettifyError(result.error))
      process.exit(1)
    }

    env = result.data
  }

  return env
}
