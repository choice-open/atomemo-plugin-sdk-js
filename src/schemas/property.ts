import { compact } from "es-toolkit"
import type { IsEqual, JsonValue } from "type-fest"
import { z } from "zod"
import type {
  DiscriminatedUnion,
  DisplayCondition,
  FilterOperators,
  Property,
  PropertyArray,
  PropertyBase,
  PropertyBoolean,
  PropertyCredentialId,
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
  constant: JsonValueSchema.optional(),
  default: JsonValueSchema.optional(),
  enum: z.array(JsonValueSchema).optional(),
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

// const expressionSchema = z.custom<string>((val) => {
//   if (typeof val !== "string") return false
//   const trimmed = val.trim()
//   return trimmed.startsWith("={{") && trimmed.endsWith("}}")
// }, "Invalid expression format")

/**
 * check that constant, default, and enum must not contain expression values
 * if ui.support_expression is not true
 */
// function setExpressionValueCheck<T extends z.ZodType<Property>>(schema: T) {
//   return schema.refine(
//     (obj) => {
//       if (obj.ui?.support_expression) return true
//       switch (obj.type) {
//         case "string":
//         case "credential_id": {
//           return true
//         }
//         case "number":
//         case "integer":
//         case "array":
//         case "object":
//         case "boolean": {
//           const checkConstant = obj.constant
//           if (typeof checkConstant === "string") return false
//           const checkDefault = obj.default
//           if (typeof checkDefault === "string") return false
//           const checkEnum = obj.enum
//           return (checkEnum ?? []).every((item) => typeof item !== "string")
//         }
//         default: {
//           const _t: never = obj
//           return false
//         }
//       }
//     },
//     {
//       error:
//         "constant, default, and enum cannot contain expression values if ui.support_expression is not true",
//     },
//   )
// }

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
const ArrayPropertiesSchema: z.ZodType<Array<Property>> = z.lazy(() =>
  z.array(PropertySchema).apply(setDuplicatePropertyNamesCheck),
)

const PropertyObjectSchema = PropertyBaseSchema.extend({
  type: z.literal("object"),
  properties: ArrayPropertiesSchema,
  constant: z.record(z.string(), JsonValueSchema).optional(),
  default: z.record(z.string(), JsonValueSchema).optional(),
  enum: z.array(z.record(z.string(), JsonValueSchema)).optional(),
  ui: PropertyUIObjectSchema.optional(),
})
{
  type PropertyObjectInferred = z.infer<typeof PropertyObjectSchema>
  const _: IsEqual<PropertyObjectInferred, PropertyObject> = true
}

const DiscriminatedUnionSchema = z
  .object({
    type: z.literal("discriminated_union"),
    get any_of() {
      return z.array(PropertyObjectSchema).min(2, "anyOf must have at least two items")
    },
    discriminator: z.string().min(1, "discriminator cannot be empty"),
    discriminator_ui: PropertyUIDiscriminatorUISchema.optional(),
  })
  .refine(
    (v) => {
      const { any_of, discriminator } = v
      return any_of.every((i) => {
        const discriminatorProperty = i.properties.find((p) => p.name === discriminator)
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
          const discriminatorProperty = i.properties.find((p) => p.name === v.discriminator)
          if (!discriminatorProperty) return false
          return discriminatorProperty.constant as string | number | boolean
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
  const schema = DiscriminatedUnionSchema.omit({ any_of: true })
  const _: IsEqual<z.infer<typeof schema>, Omit<DiscriminatedUnion, "any_of">> = true
}

const ItemsSchema: z.ZodType<Property | DiscriminatedUnion> = z.lazy(() =>
  // use type assertion because of generic type plus recursive structure
  z.union([PropertySchema, DiscriminatedUnionSchema as z.ZodType<DiscriminatedUnion>]),
)

const PropertyArraySchema = PropertyBaseSchema.extend({
  type: z.literal("array"),
  constant: z.array(JsonValueSchema).optional(),
  default: z.array(JsonValueSchema).optional(),
  enum: z.array(z.array(JsonValueSchema)).optional(),
  items: ItemsSchema,
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
])
{
  const _: IsEqual<z.infer<typeof PropertySchema>, Property> = true
}

export const PropertiesSchema = z.array(PropertySchema).apply(setDuplicatePropertyNamesCheck)
