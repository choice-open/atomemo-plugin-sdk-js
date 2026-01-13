import { compact } from "es-toolkit"
import type { IsEqual, JsonValue } from "type-fest"
import { z } from "zod"
import type {
  DisplayCondition,
  FilterOperators,
  Property,
  PropertyArray,
  PropertyBase,
  PropertyBoolean,
  PropertyCredentialId,
  PropertyDiscriminatedUnion,
  PropertyEncryptedString,
  PropertyNumber,
  PropertyObject,
  PropertyString,
} from "../types"
import { I18nEntrySchema } from "./common"
import {
  PropertyUIArraySchema,
  PropertyUIBooleanSchema,
  PropertyUICommonPropsSchema,
  PropertyUICredentialIdSchema,
  PropertyUIDiscriminatorUISchema,
  PropertyUIDiscriminatorUnionUISchema,
  PropertyUIEncryptedStringSchema,
  PropertyUINumberSchema,
  PropertyUIObjectSchema,
  PropertyUIStringSchema,
} from "./property-ui"

const JsonPrimitiveSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([JsonPrimitiveSchema, z.array(JsonValueSchema), z.record(z.string(), JsonValueSchema)]),
)

const FilterOperatorsSchema = z.object({
  $eq: JsonValueSchema.optional(),
  $exists: z.boolean().optional(),
  $gt: JsonValueSchema.optional(),
  $gte: JsonValueSchema.optional(),
  $in: z.array(JsonValueSchema).optional(),
  $lt: JsonValueSchema.optional(),
  $lte: JsonValueSchema.optional(),
  $mod: z.tuple([z.number(), z.number()]).optional(),
  $ne: JsonValueSchema.optional(),
  $nin: z.array(JsonValueSchema).optional(),
  $options: z.string().optional(),
  $regex: z.union([z.string(), z.instanceof(RegExp)]).optional(),
  $size: z.number().optional(),
})

const ConditionSchema = z.union([JsonValueSchema, FilterOperatorsSchema])

const RootFilterSchema = z.object({
  get $and() {
    return z.array(FilterSchema).optional()
  },
  get $nor() {
    return z.array(FilterSchema).optional()
  },
  get $or() {
    return z.array(FilterSchema).optional()
  },
})
{
  const _: IsEqual<z.infer<typeof FilterOperatorsSchema>, FilterOperators> = true
}

// skip infer because of recursive structure
const FilterSchema: z.ZodType<DisplayCondition> = z.union([
  z.record(z.string(), ConditionSchema),
  RootFilterSchema,
])

const PropertyBaseSchema = z.object({
  name: z
    .string()
    .min(1, "name cannot be empty")
    .refine(
      (val) => {
        const regexStartsWithDollarOrWhitespace = /^[\s$]/
        return !regexStartsWithDollarOrWhitespace.test(val)
      },
      {
        error: "name cannot start with $ or whitespace",
        abort: true,
      },
    )
    .refine(
      (val) => {
        const forbiddenCharacters = [".", "[", "]"]
        return !forbiddenCharacters.some((char) => val.includes(char))
      },
      {
        error: 'name cannot contain ".", "[", or "]" characters',
        abort: true,
      },
    ),

  display_name: I18nEntrySchema.optional(),
  required: z.boolean().optional(),
  display: z
    .object({
      hide: FilterSchema.optional(),
      show: FilterSchema.optional(),
    })
    .optional(),
  ai: z
    .object({
      llm_description: I18nEntrySchema.optional(),
    })
    .optional(),
  ui: PropertyUICommonPropsSchema.optional(),
})
{
  const _: IsEqual<z.infer<typeof PropertyBaseSchema>, PropertyBase<string>> = true
}

const PropertyStringSchema = PropertyBaseSchema.extend({
  type: z.literal("string"),
  constant: z.string().optional(),
  default: z.string().optional(),
  enum: z.array(z.string()).optional(),
  max_length: z.number().optional(),
  min_length: z.number().optional(),
  ui: PropertyUIStringSchema.optional(),
})
{
  const _: IsEqual<z.infer<typeof PropertyStringSchema>, PropertyString<string>> = true
}

const PropertyNumberSchema = PropertyBaseSchema.extend({
  type: z.union([z.literal("number"), z.literal("integer")]),
  constant: z.number().optional(),
  default: z.number().optional(),
  enum: z.array(z.number()).optional(),
  maximum: z.number().optional(),
  minimum: z.number().optional(),
  ui: PropertyUINumberSchema.optional(),
})
{
  const _: IsEqual<z.infer<typeof PropertyNumberSchema>, PropertyNumber<string>> = true
}

const PropertyBooleanSchema = PropertyBaseSchema.extend({
  type: z.literal("boolean"),
  constant: z.boolean().optional(),
  default: z.boolean().optional(),
  enum: z.array(z.boolean()).optional(),
  ui: PropertyUIBooleanSchema.optional(),
})
{
  const _: IsEqual<z.infer<typeof PropertyBooleanSchema>, PropertyBoolean<string>> = true
}

