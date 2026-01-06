import { isPlainObject } from "es-toolkit/predicate"
import type { IsEqual } from "type-fest"
import { z } from "zod"
import type {
  BaseDefinition,
  CredentialDefinition,
  I18nText,
  ModelDefinition,
  PluginDefinition,
  ToolDefinition,
} from "../types"
import { NodePropertySchema } from "./node-property"

/**
 * I18n 词条模式
 *
 * NOTE: Zod 无法定义复杂的字面量模版，此处使用 `z.custom` 实现自定义验证
 */
export const I18nEntrySchema = z.custom<I18nText>((value) => {
  // 必须是对象字面量
  if (!isPlainObject(value)) return false
  // 必须包含 en_US 键
  if (!("en_US" in value)) return false

  for (const [locale, text] of Object.entries(value)) {
    // 值必须是字符串
    if (typeof text !== "string") return false

    // NOTE: 支持的语言码并不严格符合标准，因为 TS 字面量模版无法描述所有可能的情况
    //       故以下仅对满足需求的子集做简单检查而不是严格的 RFC 5646 标准检查
    const parts = locale.split("_")
    // 其它语言代码必须符合格式：<语言代码>_<国家或脚本代码>，且第二部份首字母必须大写
    if (parts.length !== 2 || parts[1][0] !== parts[1][0].toUpperCase()) {
      return false
    }
  }
  return true
}, "Invalid I18n entry")
{
  const _: IsEqual<z.infer<typeof I18nEntrySchema>, I18nText> = true
}

/**
 * 基础定义模式
 *
 * 此为所有功能定义模式的基类，定义了通用的属性，不单独使用
 */
export const BaseDefinitionSchema = z.object({
  name: z.string(),
  display_name: I18nEntrySchema,
  description: I18nEntrySchema,
  icon: z.union([z.string(), z.instanceof(URL)]),
  parameters: z.array(NodePropertySchema),
  settings: z.array(NodePropertySchema).optional(),
})
{
  const _: IsEqual<z.infer<typeof BaseDefinitionSchema>, BaseDefinition> = true
}

export const PluginDefinitionSchema = z.object({
  ...BaseDefinitionSchema.omit({ parameters: true, settings: true }).shape,
  locales: z.array(z.string()),
})
{
  const _: IsEqual<
    z.infer<typeof PluginDefinitionSchema>,
    Omit<PluginDefinition, "transporterOptions"> // not necessary to verify transpoterOptions
  > = true
}

export const CredentialDefinitionSchema = z.object({
  ...BaseDefinitionSchema.omit({ settings: true }).shape,
  type: z.literal("credential"),
})
{
  const _: IsEqual<z.infer<typeof CredentialDefinitionSchema>, CredentialDefinition> = true
}

export const DataSourceDefinitionSchema = z.object({
  ...BaseDefinitionSchema.shape,
})

export type DataSourceDefinition = z.infer<typeof DataSourceDefinitionSchema>

export const ModelDefinitionSchema = z.object({
  ...BaseDefinitionSchema.omit({ parameters: true, settings: true }).shape,
  type: z.literal("model"),
  name: z.string().refine(
    (value) => {
      const schema = z.templateLiteral([z.string(), z.literal("/"), z.string()])
      return schema.safeParse(value).success
    },
    { error: "Invalid model name, should be in the format of `model_provider/model_name`" },
  ),
  model_type: z.literal("llm"),
  default_endpoint: z.string().optional(),
  context_window: z.number(),
  input_modalities: z.array(z.enum(["file", "image", "text"])),
  output_modalities: z.array(z.enum(["text"])),
  pricing: z
    .object({
      currency: z.string().optional(),
      input: z.number().optional(),
      input_cache_read: z.number().optional(),
      input_cache_write: z.number().optional(),
      output: z.number().optional(),
      request: z.number().optional(),
    })
    .optional(),
  unsupported_parameters: z.array(
    z.enum([
      "endpoint",
      "temperature",
      // "top_p",
      // "top_k",
      "frequency_penalty",
      // "presence_penalty",
      // "repetition_penalty",
      // "min_p",
      // "top_a",
      "seed",
      "max_tokens",
      // "logit_bias",
      // "logprobs",
      // "top_logprobs",
      // "response_format",
      // "json_response",
      "json_schema",
      "stream",
      "stream_options",
      "structured_outputs",
      // "stop",
      // "tools",
      // "tool_choice",
      "parallel_tool_calls",
      "verbosity",
    ]),
  ),
})
{
  const _: IsEqual<z.infer<typeof ModelDefinitionSchema>, ModelDefinition> = true
}

export const ToolDefinitionSchema = z.object({
  ...BaseDefinitionSchema.shape,
  type: z.literal("tool"),
})
{
  const _: IsEqual<z.infer<typeof ToolDefinitionSchema>, Omit<ToolDefinition, "invoke">> = true
}
