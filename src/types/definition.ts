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
export interface ModelDefinition extends BaseDefinition {
  type: "model"
}

/**
 * Tool definition
 */
export interface ToolDefinition extends BaseDefinition {
  type: "tool"
  /**
   * The function to invoke when the tool is called.
   */
  invoke: (...args: any[]) => Promise<any>
}