function setDuplicatePropertyNamesCheck<T extends z.ZodType<Array<Property>>>(schema: T) {
  return schema.refine(
    (properties) => {
      const names = new Set<string>()
      for (const prop of properties) {
        if (names.has(prop.name)) return false
        names.add(prop.name)
      }
      return true
    },
    {
      error: "duplicate property names are not allowed",
    },
  )
}

// use type assertion and lazy to avoid circular reference error
const ArrayPropertiesSchema: z.ZodType<PropertyObject["properties"]> = z.lazy(() =>
  z.array(PropertySchema).apply(setDuplicatePropertyNamesCheck),
)

const additionalPropertiesSchema: z.ZodType<Property> = z.lazy(() => PropertySchema)

const PropertyObjectSchema = PropertyBaseSchema.extend({
  type: z.literal("object"),
  properties: ArrayPropertiesSchema,
  additional_properties: additionalPropertiesSchema.optional(),
  constant: z.record(z.string(), JsonValueSchema).optional(),
  default: z.record(z.string(), JsonValueSchema).optional(),
  enum: z.array(z.record(z.string(), JsonValueSchema)).optional(),
  ui: PropertyUIObjectSchema.optional(),
}).refine(
  (v) => {
    if (v.constant) return v.properties.length === 0
    return true
  },
  {
    error: "properties must be empty when constant is defined",
    abort: true,
  },
)
{
  type PropertyObjectInferred = z.infer<typeof PropertyObjectSchema>
  const _: IsEqual<PropertyObjectInferred, PropertyObject> = true
}

const PropertyDiscriminatedUnionSchema = PropertyBaseSchema.extend({
  type: z.literal("discriminated_union"),
  get any_of() {
    return z
      .array(PropertyObjectSchema.pick({ name: true, type: true, properties: true }))
      .min(2, "anyOf must have at least two items")
  },
  discriminator: z.string().min(1, "discriminator cannot be empty"),
  discriminator_ui: PropertyUIDiscriminatorUISchema.optional(),
  ui: PropertyUIDiscriminatorUnionUISchema.optional(),
})
  .refine(
    (v) => {
      const { any_of, discriminator } = v
      return any_of.every((i) => {
        const discriminatorProperty = i.properties?.find((p) => p.name === discriminator)
        if (!discriminatorProperty) return false
        if (!("constant" in discriminatorProperty)) return false
        if (
          typeof discriminatorProperty.constant !== "string" &&
          typeof discriminatorProperty.constant !== "number" &&
          typeof discriminatorProperty.constant !== "boolean"
        ) {
          return false
        }
        return true
      })
    },
    {
      error:
        "Each item in anyOf must contain the discriminator field with constant string/number/boolean value",
      abort: true,
    },
  )
  .refine(
    (v) => {
      const { any_of } = v
      const allDiscriminatorProperty = compact(
        any_of.map((i) => {
          const discriminatorProperty = i.properties?.find((p) => p.name === v.discriminator)
          if (!discriminatorProperty) return null
          if (!("constant" in discriminatorProperty)) return null
          return discriminatorProperty.constant
        }),
      )
      const uniqueValues = new Set(allDiscriminatorProperty)
      return uniqueValues.size === allDiscriminatorProperty.length
    },
    {
      error: "Discriminator values must be unique across all anyOf items",
    },
  )
{
  const _: IsEqual<
    z.infer<typeof PropertyDiscriminatedUnionSchema>,
    PropertyDiscriminatedUnion
  > = true
}

const PropertyArraySchema = PropertyBaseSchema.extend({
  type: z.literal("array"),
  constant: z.array(JsonValueSchema).optional(),
  default: z.array(JsonValueSchema).optional(),
  enum: z.array(z.array(JsonValueSchema)).optional(),
  get items() {
    return PropertySchema
  },
  max_items: z.number().optional(),
  min_items: z.number().optional(),
  ui: PropertyUIArraySchema.optional(),
})
{
  const _: IsEqual<z.infer<typeof PropertyArraySchema>, PropertyArray> = true
}

const PropertyCredentialIdSchema = PropertyBaseSchema.extend({
  type: z.literal("credential_id"),
  credential_name: z.string().min(1, "credential_name cannot be empty"),
  ui: PropertyUICredentialIdSchema.optional(),
})

{
  const _: IsEqual<z.infer<typeof PropertyCredentialIdSchema>, PropertyCredentialId<string>> = true
}
const PropertyEncryptedStringSchema = PropertyBaseSchema.extend({
  type: z.literal("encrypted_string"),
  ui: PropertyUIEncryptedStringSchema.optional(),
})
{
  const _: IsEqual<z.infer<typeof PropertyEncryptedStringSchema>, PropertyEncryptedString> = true
}

const PropertySchema = z.union([
  PropertyStringSchema,
  PropertyBooleanSchema,
  PropertyNumberSchema,
  PropertyArraySchema,
  PropertyObjectSchema,
  PropertyCredentialIdSchema,
  PropertyEncryptedStringSchema,
  PropertyDiscriminatedUnionSchema,
])
{
  const _: IsEqual<z.infer<typeof PropertySchema>, Property> = true
}

export const PropertiesSchema = z.array(PropertySchema).apply(setDuplicatePropertyNamesCheck)
