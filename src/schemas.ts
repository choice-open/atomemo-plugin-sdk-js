import * as z from "zod"

export const PluginManifestSchema = z.object({
  /** The name of the plugin. Must be a valid package name, optionally scoped. */
  name: z
    .string()
    .regex(
      /^(@[a-z0-9][a-z0-9-_]{0,213}\/)?[a-z0-9][a-z0-9-_.]{1,213}[a-z0-9]$/,
      "Name must be a valid package name, optionally scoped",
    )
    .meta({ description: "The name of the plugin" }),
  version: z
    .string()
    .regex(
      /^\d+\.\d+\.\d+(-[0-9A-Za-z-.]+)?(\+[0-9A-Za-z-.]+)?$/,
      "Version must be a valid semver value",
    )
    .meta({ description: "The version of the plugin" }),
  description: z
    .string()
    .meta({ description: "The description of the plugin" }),
  author: z.string().meta({ description: "The author of the plugin" }),
  email: z.email().meta({ description: "The email of the author" }),
  repository: z
    .string()
    .optional()
    .meta({ description: "The repository of the plugin" }),
  license: z
    .string()
    .optional()
    .default("license.md")
    .meta({ description: "The license file of the plugin" }),
  privacy: z
    .string()
    .optional()
    .default("privacy.md")
    .meta({ description: "The privacy file of the plugin" }),
  createdAt: z.iso
    .datetime({ precision: 3 })
    .meta({ description: "The creation date of the plugin" }),
})
