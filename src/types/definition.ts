import type { LiteralUnion } from "type-fest"
import type { TransporterOptions } from "../core/transporter"
import type { NodeProperty } from "./node-property"

/**
 * I18n Entry
 */
export interface I18nText {
  /**
   * English is required
   */
  en_US: string
  [locale: `${LiteralUnion<"zh_Hans", string>}_${string}`]: string | undefined
}

export interface BaseDefinition {
  /**
   * Name
   */
  name: string
  /**
   * Display name
   */
  display_name: I18nText
  /**
   * Description
   */
  description: I18nText
  /**
   * Icon, allowed to use Emoji or URL address
   */
  icon: string | URL
  /**
   * Parameters
   */
  parameters: NodeProperty[]
  /**
   * Settings
   */
  settings?: NodeProperty[]
}

/**
 * Plugin definition
 */
export interface PluginDefinition<Locales extends string[] = string[]>
  extends Omit<BaseDefinition, "parameters" | "settings"> {
  /**
   * The locales to support. Defaults to ["en_US"].
   */
  locales: Locales
  /**
   * The options for the transporter.
   */
  transporterOptions?: TransporterOptions
}

export type Feature = CredentialDefinition | DataSourceDefinition | ModelDefinition | ToolDefinition

/**
 * Credential definition
 */
export interface CredentialDefinition extends Omit<BaseDefinition, "settings"> {
  type: "credential"
}

/**
 * DataSource definition
 */
export interface DataSourceDefinition extends BaseDefinition {
  type: "data_source"
}

/**
 * Model definition
 */
export interface ModelDefinition extends Omit<BaseDefinition, "parameters" | "settings"> {
  type: "model"
  /**
   * The unique name of the model.
   *
   * Plugin authors should use the **"model_provider/model_name"** format to define this field.
   */
  name: string // NOTE: Do not define it as a template literal, use zod schema instead
  /**
   * The type of the model, currently only "llm" is supported.
   */
  model_type: "llm"
  /**
   * The default endpoint of the model.
   */
  default_endpoint?: string
  /**
   * Maximum context window size in tokens.
   */
  context_window: number
  /**
   * Supported input types.
   */
  input_modalities: Array<"file" | "image" | "text">
  /**
   * Supported output types.
   */
  output_modalities: Array<"text">
  /**
   * All pricing values is in currency (if specified) per token/request.
   *
   * A value of 0 means the feature is free.
   */
  pricing?: {
    /**
     * The currency of the pricing. Defaults to "USD" if not specified.
     */
    currency?: string
    /**
     * Cost per input token.
     */
    input?: number
    /**
     * Input cache read token price.
     */
    input_cache_read?: number
    /**
     * Input cache write token price.
     */
    input_cache_write?: number
    /**
     * Cost per output token.
     */
    output?: number
    /**
     * Fixed cost per API request if applicable.
     */
    request?: number
  }
  /**
   * Declare which parameters are not supported by the model.
   *
   * Currently, the built-in parameters support are:
   * - endpoint
   * - temperature
   * - frequency_penalty
   * - seed
   * - max_tokens
   * - json_schema
   * - stream
   * - stream_options
   * - structured_outputs
   * - parallel_tool_calls
   * - verbosity
   */
  unsupported_parameters: Array<
    | "endpoint"
    | "temperature"
    // | "top_p"
    // | "top_k"
    | "frequency_penalty"
    // | "presence_penalty"
    // | "repetition_penalty"
    // | "min_p"
    // | "top_a"
    | "seed"
    | "max_tokens"
    // | "logit_bias"
    // | "logprobs"
    // | "top_logprobs"
    // | "response_format"
    // | "json_response"
    | "json_schema"
    | "stream"
    | "stream_options"
    | "structured_outputs"
    // | "stop"
    // | "tools"
    // | "tool_choice"
    | "parallel_tool_calls"
    | "verbosity"
  >
}

/**
 * Tool definition
 */
export interface ToolDefinition extends BaseDefinition {
  type: "tool"
  /**
   * The function to invoke when the tool is called.
   */
  invoke: (...args: unknown[]) => Promise<unknown>
}
