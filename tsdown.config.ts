import { defineConfig } from "tsdown"

export default defineConfig({
  dts: true,
  entry: ["src/index.ts", "src/types.ts"],
  exports: {
    devExports: false,
  },
  format: "esm",
  inlineOnly: ["es-toolkit"],
  sourcemap: true,
})
