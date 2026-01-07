import type { JsonObject, JsonValue } from "type-fest"
import type { I18nText } from "./common"
import type {
  NodePropertyUIArray,
  NodePropertyUIBoolean,
  NodePropertyUICommonProps,
  NodePropertyUICredentialId,
  NodePropertyUINumber,
  NodePropertyUIObject,
  NodePropertyUIRadioGroupProps,
  NodePropertyUISingleSelectProps,
  NodePropertyUIString,
  NodePropertyUISwitchProps,
} from "./node-property-ui"

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

// type ExpressionValue = string

export interface NodePropertyBase<TName extends string = string> {
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
   * Restrict value to a set of allowed values
   */
  enum?: Array<JsonValue>
  /**
   * Restrict value to a single constant
   */
  constant?: JsonValue
  /**
   * Default value when not specified
   */
  default?: JsonValue
  /**
   * AI-related configuration
   */
  ai?: {
    llm_description?: I18nText
  }
  /**
   * UI configuration for how the property is displayed
   */
  ui?: NodePropertyUICommonProps
}

export interface NodePropertyString<TName extends string = string> extends NodePropertyBase<TName> {
  type: "string"
  constant?: string
  default?: string
  enum?: Array<string>
  /**
   * Maximum string length
   */
  max_length?: number
  /**
   * Minimum string length
   */
  min_length?: number
  ui?: NodePropertyUIString
}

export interface NodePropertyNumber<TName extends string = string> extends NodePropertyBase<TName> {
  type: "number" | "integer"
  constant?: number
  default?: number
  enum?: Array<number>
  /**
   * Maximum value (inclusive)
   */
  maximum?: number
  /**
   * Minimum value (inclusive)
   */
  minimum?: number
  ui?: NodePropertyUINumber
}

export interface NodePropertyBoolean<TName extends string = string>
  extends NodePropertyBase<TName> {
  type: "boolean"
  constant?: boolean
  default?: boolean
  enum?: Array<boolean>
  ui?: NodePropertyUIBoolean
}

export interface NodePropertyObject<
  TName extends string = string,
  TValue extends Record<string, JsonValue> = Record<string, JsonValue>,
> extends NodePropertyBase<TName> {
  type: "object"
  /**
   * Child properties of the object
   */
  properties: Array<
    NodeProperty<TValue extends Record<string, JsonValue> ? Exclude<keyof TValue, number> : string>
  >
  constant?: TValue
  default?: TValue
  enum?: Array<TValue>
  ui?: NodePropertyUIObject
}

export type DiscriminatedUnion<
  TDiscriminator extends string = string,
  TDiscriminatorValue extends string | number | boolean = string | number | boolean,
> = {
  type: "discriminated_union"
  /**
   * Possible object types in the array; name is ignored when used in anyOf (used for grouping)
   */
  any_of: Array<
    NodePropertyObject<
      string,
      Record<string, JsonValue> & {
        [K in TDiscriminator]: TDiscriminatorValue
      }
    >
  >
  /**
   * Property name used to discriminate between types
   */
  discriminator: TDiscriminator
  /**
   * UI component for displaying the discriminator field
   */
  discriminator_ui?:
    | NodePropertyUISwitchProps
    | NodePropertyUISingleSelectProps
    | NodePropertyUIRadioGroupProps
}

export interface NodePropertyArray<TName extends string = string> extends NodePropertyBase<TName> {
  type: "array"
  constant?: Array<JsonValue>
  default?: Array<JsonValue>
  enum?: Array<Array<JsonValue>>
  /**
   * Item schema: uniform type or discriminated union
   */
  items:
    | NodeProperty // uniform items - array with same type for all elements
    | DiscriminatedUnion // discriminated union - polymorphic array items
  /**
   * Maximum array size (inclusive)
   */
  max_items?: number
  /**
   * Minimum array size (inclusive)
   */
  min_items?: number
  ui?: NodePropertyUIArray
}

export interface NodePropertyCredentialId<TName extends string = string>
  extends NodePropertyBase<TName> {
  type: "credential_id"
  /**
   * This field is used to map to the credential name defined in the plugin.
   *
   * **Note:** The name must match exactly, otherwise the system will be unable to find the corresponding credential.
   */
  credential_name: string
  ui?: NodePropertyUICredentialId // the ui component for selecting the credential
}

export type NodeProperty<TName extends string = string, TValue extends JsonValue = JsonValue> =
  | NodePropertyArray<TName>
  | NodePropertyObject<TName, TValue extends JsonObject ? TValue : JsonObject>
  | NodePropertyString<TName>
  | NodePropertyBoolean<TName>
  | NodePropertyNumber<TName>
  | NodePropertyCredentialId<TName>
