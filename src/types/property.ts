import type { JsonObject, JsonValue } from "type-fest"
import type { I18nText } from "./common"
import type {
  PropertyUIArray,
  PropertyUIBoolean,
  PropertyUICollapsiblePanelProps,
  PropertyUICommonProps,
  PropertyUICredentialId,
  PropertyUIEncryptedString,
  PropertyUINumber,
  PropertyUIObject,
  PropertyUIRadioGroupProps,
  PropertyUISingleSelectProps,
  PropertyUIString,
  PropertyUISwitchProps,
} from "./property-ui"

/**
 * Condition for controlling property visibility based on sibling property values
 * @template TSchema - Parent schema containing all sibling properties
 */
export type DisplayCondition<TSchema extends JsonObject = JsonObject> =
  /**
   * Direct property conditions: supports nested paths (e.g., "address.city")
   */
  | {
      [P in keyof TSchema]?: Condition<TSchema[P]>
    }
  /**
   * Logical operators for combining multiple conditions
   */
  | RootFilter<TSchema>

/**
 * Root Filter Operators for group conditions
 */
interface RootFilter<TSchema extends JsonObject = JsonObject> {
  /**
   * Joins conditions with logical AND; all conditions must be true
   */
  $and?: Array<DisplayCondition<TSchema>>
  /**
   * Joins conditions with logical NOR; none of the conditions must be true
   */
  $nor?: Array<DisplayCondition<TSchema>>
  /**
   * Joins conditions with logical OR; at least one condition must be true
   */
  $or?: Array<DisplayCondition<TSchema>>
}

type Condition<T extends JsonValue = JsonValue> = T | FilterOperators<T>

/**
 * Filter Operators
 * reference: https://www.mongodb.com/docs/manual/reference/mql/query-predicates/
 */
export interface FilterOperators<TValue extends JsonValue = JsonValue> {
  /**
   * Matches values equal to a specified value
   */
  $eq?: TValue
  /**
   * Checks if a field exists
   */
  $exists?: boolean
  /**
   * Matches values greater than a specified value
   */
  $gt?: TValue
  /**
   * Matches values greater than or equal to a specified value
   */
  $gte?: TValue
  /**
   * Matches any value specified in an array
   */
  $in?: Array<TValue>
  /**
   * Matches values less than a specified value
   */
  $lt?: TValue
  /**
   * Matches values less than or equal to a specified value
   */
  $lte?: TValue
  /**
   * Matches values based on a modulo operation; value: [divisor, remainder]
   */
  $mod?: TValue extends number ? [number, number] : never
  /**
   * Matches values not equal to a specified value
   */
  $ne?: TValue
  /**
   * Matches values not in a specified array
   */
  $nin?: Array<TValue>
  /**
   * Regex options: i=case-insensitive, m=multiline, x=ignore whitespace, s=dotAll, u=unicode
   */
  $options?: TValue extends string ? string : never
  /**
   * Matches values against a regular expression pattern
   */
  $regex?: TValue extends string ? RegExp | string : never
  /**
   * Matches arrays with a specified number of elements
   */
  $size?: TValue extends Array<unknown> ? number : never
}

export interface PropertyBase<TName extends string = string> {
  /**
   * Unique property name within the same level
   */
  name: TName
  /**
   * Display name (supports i18n)
   */
  display_name?: I18nText
  /**
   * Whether this property is required
   */
  required?: boolean
  /**
   * Display condition; if not set, property is always visible
   */
  display?: {
    // display condition only evaluates sibling properties, not the property itself
    hide?: DisplayCondition
    show?: DisplayCondition
  }
  /**
   * AI-related configuration
   */
  ai?: {
    llm_description?: I18nText
  }
  /**
   * UI configuration for how the property is displayed
   */
  ui?: PropertyUICommonProps
}

export interface PropertyString<TName extends string = string> extends PropertyBase<TName> {
  type: "string"
  /**
   * Restrict value to a single constant
   */
  constant?: string
  /**
   * Default value when not specified
   */
  default?: string
  /**
   * Restrict value to a set of allowed values
   */
  enum?: Array<string>
  /**
   * Maximum string length
   */
  max_length?: number
  /**
   * Minimum string length
   */
  min_length?: number
  ui?: PropertyUIString
}

