import type { IsEqual } from "type-fest"
import { z } from "zod"
import type { JsonValue } from "../plugin"
import type {
  BaseDefinition,
  CredentialDefinition,
  ModelDefinition,
  PluginDefinition,
  ToolDefinition,
} from "../types"
import { I18nEntrySchema } from "./common"
import { PropertiesSchema } from "./property"

/**
 * 基础定义模式
 *
 * 此为所有功能定义模式的基类，定义了通用的属性，不单独使用
 */
export const BaseDefinitionSchema = z.object({
  // 1. 只能出现英文字母（大小写不敏感）和数字以及_和-
  // 2. 开头只能是英文字母，结尾不能是_和-
  // 3. _和-不能连续出现多次
  // 4. 最小长度 4，最大长度 64
  name: z.string().regex(/^[a-zA-Z](?:(?![_-]{2,})[a-zA-Z0-9_-]){3,63}[a-zA-Z0-9]$/, {
    error:
      "Invalid name, should match the following rules: 1. only English letters, numbers, _ and - 2. start with English letter, end with English letter or number 3. _ and - cannot appear consecutively more than twice 4. minimum length 4, maximum length 64",
  }),
  display_name: I18nEntrySchema,
  description: I18nEntrySchema,
  icon: z.string(),
  parameters: PropertiesSchema,
  settings: PropertiesSchema.optional(),
})
{
  const _: IsEqual<z.infer<typeof BaseDefinitionSchema>, BaseDefinition> = true
}

export const PluginDefinitionSchema = z.object({
  ...BaseDefinitionSchema.omit({ parameters: true, settings: true }).shape,
  author: z.string(),
  email: z.email(),
  repo: z.httpUrl().optional(),
  version: z.string().optional(),
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
  name: z.string().regex(/^[a-zA-Z](?:(?![_-]{2,})[a-zA-Z0-9_/-]){3,63}[a-zA-Z0-9]$/, {
    error:
      "Invalid model name, should match the following rules: 1. only English letters, numbers, _ and - 2. start with English letter, end with English letter or number 3. _ and - cannot appear consecutively more than twice 4. minimum length 4, maximum length 64 5. allow '/' in the middle",
  }),
  model_type: z.literal("llm"),
  default_endpoint: z.httpUrl().optional(),
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
  override_parameters: z
    .object({
      temperature: z
        .object({
          default: z.number().optional(),
          maximum: z.number().optional(),
          minimum: z.number().optional(),
        })
        .optional(),
      frequency_penalty: z
        .object({
          default: z.number().optional(),
          maximum: z.number().optional(),
          minimum: z.number().optional(),
        })
        .optional(),
      max_tokens: z
        .object({
          default: z.number().optional(),
          maximum: z.number().optional(),
        })
        .optional(),
      verbosity: z
        .object({
          default: z.enum(["low", "medium", "high"]).optional(),
        })
        .optional(),
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
  invoke: z.function({
    input: z.tuple([z.object({ args: z.any() })]),
    output: z.instanceof(Promise<JsonValue>),
  }),
})
{
  const _: IsEqual<z.infer<typeof ToolDefinitionSchema>, ToolDefinition> = true
}
