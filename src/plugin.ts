import { PluginManifestSchema } from "./schemas"
import type { PluginManifest } from "./types"

export class Plugin {
  constructor(readonly manifest: PluginManifest) {
    this.manifest = PluginManifestSchema.parse(manifest)

    void ["SIGINT", "SIGTERM"].forEach((signal) => {
      process.on(signal, () => {
        this.dispose()
        process.exit(0)
      })
    })
  }

  dispose() {
    console.info(`${this.manifest.name} is shutting down...`)
  }

  run() {
    console.info(`${this.manifest.name} is running...`)
    console.debug(Bun.inspect(this.manifest, { colors: true }))
  }
}
