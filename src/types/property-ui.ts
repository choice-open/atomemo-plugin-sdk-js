import type { IntRange } from "type-fest"
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
  /**
   * how many spaces to use for indentation in components
   * @default undefined
   * calculation rule: (4 * indentation)px
   */
  indentation?: IntRange<2, 81, 2>
  /**
   * Hide the component in the UI while preserving its value.
   * Often used in combination with constant of Property to create hidden fields.
   * - Layout behavior: behaves like CSS `display: none` (no space is reserved).
   * - Data behavior: the underlying value is kept, included in serialization, and validated normally.
   * @default false
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/display#none.
   */
  display_none?: boolean
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

/** 数字输入框 UI 属性 */
interface PropertyUINumberInputProps extends PropertyUICommonProps {
  component: "number-input"
  step?: number
  suffix?: string
}

/** 代码编辑器 UI 属性 */
interface PropertyUICodeEditorProps extends PropertyUICommonProps {
  component: "code-editor"
  language?: "json" | "javascript" | "python3"
  /**
   * show line numbers in the code editor
   * @default false
   */
  line_numbers?: boolean
  /**
   * enable line wrapping in the code editor
   * @default false
   */
  line_wrapping?: boolean
  max_height?: number
  min_height?: number
  /**
   * number of rows to show in the code editor
   * @default 4
   */
  rows?: number
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

export interface PropertyUIEmojiPickerProps extends PropertyUICommonProps {
  component: "emoji-picker"
  size?: "extra-small" | "small" | "medium" | "large"
}

export interface PropertyUIColorPickerProps extends PropertyUICommonProps {
  component: "color-picker"
}

interface PropertyUIMultiSelectProps extends PropertyUICommonProps, PropertyUISelectPropsBase {
  component: "multi-select"
}

export interface PropertyUISwitchProps extends PropertyUICommonProps {
  component: "switch"
}

interface PropertyUISliderProps extends PropertyUICommonProps {
  component: "slider"
  marks?: Record<number, string>
  show_value?: boolean
  step?: number
}

/** Key/value pair editor UI. Supports Array<{name: string, value: string}> only. */
export interface PropertyUIKeyValueEditorProps extends PropertyUICommonProps {
  /** Custom text for the add button. */
  add_button_label?: I18nText
  /**
   * Item definition of PropertyArray is ignored for this UI; it always renders name/value pairs.
   */
  component: "key-value-editor"
  /** Description displayed when the list is empty. */
  empty_description?: I18nText
  /** Optional header text shown above the list. */
  section_header?: I18nText
}

interface PropertyUITagInputProps extends PropertyUICommonProps {
  component: "tag-input"
}

interface PropertyUICredentialSelectProps extends PropertyUICommonProps {
  clearable?: boolean
  component: "credential-select"
  searchable?: boolean
}

interface PropertyUIJsonSchemaEditorProps extends PropertyUICommonProps {
  component: "json-schema-editor"
}

interface PropertyUIConditionsEditorProps extends PropertyUICommonProps {
  component: "conditions-editor"
}

export interface PropertyUIArraySectionProps extends PropertyUICommonProps {
  add_label?: I18nText
  collapsible?: boolean
  component: "array-section"
  empty_message?: I18nText
  remove_tooltip?: I18nText
  sortable?: boolean
}

export interface PropertyUICollapsiblePanelProps extends PropertyUICommonProps {
  collapsible?: boolean
  component: "collapsible-panel"
  default_collapsed?: boolean
  panel_title?: I18nText
  remove_tooltip?: I18nText
  sortable?: boolean
}

export interface PropertyUISectionProps extends PropertyUICommonProps {
  component: "section"
}

export type PropertyUIProps =
  | PropertyUIInputProps
  | PropertyUITextareaProps
  | PropertyUINumberInputProps
  | PropertyUICodeEditorProps
  | PropertyUISingleSelectProps
  | PropertyUIRadioGroupProps
  | PropertyUIEmojiPickerProps
  | PropertyUIColorPickerProps
  | PropertyUIMultiSelectProps
  | PropertyUISwitchProps
  | PropertyUISliderProps
  | PropertyUIKeyValueEditorProps
  | PropertyUITagInputProps
  | PropertyUICredentialSelectProps
  | PropertyUIJsonSchemaEditorProps
  | PropertyUIConditionsEditorProps
  | PropertyUIArraySectionProps
  | PropertyUICollapsiblePanelProps
  | PropertyUIEncryptedInputProps

export type PropertyUIComponentType = PropertyUIProps["component"]

export type PropertyUIBoolean = PropertyUISwitchProps

export type PropertyUINumber = PropertyUINumberInputProps | PropertyUISliderProps

export type PropertyUIString =
  | PropertyUIInputProps
  | PropertyUITextareaProps
  | PropertyUICodeEditorProps
  | PropertyUISingleSelectProps
  | PropertyUICredentialSelectProps
  | PropertyUIRadioGroupProps
  | PropertyUIEmojiPickerProps
  | PropertyUIColorPickerProps

export type PropertyUIArray =
  | PropertyUIMultiSelectProps
  | PropertyUITagInputProps
  | PropertyUIKeyValueEditorProps
  | PropertyUISliderProps
  | PropertyUIArraySectionProps

export type PropertyUIContainer = PropertyUICollapsiblePanelProps | PropertyUISectionProps

export type PropertyUIMisc = PropertyUIJsonSchemaEditorProps | PropertyUIConditionsEditorProps

export type PropertyUIObject = PropertyUIContainer | PropertyUIMisc | PropertyUICodeEditorProps

export type PropertyUICredentialId = PropertyUICredentialSelectProps
