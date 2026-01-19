import type { IntRange, IsEqual } from "type-fest"
import { z } from "zod"
import type {
  PropertyUIArray,
  PropertyUIArraySectionProps,
  PropertyUIBoolean,
  PropertyUICollapsiblePanelProps,
  PropertyUIColorPickerProps,
  PropertyUICredentialId,
  PropertyUIEmojiPickerProps,
  PropertyUIEncryptedInputProps,
  PropertyUIInputProps,
  PropertyUIKeyValueEditorProps,
  PropertyUINumber,
  PropertyUIObject,
  PropertyUIOption,
  PropertyUIProps,
  PropertyUIRadioGroupProps,
  PropertyUISingleSelectProps,
  PropertyUIString,
  PropertyUISwitchProps,
} from "../types"
import { I18nEntrySchema } from "./common"

const indentationSchema = z.union([
  z.literal(2),
  z.literal(4),
  z.literal(6),
  z.literal(8),
  z.literal(10),
  z.literal(12),
  z.literal(14),
  z.literal(16),
  z.literal(18),
  z.literal(20),
  z.literal(22),
  z.literal(24),
  z.literal(26),
  z.literal(28),
  z.literal(30),
  z.literal(32),
  z.literal(34),
  z.literal(36),
  z.literal(38),
  z.literal(40),
  z.literal(42),
  z.literal(44),
  z.literal(46),
  z.literal(48),
  z.literal(50),
  z.literal(52),
  z.literal(54),
  z.literal(56),
  z.literal(58),
  z.literal(60),
  z.literal(62),
  z.literal(64),
  z.literal(66),
  z.literal(68),
  z.literal(70),
  z.literal(72),
  z.literal(74),
  z.literal(76),
  z.literal(78),
  z.literal(80),
])
{
  const _: IsEqual<z.infer<typeof indentationSchema>, IntRange<2, 81, 2>> = true
}

// Common UI properties schema
export const PropertyUICommonPropsSchema = z.object({
  disabled: z.boolean().optional(),
  hint: I18nEntrySchema.optional(),
  placeholder: I18nEntrySchema.optional(),
  readonly: z.boolean().optional(),
  sensitive: z.boolean().optional(),
  support_expression: z.boolean().optional(),
  width: z.enum(["small", "medium", "full"]).optional(),
  indentation: indentationSchema.optional(),
  display_none: z.boolean().optional(),
})

// Option schema for select components
export const PropertyUIOptionSchema = z.object({
  icon: z.string().optional(),
  label: I18nEntrySchema,
  value: z.union([z.string(), z.number(), z.boolean()]),
})
{
  const _: IsEqual<z.infer<typeof PropertyUIOptionSchema>, PropertyUIOption> = true
}

const PropertyUIInputPropsSchema = PropertyUICommonPropsSchema.extend({
  component: z.literal("input"),
})
{
  const _: IsEqual<z.infer<typeof PropertyUIInputPropsSchema>, PropertyUIInputProps> = true
}

export const PropertyUIEncryptedInputPropsSchema = PropertyUICommonPropsSchema.extend({
  component: z.literal("encrypted-input"),
})
{
  const _: IsEqual<
    z.infer<typeof PropertyUIEncryptedInputPropsSchema>,
    PropertyUIEncryptedInputProps
  > = true
}

// Textarea component schema
const PropertyUITextareaPropsSchema = PropertyUICommonPropsSchema.extend({
  component: z.literal("textarea"),
  max_height: z.number().optional(),
  min_height: z.number().optional(),
})

// Number input component schema
const PropertyUINumberInputPropsSchema = PropertyUICommonPropsSchema.extend({
  component: z.literal("number-input"),
  step: z.number().optional(),
  suffix: z.string().optional(),
})

// Code editor component schema
const PropertyUICodeEditorPropsSchema = PropertyUICommonPropsSchema.extend({
  component: z.literal("code-editor"),
  language: z.enum(["json", "javascript", "python3"]).optional(),
  line_numbers: z.boolean().optional(),
  line_wrapping: z.boolean().optional(),
  max_height: z.number().optional(),
  min_height: z.number().optional(),
  rows: z.number().optional(),
})

// Select base schema
const PropertyUISelectPropsBaseSchema = z.object({
  clearable: z.boolean().optional(),
  options: z.array(PropertyUIOptionSchema).optional(),
  searchable: z.boolean().optional(),
})

