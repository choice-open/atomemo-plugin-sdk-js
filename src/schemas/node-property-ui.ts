import type { IsEqual } from "type-fest"
import { z } from "zod"
import type {
  NodePropertyUIArray,
  NodePropertyUIArraySectionProps,
  NodePropertyUIBoolean,
  NodePropertyUICollapsiblePanelProps,
  NodePropertyUICredentialId,
  NodePropertyUIInputProps,
  NodePropertyUIKeyValueEditorProps,
  NodePropertyUINumber,
  NodePropertyUIObject,
  NodePropertyUIOption,
  NodePropertyUIProps,
  NodePropertyUIRadioGroupProps,
  NodePropertyUISingleSelectProps,
  NodePropertyUIString,
  NodePropertyUISwitchProps,
} from "../types"
import { I18nEntrySchema } from "./definition"

// Common UI properties schema
export const NodePropertyUICommonPropsSchema = z.object({
  disabled: z.boolean().optional(),
  hint: I18nEntrySchema.optional(),
  placeholder: I18nEntrySchema.optional(),
  readonly: z.boolean().optional(),
  sensitive: z.boolean().optional(),
  support_expression: z.boolean().optional(),
  width: z.enum(["small", "medium", "full"]).optional(),
})

// Option schema for select components
export const NodePropertyUIOptionSchema = z.object({
  icon: z.string().optional(),
  label: I18nEntrySchema,
  value: z.union([z.string(), z.number(), z.boolean()]),
})
{
  const _: IsEqual<z.infer<typeof NodePropertyUIOptionSchema>, NodePropertyUIOption> = true
}

// Input component schema
const NodePropertyUIInputPropsSchema = NodePropertyUICommonPropsSchema.extend({
  component: z.literal("input"),
})
{
  const _: IsEqual<z.infer<typeof NodePropertyUIInputPropsSchema>, NodePropertyUIInputProps> = true
}

// Textarea component schema
const NodePropertyUITextareaPropsSchema = NodePropertyUICommonPropsSchema.extend({
  component: z.literal("textarea"),
  max_height: z.number().optional(),
  min_height: z.number().optional(),
})

// Expression input component schema
const NodePropertyUIExpressionInputPropsSchema = NodePropertyUICommonPropsSchema.extend({
  component: z.enum(["expression-input", "expression-textarea"]),
  max_height: z.number().optional(),
  min_height: z.number().optional(),
})

// Number input component schema
const NodePropertyUINumberInputPropsSchema = NodePropertyUICommonPropsSchema.extend({
  component: z.literal("number-input"),
  step: z.number().optional(),
  suffix: z.string().optional(),
})

// Code editor component schema
const NodePropertyUICodeEditorPropsSchema = NodePropertyUICommonPropsSchema.extend({
  component: z.literal("code-editor"),
  language: z.enum(["json", "javascript", "python3", "html"]).optional(),
  line_numbers: z.boolean().optional(),
  max_height: z.number().optional(),
  min_height: z.number().optional(),
})

// Select base schema
const NodePropertyUISelectPropsBaseSchema = z.object({
  clearable: z.boolean().optional(),
  options: z.array(NodePropertyUIOptionSchema).optional(),
  searchable: z.boolean().optional(),
})

// Single select component schema
const NodePropertyUISingleSelectPropsSchema = NodePropertyUICommonPropsSchema.merge(
  NodePropertyUISelectPropsBaseSchema,
).extend({
  component: z.literal("select"),
})
{
  const _: IsEqual<
    z.infer<typeof NodePropertyUISingleSelectPropsSchema>,
    NodePropertyUISingleSelectProps
  > = true
}

// Radio group component schema
const NodePropertyUIRadioGroupPropsSchema = NodePropertyUICommonPropsSchema.merge(
  NodePropertyUISelectPropsBaseSchema,
).extend({
  component: z.literal("radio-group"),
})
{
  const _: IsEqual<
    z.infer<typeof NodePropertyUIRadioGroupPropsSchema>,
    NodePropertyUIRadioGroupProps
  > = true
}

// Multi select component schema
const NodePropertyUIMultiSelectPropsSchema = NodePropertyUICommonPropsSchema.merge(
  NodePropertyUISelectPropsBaseSchema,
).extend({
  component: z.literal("multi-select"),
})

