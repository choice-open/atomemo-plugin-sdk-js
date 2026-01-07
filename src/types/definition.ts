import type { TransporterOptions } from "../core/transporter"
import type { I18nText } from "./common"
import type { Property } from "./property"

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
  icon: string
  /**
   * Parameters
   */
  parameters: Array<Property>
  /**
   * Settings
   */
  settings?: Array<Property>
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
   * The author's name of the plugin.
   */
  author: string
  /**
   * The author's email address.
   */
  email: string
  /**
   * The source URL of the plugin.
   */
  repo?: string
  /**
   * The version of the plugin.
   *
   * If you do not provide this value, it will fallback to the version field in your package.json file.
   *
   * We recommend doing it this way, but if you do provide this value, please ensure that it remains consistent with the version field in package.json.
   */
  version?: string
  /**
   * The options for the transporter.
   */
  transporterOptions?: TransporterOptions
}

export type Feature = CredentialDefinition | DataSourceDefinition | ModelDefinition | ToolDefinition

/**
 * Credential definition
 */
export interface CredentialDefinition extends Omit<BaseDefinition, "settings"> {}

/**
 * DataSource definition
 */
export interface DataSourceDefinition extends BaseDefinition {}

/**
 * Model definition
 */
export interface ModelDefinition extends Omit<BaseDefinition, "parameters" | "settings"> {
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
   * Override the default parameters of the model.
   */
  override_parameters?: {
    /**
     * This setting influences the variety in the model’s responses. Lower values lead to more predictable and typical responses, while higher values encourage more diverse and less common responses. At 0, the model always gives the same response for a given input.
     */
    temperature?: {
      /**
       * @default 1.0
       */
      default?: number
      /**
       * @default 2.0
       */
      maximum?: number
      /**
       * @default 0.0
       */
      minimum?: number
    }
    /**
     * This setting aims to control the repetition of tokens based on how often they appear in the input. It tries to use less frequently those tokens that appear more in the input, proportional to how frequently they occur. Token penalty scales with the number of occurrences. Negative values will encourage token reuse.
     */
    frequency_penalty?: {
      /**
       * @default 0.0
       */
      default?: number
      /**
       * @default 2.0
       */
      maximum?: number
      /**
       * @default -2.0
       */
      minimum?: number
    }
    /**
     * This sets the upper limit for the number of tokens the model can generate in response. It won’t produce more than this limit. The maximum value is the context length minus the prompt length.
     */
    max_tokens?: {
      /**
       * @default 1_048_576
       */
      default?: number
      /**
       * @default 2_000_000
       */
      maximum?: number
    }
    /**
     * Constrains the verbosity of the model’s response. Lower values produce more concise responses, while higher values produce more detailed and comprehensive responses. Introduced by OpenAI for the Responses API.
     *
     * For Anthropic models, this parameter maps to `output_config.effort`.
     */
    verbosity?: {
      /**
       * @default "medium"
       */
      default?: "low" | "medium" | "high"
    }
  }
  /**
   * Declare which parameters are not supported by the model.
   *
   * Parameters defined here will not appear in the UI's parameter panel.
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
  /**
   * The function to invoke when the tool is called.
   */
  invoke: (...args: unknown[]) => Promise<unknown>
}