// Single select component schema
const PropertyUISingleSelectPropsSchema = PropertyUICommonPropsSchema.merge(
  PropertyUISelectPropsBaseSchema,
).extend({
  component: z.literal("select"),
})
{
  const _: IsEqual<
    z.infer<typeof PropertyUISingleSelectPropsSchema>,
    PropertyUISingleSelectProps
  > = true
}

// Radio group component schema
const PropertyUIRadioGroupPropsSchema = PropertyUICommonPropsSchema.merge(
  PropertyUISelectPropsBaseSchema,
).extend({
  component: z.literal("radio-group"),
})
{
  const _: IsEqual<
    z.infer<typeof PropertyUIRadioGroupPropsSchema>,
    PropertyUIRadioGroupProps
  > = true
}

// Multi select component schema
const PropertyUIMultiSelectPropsSchema = PropertyUICommonPropsSchema.merge(
  PropertyUISelectPropsBaseSchema,
).extend({
  component: z.literal("multi-select"),
})

// Switch component schema
const PropertyUISwitchPropsSchema = PropertyUICommonPropsSchema.extend({
  component: z.literal("switch"),
})
{
  const _: IsEqual<z.infer<typeof PropertyUISwitchPropsSchema>, PropertyUISwitchProps> = true
}

// Slider component schema
const PropertyUISliderPropsSchema = PropertyUICommonPropsSchema.extend({
  component: z.literal("slider"),
  marks: z.record(z.number(), z.string()).optional(),
  show_value: z.boolean().optional(),
  step: z.number().optional(),
})

// Key-value editor component schema
const PropertyUIKeyValueEditorPropsSchema = PropertyUICommonPropsSchema.extend({
  add_button_label: I18nEntrySchema.optional(),
  component: z.literal("key-value-editor"),
  empty_description: I18nEntrySchema.optional(),
  section_header: I18nEntrySchema.optional(),
})
{
  const _: IsEqual<
    z.infer<typeof PropertyUIKeyValueEditorPropsSchema>,
    PropertyUIKeyValueEditorProps
  > = true
}

// Tag input component schema
const PropertyUITagInputPropsSchema = PropertyUICommonPropsSchema.extend({
  component: z.literal("tag-input"),
})

// Emoji picker component schema
const PropertyUIEmojiPickerPropsSchema = PropertyUICommonPropsSchema.extend({
  component: z.literal("emoji-picker"),
  size: z.enum(["extra-small", "small", "medium", "large"]).optional(),
})
{
  const _: IsEqual<
    z.infer<typeof PropertyUIEmojiPickerPropsSchema>,
    PropertyUIEmojiPickerProps
  > = true
}

// Color picker component schema
const PropertyUIColorPickerPropsSchema = PropertyUICommonPropsSchema.extend({
  component: z.literal("color-picker"),
})
{
  const _: IsEqual<
    z.infer<typeof PropertyUIColorPickerPropsSchema>,
    PropertyUIColorPickerProps
  > = true
}

// Credential select component schema
const PropertyUICredentialSelectPropsSchema = PropertyUICommonPropsSchema.extend({
  clearable: z.boolean().optional(),
  component: z.literal("credential-select"),
  searchable: z.boolean().optional(),
})

// JSON Schema editor component schema
const PropertyUIJsonSchemaEditorPropsSchema = PropertyUICommonPropsSchema.extend({
  component: z.literal("json-schema-editor"),
})

// Conditions editor component schema
const PropertyUIConditionsEditorPropsSchema = PropertyUICommonPropsSchema.extend({
  component: z.literal("conditions-editor"),
})

// Array section component schema
const PropertyUIArraySectionPropsSchema = PropertyUICommonPropsSchema.extend({
  add_label: I18nEntrySchema.optional(),
  collapsible: z.boolean().optional(),
  component: z.literal("array-section"),
  empty_message: I18nEntrySchema.optional(),
  remove_tooltip: I18nEntrySchema.optional(),
  sortable: z.boolean().optional(),
})
{
  const _: IsEqual<
    z.infer<typeof PropertyUIArraySectionPropsSchema>,
    PropertyUIArraySectionProps
  > = true
}

// Collapsible panel component schema
const PropertyUICollapsiblePanelPropsSchema = PropertyUICommonPropsSchema.extend({
  collapsible: z.boolean().optional(),
  component: z.literal("collapsible-panel"),
  default_collapsed: z.boolean().optional(),
  panel_title: I18nEntrySchema.optional(),
  remove_tooltip: I18nEntrySchema.optional(),
  sortable: z.boolean().optional(),
})
{
  const _: IsEqual<
    z.infer<typeof PropertyUICollapsiblePanelPropsSchema>,
    PropertyUICollapsiblePanelProps
  > = true
}

