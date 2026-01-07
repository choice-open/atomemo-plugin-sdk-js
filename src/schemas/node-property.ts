import { compact } from "es-toolkit"
import type { IsEqual, JsonValue } from "type-fest"
import { z } from "zod"
import type {
  DiscriminatedUnion,
  DisplayCondition,
  FilterOperators,
  NodeProperty,
  NodePropertyArray,
  NodePropertyBase,
  NodePropertyBoolean,
  NodePropertyCredentialId,
  NodePropertyEncryptedString,
  NodePropertyNumber,
  NodePropertyObject,
  NodePropertyString,
} from "../types"
import { I18nEntrySchema } from "./common"
import {
  NodePropertyUIArraySchema,
  NodePropertyUIBooleanSchema,
  NodePropertyUICommonPropsSchema,
  NodePropertyUICredentialIdSchema,
  NodePropertyUIDiscriminatorUISchema,
  NodePropertyUIEncryptedStringSchema,
  NodePropertyUINumberSchema,
  NodePropertyUIObjectSchema,
  NodePropertyUIStringSchema,
} from "./node-property-ui"

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

const NodePropertyBaseSchema = z.object({
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
  ui: NodePropertyUICommonPropsSchema.optional(),
})
{
  const _: IsEqual<z.infer<typeof NodePropertyBaseSchema>, NodePropertyBase<string>> = true
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
// function setExpressionValueCheck<T extends z.ZodType<NodeProperty>>(schema: T) {
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

const NodePropertyStringSchema = NodePropertyBaseSchema.extend({
  type: z.literal("string"),
  constant: z.string().optional(),
  default: z.string().optional(),
  enum: z.array(z.string()).optional(),
  max_length: z.number().optional(),
  min_length: z.number().optional(),
  ui: NodePropertyUIStringSchema.optional(),
})
{
  const _: IsEqual<z.infer<typeof NodePropertyStringSchema>, NodePropertyString<string>> = true
}

const NodePropertyNumberSchema = NodePropertyBaseSchema.extend({
  type: z.union([z.literal("number"), z.literal("integer")]),
  constant: z.number().optional(),
  default: z.number().optional(),
  enum: z.array(z.number()).optional(),
  maximum: z.number().optional(),
  minimum: z.number().optional(),
  ui: NodePropertyUINumberSchema.optional(),
})
{
  const _: IsEqual<z.infer<typeof NodePropertyNumberSchema>, NodePropertyNumber<string>> = true
}

const NodePropertyBooleanSchema = NodePropertyBaseSchema.extend({
  type: z.literal("boolean"),
  constant: z.boolean().optional(),
  default: z.boolean().optional(),
  enum: z.array(z.boolean()).optional(),
  ui: NodePropertyUIBooleanSchema.optional(),
})
{
  const _: IsEqual<z.infer<typeof NodePropertyBooleanSchema>, NodePropertyBoolean<string>> = true
}

function setDuplicatePropertyNamesCheck<T extends z.ZodType<Array<NodeProperty>>>(schema: T) {
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
const PropertiesSchema: z.ZodType<Array<NodeProperty>> = z.lazy(() =>
  z.array(NodePropertySchema).apply(setDuplicatePropertyNamesCheck),
)

const NodePropertyObjectSchema = NodePropertyBaseSchema.extend({
  type: z.literal("object"),
  properties: PropertiesSchema,
  constant: z.record(z.string(), JsonValueSchema).optional(),
  default: z.record(z.string(), JsonValueSchema).optional(),
  enum: z.array(z.record(z.string(), JsonValueSchema)).optional(),
  ui: NodePropertyUIObjectSchema.optional(),
})
{
  type NodePropertyObjectInferred = z.infer<typeof NodePropertyObjectSchema>
  const _: IsEqual<NodePropertyObjectInferred, NodePropertyObject> = true
}

const DiscriminatedUnionSchema = z
  .object({
    type: z.literal("discriminated_union"),
    get any_of() {
      return z.array(NodePropertyObjectSchema).min(2, "anyOf must have at least two items")
    },
    discriminator: z.string().min(1, "discriminator cannot be empty"),
    discriminator_ui: NodePropertyUIDiscriminatorUISchema.optional(),
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

const ItemsSchema: z.ZodType<NodeProperty | DiscriminatedUnion> = z.lazy(() =>
  // use type assertion because of generic type plus recursive structure
  z.union([NodePropertySchema, DiscriminatedUnionSchema as z.ZodType<DiscriminatedUnion>]),
)

const NodePropertyArraySchema = NodePropertyBaseSchema.extend({
  type: z.literal("array"),
  constant: z.array(JsonValueSchema).optional(),
  default: z.array(JsonValueSchema).optional(),
  enum: z.array(z.array(JsonValueSchema)).optional(),
  items: ItemsSchema,
  max_items: z.number().optional(),
  min_items: z.number().optional(),
  ui: NodePropertyUIArraySchema.optional(),
})
{
  const _: IsEqual<z.infer<typeof NodePropertyArraySchema>, NodePropertyArray> = true
}

const NodePropertyCredentialIdSchema = NodePropertyBaseSchema.extend({
  type: z.literal("credential_id"),
  credential_name: z.string().min(1, "credential_name cannot be empty"),
  ui: NodePropertyUICredentialIdSchema.optional(),
})

{
  const _: IsEqual<
    z.infer<typeof NodePropertyCredentialIdSchema>,
    NodePropertyCredentialId<string>
  > = true
}
const NodePropertyEncryptedStringSchema = NodePropertyBaseSchema.extend({
  type: z.literal("encrypted_string"),
  ui: NodePropertyUIEncryptedStringSchema.optional(),
})
{
  const _: IsEqual<
    z.infer<typeof NodePropertyEncryptedStringSchema>,
    NodePropertyEncryptedString
  > = true
}

const NodePropertySchema = z.union([
  NodePropertyStringSchema,
  NodePropertyBooleanSchema,
  NodePropertyNumberSchema,
  NodePropertyArraySchema,
  NodePropertyObjectSchema,
  NodePropertyCredentialIdSchema,
  NodePropertyEncryptedStringSchema,
])
{
  const _: IsEqual<z.infer<typeof NodePropertySchema>, NodeProperty> = true
}

export const NodePropertiesSchema = z
  .array(NodePropertySchema)
  .apply(setDuplicatePropertyNamesCheck)
