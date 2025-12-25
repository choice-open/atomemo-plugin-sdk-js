import { defineConfig } from "tsdown"

export default defineConfig({
  dts: true,
  entry: ["src/index.ts", "src/types.ts"],
  exports: {
    devExports: "development",
  },
  format: "esm",
  platform: "neutral",
})