// Switch component schema
const NodePropertyUISwitchPropsSchema = NodePropertyUICommonPropsSchema.extend({
  component: z.literal("switch"),
})
{
  const _: IsEqual<
    z.infer<typeof NodePropertyUISwitchPropsSchema>,
    NodePropertyUISwitchProps
  > = true
}

// Checkbox component schema
const NodePropertyUICheckboxPropsSchema = NodePropertyUICommonPropsSchema.extend({
  component: z.literal("checkbox"),
})

// Slider component schema
const NodePropertyUISliderPropsSchema = NodePropertyUICommonPropsSchema.extend({
  component: z.literal("slider"),
  marks: z.record(z.number(), z.string()).optional(),
  show_value: z.boolean().optional(),
  step: z.number().optional(),
})

// Key-value editor component schema
const NodePropertyUIKeyValueEditorPropsSchema = NodePropertyUICommonPropsSchema.extend({
  add_button_label: I18nEntrySchema.optional(),
  component: z.literal("key-value-editor"),
  default_item: z.unknown().optional(),
  empty_description: I18nEntrySchema.optional(),
  section_header: I18nEntrySchema.optional(),
})
{
  const _: IsEqual<
    z.infer<typeof NodePropertyUIKeyValueEditorPropsSchema>,
    NodePropertyUIKeyValueEditorProps
  > = true
}

// Tag input component schema
const NodePropertyUITagInputPropsSchema = NodePropertyUICommonPropsSchema.extend({
  component: z.literal("tag-input"),
})

// Credential select component schema
const NodePropertyUICredentialSelectPropsSchema = NodePropertyUICommonPropsSchema.extend({
  clearable: z.boolean().optional(),
  component: z.literal("credential-select"),
  searchable: z.boolean().optional(),
})

// Model selector component schema
const NodePropertyUIModelSelectorPropsSchema = NodePropertyUICommonPropsSchema.extend({
  clearable: z.boolean().optional(),
  component: z.literal("model-selector"),
  searchable: z.boolean().optional(),
})

// JSON Schema editor component schema
const NodePropertyUIJsonSchemaEditorPropsSchema = NodePropertyUICommonPropsSchema.extend({
  component: z.literal("json-schema-editor"),
})

// Conditions editor component schema
const NodePropertyUIConditionsEditorPropsSchema = NodePropertyUICommonPropsSchema.extend({
  component: z.literal("conditions-editor"),
})

// Variables schema section component schema
const NodePropertyUIVariablesSchemaSectionPropsSchema = NodePropertyUICommonPropsSchema.extend({
  component: z.literal("variables-schema-section"),
})

// Variables values section component schema
const NodePropertyUIVariablesValuesSectionPropsSchema = NodePropertyUICommonPropsSchema.extend({
  component: z.literal("variables-values-section"),
})

// Array section component schema
const NodePropertyUIArraySectionPropsSchema = NodePropertyUICommonPropsSchema.extend({
  add_label: I18nEntrySchema.optional(),
  collapsible: z.boolean().optional(),
  component: z.literal("array-section"),
  default_item: z.unknown().optional(),
  empty_message: I18nEntrySchema.optional(),
  remove_tooltip: I18nEntrySchema.optional(),
  sortable: z.boolean().optional(),
})
{
  const _: IsEqual<
    z.infer<typeof NodePropertyUIArraySectionPropsSchema>,
    NodePropertyUIArraySectionProps
  > = true
}

// Collapsible panel component schema
const NodePropertyUICollapsiblePanelPropsSchema = NodePropertyUICommonPropsSchema.extend({
  collapsible: z.boolean().optional(),
  component: z.literal("collapsible-panel"),
  default_collapsed: z.boolean().optional(),
  panel_title: I18nEntrySchema.optional(),
  remove_tooltip: I18nEntrySchema.optional(),
  sortable: z.boolean().optional(),
})
{
  const _: IsEqual<
    z.infer<typeof NodePropertyUICollapsiblePanelPropsSchema>,
    NodePropertyUICollapsiblePanelProps
  > = true
}

