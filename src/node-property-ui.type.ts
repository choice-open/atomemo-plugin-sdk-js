import type { I18nText } from "./types"

export interface NodePropertyUIOption {
  icon?: string
  label: I18nText
  value: string | number | boolean
}

/** 通用 UI 属性 */
export interface NodePropertyUICommonProps {
  // TODO: generic TSupportExpr extends boolean = false
  disabled?: boolean
  hint?: I18nText
  placeholder?: I18nText
  readonly?: boolean
  sensitive?: boolean
  support_expression?: boolean
  width?: "small" | "medium" | "full"
}

/** 输入框 UI 属性 */
export interface NodePropertyUIInputProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  component: "input"
}

/** 文本域 UI 属性 */
interface NodePropertyUITextareaProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  component: "textarea"
  max_height?: number
  min_height?: number
}

/** 表达式输入框 UI 属性 */
interface NodePropertyUIExpressionInputProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  component: "expression-input" | "expression-textarea"
  max_height?: number
  min_height?: number
}

/** 数字输入框 UI 属性 */
interface NodePropertyUINumberInputProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  component: "number-input"
  step?: number
  suffix?: string
}

/** 代码编辑器 UI 属性 */
interface NodePropertyUICodeEditorProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  component: "code-editor"
  language?: "json" | "javascript" | "python3" | "html"
  line_numbers?: boolean
  max_height?: number
  min_height?: number
}

interface NodePropertyUISelectPropsBase {
  clearable?: boolean
  options?: Array<NodePropertyUIOption>
  searchable?: boolean
}

export interface NodePropertyUISingleSelectProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps,
    NodePropertyUISelectPropsBase {
  component: "select"
}

export interface NodePropertyUIRadioGroupProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps,
    NodePropertyUISelectPropsBase {
  component: "radio-group"
}

interface NodePropertyUIMultiSelectProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps,
    NodePropertyUISelectPropsBase {
  component: "multi-select"
}

/** 开关 UI 属性 */
export interface NodePropertyUISwitchProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  component: "switch"
}

/** 复选框 UI 属性 */
interface NodePropertyUICheckboxProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  component: "checkbox"
}

/** 滑块 UI 属性 */
interface NodePropertyUISliderProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  component: "slider"
  marks?: Record<number, string>
  show_value?: boolean
  step?: number
}

/** 键值编辑器 UI 属性 */
export interface NodePropertyUIKeyValueEditorProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  add_button_label?: I18nText
  component: "key-value-editor"
  default_item?: unknown
  empty_description?: I18nText
  section_header?: I18nText
}

/** 标签输入 UI 属性 */
interface NodePropertyUITagInputProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  component: "tag-input"
}

/** 凭证选择 UI 属性 */
interface NodePropertyUICredentialSelectProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  clearable?: boolean
  component: "credential-select"
  searchable?: boolean
}

/** 模型选择器 UI 属性 */
interface NodePropertyUIModelSelectorProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  clearable?: boolean
  component: "model-selector"
  searchable?: boolean
}

/** JSON Schema 编辑器 UI 属性 */
interface NodePropertyUIJsonSchemaEditorProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  component: "json-schema-editor"
}

/** 条件编辑器 UI 属性 */
interface NodePropertyUIConditionsEditorProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  component: "conditions-editor"
}

/** 变量 Schema Section UI 属性 */
interface NodePropertyUIVariablesSchemaSectionProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  component: "variables-schema-section"
}

/** 变量值 Section UI 属性 */
interface NodePropertyUIVariablesValuesSectionProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  component: "variables-values-section"
}

/** 数组 Section UI 属性 */
export interface NodePropertyUIArraySectionProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  add_label?: I18nText
  collapsible?: boolean
  component: "array-section"
  default_item?: unknown
  empty_message?: I18nText
  remove_tooltip?: I18nText
  sortable?: boolean
}

/** 可折叠面板 UI 属性 */
export interface NodePropertyUICollapsiblePanelProps<TSupportExpr extends boolean = false>
  extends NodePropertyUICommonProps {
  collapsible?: boolean
  component: "collapsible-panel"
  default_collapsed?: boolean
  panel_title?: I18nText
  remove_tooltip?: I18nText
  sortable?: boolean
}

/** 节点属性 UI 属性并集类型 */
export type NodePropertyUIProps =
  | NodePropertyUIInputProps
  | NodePropertyUITextareaProps
  | NodePropertyUIExpressionInputProps
  | NodePropertyUINumberInputProps
  | NodePropertyUICodeEditorProps
  | NodePropertyUISingleSelectProps
  | NodePropertyUIRadioGroupProps
  | NodePropertyUIMultiSelectProps
  | NodePropertyUISwitchProps
  | NodePropertyUICheckboxProps
  | NodePropertyUISliderProps
  | NodePropertyUIKeyValueEditorProps
  | NodePropertyUITagInputProps
  | NodePropertyUICredentialSelectProps
  | NodePropertyUIModelSelectorProps
  | NodePropertyUIJsonSchemaEditorProps
  | NodePropertyUIConditionsEditorProps
  | NodePropertyUIVariablesSchemaSectionProps
  | NodePropertyUIVariablesValuesSectionProps
  | NodePropertyUIArraySectionProps
  | NodePropertyUICollapsiblePanelProps

export type NodePropertyUIComponentType = NodePropertyUIProps["component"]

export type NodePropertyUIBoolean<TSupportExpr extends boolean = false> =
  | NodePropertyUISwitchProps
  | NodePropertyUICheckboxProps

export type NodePropertyUINumber<TSupportExpr extends boolean = false> =
  | NodePropertyUINumberInputProps
  | NodePropertyUISliderProps

export type NodePropertyUIString<TSupportExpr extends boolean = false> =
  | NodePropertyUIInputProps
  | NodePropertyUITextareaProps
  | NodePropertyUIExpressionInputProps
  | NodePropertyUICodeEditorProps
  | NodePropertyUISingleSelectProps
  | NodePropertyUICredentialSelectProps
  | NodePropertyUIModelSelectorProps
  | NodePropertyUIRadioGroupProps

export type NodePropertyUIArray<TSupportExpr extends boolean = false> =
  | NodePropertyUIMultiSelectProps
  | NodePropertyUITagInputProps
  | NodePropertyUIKeyValueEditorProps
  | NodePropertyUISliderProps
  | NodePropertyUIArraySectionProps

export type NodePropertyUIContainer<TSupportExpr extends boolean = false> =
  NodePropertyUICollapsiblePanelProps

export type NodePropertyUIMisc<TSupportExpr extends boolean = false> =
  | NodePropertyUIJsonSchemaEditorProps
  | NodePropertyUIConditionsEditorProps
  | NodePropertyUIVariablesSchemaSectionProps
  | NodePropertyUIVariablesValuesSectionProps

export type NodePropertyUIObject<TSupportExpr extends boolean = false> =
  | NodePropertyUIContainer
  | NodePropertyUIMisc
  | NodePropertyUICodeEditorProps
