import type { I18nText } from "./common"

export interface PropertyUIOption {
  /**
   * The icon of the option
   */
  icon?: string
  /**
   * The label of the option
   */
  label: I18nText
  /**
   * The value of the option
   */
  value: string | number | boolean
}

/** 通用 UI 属性 */
export interface PropertyUICommonProps {
  /**
   * Whether the component is disabled
   */
  disabled?: boolean
  /**
   * The hint of the component
   */
  hint?: I18nText
  /**
   * The placeholder of the component
   */
  placeholder?: I18nText
  /**
   * Whether the component is readonly
   */
  readonly?: boolean
  /**
   * Whether the component is sensitive
   */
  sensitive?: boolean
  /**
   * Whether the component supports expression
   */
  support_expression?: boolean
  /**
   * The width of the component
   */
  width?: "small" | "medium" | "full"
}

export interface PropertyUIEncryptedInputProps extends PropertyUICommonProps {
  component: "encrypted-input"
}

export type PropertyUIEncryptedString = PropertyUIEncryptedInputProps

/** 输入框 UI 属性 */
export interface PropertyUIInputProps extends PropertyUICommonProps {
  component: "input"
}

/** 文本域 UI 属性 */
interface PropertyUITextareaProps extends PropertyUICommonProps {
  component: "textarea"
  max_height?: number
  min_height?: number
}

/** 表达式输入框 UI 属性 */
interface PropertyUIExpressionInputProps extends PropertyUICommonProps {
  component: "expression-input" | "expression-textarea"
  max_height?: number
  min_height?: number
}

/** 数字输入框 UI 属性 */
interface PropertyUINumberInputProps extends PropertyUICommonProps {
  component: "number-input"
  step?: number
  suffix?: string
}

/** 代码编辑器 UI 属性 */
interface PropertyUICodeEditorProps extends PropertyUICommonProps {
  component: "code-editor"
  language?: "json" | "javascript" | "python3" | "html"
  line_numbers?: boolean
  max_height?: number
  min_height?: number
}

interface PropertyUISelectPropsBase {
  clearable?: boolean
  options?: Array<PropertyUIOption>
  searchable?: boolean
}

export interface PropertyUISingleSelectProps
  extends PropertyUICommonProps,
    PropertyUISelectPropsBase {
  component: "select"
}

export interface PropertyUIRadioGroupProps
  extends PropertyUICommonProps,
    PropertyUISelectPropsBase {
  component: "radio-group"
}

interface PropertyUIMultiSelectProps extends PropertyUICommonProps, PropertyUISelectPropsBase {
  component: "multi-select"
}

/** 开关 UI 属性 */
export interface PropertyUISwitchProps extends PropertyUICommonProps {
  component: "switch"
}

/** 复选框 UI 属性 */
interface PropertyUICheckboxProps extends PropertyUICommonProps {
  component: "checkbox"
}

/** 滑块 UI 属性 */
interface PropertyUISliderProps extends PropertyUICommonProps {
  component: "slider"
  marks?: Record<number, string>
  show_value?: boolean
  step?: number
}

/** 键值编辑器 UI 属性 */
export interface PropertyUIKeyValueEditorProps extends PropertyUICommonProps {
  add_button_label?: I18nText
  component: "key-value-editor"
  default_item?: unknown
  empty_description?: I18nText
  section_header?: I18nText
}

/** 标签输入 UI 属性 */
interface PropertyUITagInputProps extends PropertyUICommonProps {
  component: "tag-input"
}

/** 凭证选择 UI 属性 */
interface PropertyUICredentialSelectProps extends PropertyUICommonProps {
  clearable?: boolean
  component: "credential-select"
  searchable?: boolean
}

/** JSON Schema 编辑器 UI 属性 */
interface PropertyUIJsonSchemaEditorProps extends PropertyUICommonProps {
  component: "json-schema-editor"
}

/** 条件编辑器 UI 属性 */
interface PropertyUIConditionsEditorProps extends PropertyUICommonProps {
  component: "conditions-editor"
}

/** 变量 Schema Section UI 属性 */
interface PropertyUIVariablesSchemaSectionProps extends PropertyUICommonProps {
  component: "variables-schema-section"
}

/** 变量值 Section UI 属性 */
interface PropertyUIVariablesValuesSectionProps extends PropertyUICommonProps {
  component: "variables-values-section"
}

/** 数组 Section UI 属性 */
export interface PropertyUIArraySectionProps extends PropertyUICommonProps {
  add_label?: I18nText
  collapsible?: boolean
  component: "array-section"
  default_item?: unknown
  empty_message?: I18nText
  remove_tooltip?: I18nText
  sortable?: boolean
}

/** 可折叠面板 UI 属性 */
export interface PropertyUICollapsiblePanelProps extends PropertyUICommonProps {
  collapsible?: boolean
  component: "collapsible-panel"
  default_collapsed?: boolean
  panel_title?: I18nText
  remove_tooltip?: I18nText
  sortable?: boolean
}

/** 节点属性 UI 属性并集类型 */
export type PropertyUIProps =
  | PropertyUIInputProps
  | PropertyUITextareaProps
  | PropertyUIExpressionInputProps
  | PropertyUINumberInputProps
  | PropertyUICodeEditorProps
  | PropertyUISingleSelectProps
  | PropertyUIRadioGroupProps
  | PropertyUIMultiSelectProps
  | PropertyUISwitchProps
  | PropertyUICheckboxProps
  | PropertyUISliderProps
  | PropertyUIKeyValueEditorProps
  | PropertyUITagInputProps
  | PropertyUICredentialSelectProps
  | PropertyUIJsonSchemaEditorProps
  | PropertyUIConditionsEditorProps
  | PropertyUIVariablesSchemaSectionProps
  | PropertyUIVariablesValuesSectionProps
  | PropertyUIArraySectionProps
  | PropertyUICollapsiblePanelProps
  | PropertyUIEncryptedInputProps

export type PropertyUIComponentType = PropertyUIProps["component"]

export type PropertyUIBoolean = PropertyUISwitchProps | PropertyUICheckboxProps

export type PropertyUINumber = PropertyUINumberInputProps | PropertyUISliderProps

export type PropertyUIString =
  | PropertyUIInputProps
  | PropertyUITextareaProps
  | PropertyUIExpressionInputProps
  | PropertyUICodeEditorProps
  | PropertyUISingleSelectProps
  | PropertyUICredentialSelectProps
  | PropertyUIRadioGroupProps

export type PropertyUIArray =
  | PropertyUIMultiSelectProps
  | PropertyUITagInputProps
  | PropertyUIKeyValueEditorProps
  | PropertyUISliderProps
  | PropertyUIArraySectionProps

export type PropertyUIContainer = PropertyUICollapsiblePanelProps

export type PropertyUIMisc =
  | PropertyUIJsonSchemaEditorProps
  | PropertyUIConditionsEditorProps
  | PropertyUIVariablesSchemaSectionProps
  | PropertyUIVariablesValuesSectionProps

export type PropertyUIObject = PropertyUIContainer | PropertyUIMisc | PropertyUICodeEditorProps

export type PropertyUICredentialId = PropertyUICredentialSelectProps
