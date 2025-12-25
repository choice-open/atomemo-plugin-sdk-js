import type { z } from "zod"
import type { PluginManifestSchema } from "./schemas"

export interface PluginManifest extends z.input<typeof PluginManifestSchema> {}