export const NodePropertyUIPropsSchema = z.discriminatedUnion("type", [
  NodePropertyUIInputPropsSchema,
  NodePropertyUITextareaPropsSchema,
  NodePropertyUIExpressionInputPropsSchema,
  NodePropertyUINumberInputPropsSchema,
  NodePropertyUICodeEditorPropsSchema,
  NodePropertyUISingleSelectPropsSchema,
  NodePropertyUIRadioGroupPropsSchema,
  NodePropertyUIMultiSelectPropsSchema,
  NodePropertyUISwitchPropsSchema,
  NodePropertyUICheckboxPropsSchema,
  NodePropertyUISliderPropsSchema,
  NodePropertyUIKeyValueEditorPropsSchema,
  NodePropertyUITagInputPropsSchema,
  NodePropertyUICredentialSelectPropsSchema,
  NodePropertyUIModelSelectorPropsSchema,
  NodePropertyUIJsonSchemaEditorPropsSchema,
  NodePropertyUIConditionsEditorPropsSchema,
  NodePropertyUIVariablesSchemaSectionPropsSchema,
  NodePropertyUIVariablesValuesSectionPropsSchema,
  NodePropertyUIArraySectionPropsSchema,
  NodePropertyUICollapsiblePanelPropsSchema,
])
{
  const _: IsEqual<z.infer<typeof NodePropertyUIPropsSchema>, NodePropertyUIProps> = true
}

export const NodePropertyUIBooleanSchema = z.discriminatedUnion("component", [
  NodePropertyUISwitchPropsSchema,
  NodePropertyUICheckboxPropsSchema,
])
{
  const _: IsEqual<z.infer<typeof NodePropertyUIBooleanSchema>, NodePropertyUIBoolean> = true
}

export const NodePropertyUINumberSchema = z.discriminatedUnion("component", [
  NodePropertyUINumberInputPropsSchema,
  NodePropertyUISliderPropsSchema,
])
{
  const _: IsEqual<z.infer<typeof NodePropertyUINumberSchema>, NodePropertyUINumber> = true
}

export const NodePropertyUIStringSchema = z.discriminatedUnion("component", [
  NodePropertyUIInputPropsSchema,
  NodePropertyUITextareaPropsSchema,
  NodePropertyUIExpressionInputPropsSchema,
  NodePropertyUICodeEditorPropsSchema,
  NodePropertyUISingleSelectPropsSchema,
  NodePropertyUICredentialSelectPropsSchema,
  NodePropertyUIModelSelectorPropsSchema,
  NodePropertyUIRadioGroupPropsSchema,
])
{
  const _: IsEqual<z.infer<typeof NodePropertyUIStringSchema>, NodePropertyUIString> = true
}

export const NodePropertyUIArraySchema = z.discriminatedUnion("component", [
  NodePropertyUIMultiSelectPropsSchema,
  NodePropertyUITagInputPropsSchema,
  NodePropertyUIKeyValueEditorPropsSchema,
  NodePropertyUISliderPropsSchema,
  NodePropertyUIArraySectionPropsSchema,
])
{
  const _: IsEqual<z.infer<typeof NodePropertyUIArraySchema>, NodePropertyUIArray> = true
}

export const NodePropertyUIObjectSchema = z.discriminatedUnion("component", [
  NodePropertyUICollapsiblePanelPropsSchema,
  NodePropertyUIJsonSchemaEditorPropsSchema,
  NodePropertyUIConditionsEditorPropsSchema,
  NodePropertyUIVariablesSchemaSectionPropsSchema,
  NodePropertyUICodeEditorPropsSchema,
  NodePropertyUIVariablesValuesSectionPropsSchema,
])
{
  const _: IsEqual<z.infer<typeof NodePropertyUIObjectSchema>, NodePropertyUIObject> = true
}

export const NodePropertyUICredentialIdSchema = z.discriminatedUnion("component", [
  NodePropertyUICredentialSelectPropsSchema,
])
{
  const _: IsEqual<z.infer<typeof NodePropertyUICredentialIdSchema>, NodePropertyUICredentialId> = true
}
export const NodePropertyUIDiscriminatorUISchema = z.discriminatedUnion("component", [
  NodePropertyUISwitchPropsSchema,
  NodePropertyUISingleSelectPropsSchema,
  NodePropertyUIRadioGroupPropsSchema,
])