export interface PropertyNumber<TName extends string = string> extends PropertyBase<TName> {
  type: "number" | "integer"
  /**
   * Restrict value to a single constant
   */
  constant?: number
  /**
   * Default value when not specified
   */
  default?: number
  /**
   * Restrict value to a set of allowed values
   */
  enum?: Array<number>
  /**
   * Maximum value (inclusive)
   */
  maximum?: number
  /**
   * Minimum value (inclusive)
   */
  minimum?: number
  ui?: PropertyUINumber
}

export interface PropertyBoolean<TName extends string = string> extends PropertyBase<TName> {
  type: "boolean"
  /**
   * Restrict value to a single constant
   */
  constant?: boolean
  /**
   * Default value when not specified
   */
  default?: boolean
  /**
   * Restrict value to a set of allowed values
   */
  enum?: Array<boolean>
  ui?: PropertyUIBoolean
}

/**
 * Object Property Type
 * @template TName - Type of the property name
 * @template TDiscriminator - When PropertyObject is used as a variant(any_of) in PropertyDiscriminatedUnion, this type represents the discriminator property name
 * @template TValue - real value type of the object property
 */
export interface PropertyObject<
  TName extends string = string,
  TDiscriminator extends string = string,
  TValue extends Record<string, JsonValue> = Record<string, JsonValue>,
> extends PropertyBase<TName> {
  type: "object"
  /**
   * Child properties of the object
   */
  properties: string extends TDiscriminator
    ? Array<
        Property<TValue extends Record<string, JsonValue> ? Exclude<keyof TValue, number> : string>
      >
    : // when discriminator is specified, ensure the discriminator property is the first property
      [
        Property<TDiscriminator> & { constant: TValue[TDiscriminator] },
        ...Array<
          Property<
            TValue extends Record<string, JsonValue> ? Exclude<keyof TValue, number> : string
          >
        >,
      ]
  /**
   * Restrict value to a single constant
   */
  constant?: TValue
  /**
   * Default value when not specified
   */
  default?: TValue
  /**
   * Restrict value to a set of allowed values
   */
  enum?: Array<TValue>
  /**
   * Schema for additional properties beyond those defined in `properties`.
   * Supports dynamic keys with values conforming to the specified property schema.
   * Semantics similar to JSON Schema's additionalProperties: https://json-schema.org/draft/2019-09/draft-handrews-json-schema-02#additionalProperties
   */
  additional_properties?: Property
  ui?: PropertyUIObject
}

export interface PropertyDiscriminatedUnion<
  TName extends string = string,
  TDiscriminator extends string = string,
> extends PropertyBase<TName> {
  type: "discriminated_union"
  /**
   * Possible object types in the array.
   */
  any_of: Array<PropertyObject<string, TDiscriminator>>
  /**
   * Property name used to discriminate between types
   */
  discriminator: TDiscriminator
  /**
   * UI component for displaying the discriminator field
   */
  discriminator_ui?: PropertyUISwitchProps | PropertyUISingleSelectProps | PropertyUIRadioGroupProps
  ui?: PropertyUICollapsiblePanelProps
}

export interface PropertyArray<TName extends string = string> extends PropertyBase<TName> {
  type: "array"
  constant?: Array<JsonValue>
  default?: Array<JsonValue>
  enum?: Array<Array<JsonValue>>
  /**
   * Item schema for array elements
   */
  items: Property
  /**
   * Maximum array size (inclusive)
   */
  max_items?: number
  /**
   * Minimum array size (inclusive)
   */
  min_items?: number
  ui?: PropertyUIArray
}

export interface PropertyCredentialId<TName extends string = string> extends PropertyBase<TName> {
  type: "credential_id"
  /**
   * This field is used to map to the credential name defined in the plugin.
   *
   * **Note:** The name must match exactly, otherwise the system will be unable to find the corresponding credential.
   */
  credential_name: string
  ui?: PropertyUICredentialId // the ui component for selecting the credential
}

export interface PropertyEncryptedString<TName extends string = string>
  extends PropertyBase<TName> {
  type: "encrypted_string"
  ui?: PropertyUIEncryptedString
}

export type Property<TName extends string = string, TValue extends JsonValue = JsonValue> =
  | PropertyArray<TName>
  | PropertyObject<TName, string, TValue extends JsonObject ? TValue : JsonObject>
  | PropertyString<TName>
  | PropertyBoolean<TName>
  | PropertyNumber<TName>
  | PropertyCredentialId<TName>
  | PropertyEncryptedString<TName>
  | PropertyDiscriminatedUnion<TName, string>
