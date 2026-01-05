import type { JsonObject, JsonValue } from "type-fest"
import type {
  NodePropertyUIArray,
  NodePropertyUIBoolean,
  NodePropertyUICommonProps,
  NodePropertyUINumber,
  NodePropertyUIObject,
  NodePropertyUIRadioGroupProps,
  NodePropertyUISingleSelectProps,
  NodePropertyUIString,
  NodePropertyUISwitchProps,
} from "./node-property-ui.type"
import type { I18nText } from "./types"

// TSchema is parent data schema type(all siblings but without itself)
export type DisplayCondition<TSchema extends JsonObject = JsonObject> =
  | {
      [P in keyof TSchema]?: Condition<TSchema[P]>
    }
  | RootFilter<TSchema>

/**
 * Root Filter Operators for group conditions
 */
interface RootFilter<TSchema extends JsonObject = JsonObject> {
  $and?: Array<DisplayCondition<TSchema>>
  $nor?: Array<DisplayCondition<TSchema>>
  $or?: Array<DisplayCondition<TSchema>>
}

type Condition<T extends JsonValue = JsonValue> = T | FilterOperators<T>

/**
 * Filter Operators
 * reference: https://www.mongodb.com/docs/manual/reference/mql/query-predicates/
 */
export interface FilterOperators<TValue extends JsonValue = JsonValue> {
  $eq?: TValue
  $exists?: boolean
  $gt?: TValue
  $gte?: TValue
  $in?: Array<TValue>
  $lt?: TValue
  $lte?: TValue
  $mod?: TValue extends number ? [number, number] : never
  $ne?: TValue
  $nin?: Array<TValue>
  $options?: TValue extends string ? string : never
  $regex?: TValue extends string ? RegExp | string : never
  $size?: TValue extends Array<unknown> ? number : never
}

export interface NodePropertyBase<TName extends string = string> {
  name: TName
  display_name?: I18nText
  required?: boolean
  /**
   * display condition for this property
   * if not set, the property is always displayed
   */
  display?: {
    // do not pass TValue to Condition,
    // because display condition only works on sibling properties
    hide?: DisplayCondition
    show?: DisplayCondition
  }
  /**
   * restrict to a fixed set of values
   */
  enum?: Array<JsonValue>
  /**
   * restrict to a single value
   */
  constant?: JsonValue
  /**
   * default value for the property
   */
  default?: JsonValue
  ai?: {
    llm_description?: I18nText
  }
  ui?: NodePropertyUICommonProps
}

export interface NodePropertyString<TName extends string = string> extends NodePropertyBase<TName> {
  type: "string"
  constant?: string
  default?: string
  enum?: Array<string>
  max_length?: number
  min_length?: number
  ui?: NodePropertyUIString
}

export interface NodePropertyNumber<TName extends string = string> extends NodePropertyBase<TName> {
  type: "number" | "integer"
  constant?: number
  default?: number
  enum?: Array<number>
  maximum?: number
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
  properties: Array<NodeProperty<keyof TValue extends string ? keyof TValue : never>>
  constant?: TValue
  default?: TValue
  enum?: Array<TValue>
  ui?: NodePropertyUIObject
}

export type ArrayDiscriminatedItems<
  TDiscriminator extends string = string,
  TDiscriminatorValue extends string | number | boolean = string | number | boolean,
> = {
  /**
   * possible object item types in the array
   * when NodePropertyObject is child of anyOf, name will be ignored because NodePropertyObject is used for grouping or wrapping properties
   */
  anyOf: Array<
    NodePropertyObject<
      string,
      Record<string, JsonValue> & {
        [K in TDiscriminator]: TDiscriminatorValue
      }
    >
  >
  /**
   * which property is used as discriminator
   */
  discriminator: TDiscriminator
  // only these ui components are supported for displaying discriminator field
  discriminatorUi?:
    | NodePropertyUISwitchProps
    | NodePropertyUISingleSelectProps
    | NodePropertyUIRadioGroupProps
}

export interface NodePropertyArray<TName extends string = string> extends NodePropertyBase<TName> {
  type: "array"
  constant?: Array<JsonValue>
  default?: Array<JsonValue>
  enum?: Array<Array<JsonValue>>
  items:
    | NodeProperty // most common case, array of uniform items
    | ArrayDiscriminatedItems // discriminated union case, used for polymorphic array items
  max_items?: number
  min_items?: number
  ui?: NodePropertyUIArray
}

export type NodeProperty<TName extends string = string, TValue extends JsonValue = JsonValue> =
  | NodePropertyArray<TName>
  | NodePropertyObject<TName, TValue extends JsonObject ? TValue : JsonObject>
  | NodePropertyString<TName>
  | NodePropertyBoolean<TName>
  | NodePropertyNumber<TName>
