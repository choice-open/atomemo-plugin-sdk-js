import type { LiteralUnion } from "type-fest"
import type { NodeProperty } from "./node-property.type"

/**
 * I18n 词条
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
   * 名称
   */
  name: string
  /**
   * 显示名称
   */
  display_name: I18nText
  /**
   * 描述
   */
  description: I18nText
  /**
   * 图标，允许使用 Emoji 或 URL 地址
   */
  icon: string | URL
  /**
   * 参数
   */
  parameters: NodeProperty[]
  /**
   * 设置
   */
  settings?: NodeProperty[]
  /**
   * 凭证
   * 如果此功能在运行时需要校验凭证，则需要在此处指定凭证名称
   */
  credentials?: {
    /**
     * 凭证名称
     */
    name: string
    /**
     * 对应的参数名。在运行时，凭证验证器会根据此参数名从输入参数中获取凭证值
     */
    parameter_name: string
  }[]
}

/**
 * 凭证功能定义
 */
export interface CredentialDefinition extends Omit<BaseDefinition, "settings" | "credentials"> {}

/**
 * 数据源功能定义
 */
export interface DataSourceDefinition extends BaseDefinition {}

/**
 * 模型功能定义
 */
export interface ModelDefinition extends BaseDefinition {}

/**
 * 工具功能定义
 */
export interface ToolDefinition extends BaseDefinition {}
