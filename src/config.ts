import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import { z } from "zod"

const ConfigSchema = z.object({
  auth: z
    .record(
      z.enum(["staging", "production"]),
      z.object({
        endpoint: z.url().optional(),
        access_token: z.string().optional(),
      }),
    )
    .optional(),
  hub: z
    .record(
      z.enum(["staging", "production"]),
      z.object({
        endpoint: z.url().optional(),
      }),
    )
    .optional(),
})

export type Config = z.infer<typeof ConfigSchema>

const CONFIG_PATH = join(homedir(), ".choiceform", "atomemo.json")

/**
 * Reads and parses the atomemo.json config file from the user's home directory.
 *
 * @returns The parsed config object, or undefined if the file doesn't exist.
 * @throws If the file exists but contains invalid JSON or doesn't match the schema.
 */
export function readConfig(): Config | undefined {
  try {
    const content = readFileSync(CONFIG_PATH, "utf-8")
    const json = JSON.parse(content)
    return ConfigSchema.parse(json)
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      // File doesn't exist
      return undefined
    }
    // Re-throw other errors (parse errors, schema validation errors, etc.)
    throw error
  }
}