// Section component schema
const PropertyUISectionPropsSchema = PropertyUICommonPropsSchema.extend({
  component: z.literal("section"),
})

export const PropertyUIPropsSchema = z.discriminatedUnion("component", [
  PropertyUIInputPropsSchema,
  PropertyUITextareaPropsSchema,
  PropertyUINumberInputPropsSchema,
  PropertyUICodeEditorPropsSchema,
  PropertyUISingleSelectPropsSchema,
  PropertyUIRadioGroupPropsSchema,
  PropertyUIEmojiPickerPropsSchema,
  PropertyUIColorPickerPropsSchema,
  PropertyUIMultiSelectPropsSchema,
  PropertyUISwitchPropsSchema,
  PropertyUISliderPropsSchema,
  PropertyUIKeyValueEditorPropsSchema,
  PropertyUITagInputPropsSchema,
  PropertyUICredentialSelectPropsSchema,
  PropertyUIJsonSchemaEditorPropsSchema,
  PropertyUIConditionsEditorPropsSchema,
  PropertyUIArraySectionPropsSchema,
  PropertyUICollapsiblePanelPropsSchema,
  PropertyUIEncryptedInputPropsSchema,
])
{
  const _: IsEqual<z.infer<typeof PropertyUIPropsSchema>, PropertyUIProps> = true
}

export const PropertyUIBooleanSchema = z.discriminatedUnion("component", [
  PropertyUISwitchPropsSchema,
])
{
  const _: IsEqual<z.infer<typeof PropertyUIBooleanSchema>, PropertyUIBoolean> = true
}

export const PropertyUINumberSchema = z.discriminatedUnion("component", [
  PropertyUINumberInputPropsSchema,
  PropertyUISliderPropsSchema,
])
{
  const _: IsEqual<z.infer<typeof PropertyUINumberSchema>, PropertyUINumber> = true
}

export const PropertyUIStringSchema = z.discriminatedUnion("component", [
  PropertyUIInputPropsSchema,
  PropertyUITextareaPropsSchema,
  PropertyUICodeEditorPropsSchema,
  PropertyUISingleSelectPropsSchema,
  PropertyUICredentialSelectPropsSchema,
  PropertyUIRadioGroupPropsSchema,
  PropertyUIEmojiPickerPropsSchema,
  PropertyUIColorPickerPropsSchema,
])
{
  const _: IsEqual<z.infer<typeof PropertyUIStringSchema>, PropertyUIString> = true
}

export const PropertyUIArraySchema = z.discriminatedUnion("component", [
  PropertyUIMultiSelectPropsSchema,
  PropertyUITagInputPropsSchema,
  PropertyUIKeyValueEditorPropsSchema,
  PropertyUISliderPropsSchema,
  PropertyUIArraySectionPropsSchema,
])
{
  const _: IsEqual<z.infer<typeof PropertyUIArraySchema>, PropertyUIArray> = true
}

export const PropertyUIObjectSchema = z.discriminatedUnion("component", [
  PropertyUICollapsiblePanelPropsSchema,
  PropertyUISectionPropsSchema,
  PropertyUIJsonSchemaEditorPropsSchema,
  PropertyUIConditionsEditorPropsSchema,
  PropertyUICodeEditorPropsSchema,
])
{
  const _: IsEqual<z.infer<typeof PropertyUIObjectSchema>, PropertyUIObject> = true
}

export const PropertyUICredentialIdSchema = z.discriminatedUnion("component", [
  PropertyUICredentialSelectPropsSchema,
])
{
  const _: IsEqual<z.infer<typeof PropertyUICredentialIdSchema>, PropertyUICredentialId> = true
}

export const PropertyUIDiscriminatorUISchema = z.discriminatedUnion("component", [
  PropertyUISwitchPropsSchema,
  PropertyUISingleSelectPropsSchema,
  PropertyUIRadioGroupPropsSchema,
])

export const PropertyUIDiscriminatorUnionUISchema = z.discriminatedUnion("component", [
  PropertyUICollapsiblePanelPropsSchema,
])

export const PropertyUIEncryptedStringSchema = z.discriminatedUnion("component", [
  PropertyUIEncryptedInputPropsSchema,
])
