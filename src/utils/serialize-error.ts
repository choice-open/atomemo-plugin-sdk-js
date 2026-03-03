import { isFunction } from "es-toolkit/predicate"
import type { JsonValue } from "type-fest"

type JsonObject = Record<string, JsonValue>

const toJsonValue = (value: unknown, seen: WeakSet<object>): JsonValue | undefined => {
  if (value === null) {
    return null
  }

  const type = typeof value

  if (type === "string" || type === "number" || type === "boolean") {
    return value as JsonValue
  }

  if (type === "undefined" || type === "symbol" || type === "bigint" || isFunction(value)) {
    return undefined
  }

  if (Array.isArray(value)) {
    const result: JsonValue[] = []

    for (const item of value) {
      const serialized = toJsonValue(item, seen)
      // 跟随 JSON 的行为：数组中的 undefined/function 等变为 null
      result.push(serialized === undefined ? null : serialized)
    }

    return result
  }

  if (type === "object" && value !== null) {
    if (seen.has(value as object)) {
      return undefined
    }

    seen.add(value as object)

    if (value instanceof Date) {
      return value.toISOString() as JsonValue
    }

    if (value instanceof Error) {
      return serializeError(value) as JsonValue
    }

    const result: JsonObject = {}

    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      const serialized = toJsonValue(v, seen)

      if (serialized !== undefined) {
        result[key] = serialized
      }
    }

    return result
  }

  return undefined
}

export const serializeError = (error: Error): JsonObject => {
  const base: Record<string, unknown> = {
    name: error.name,
    message: error.message,
    stack: error.stack,
  }

  const anyError = error as unknown as { cause?: unknown }

  if ("cause" in anyError && anyError.cause !== undefined) {
    base.cause = anyError.cause
  }

  for (const [key, value] of Object.entries(error as unknown as Record<string, unknown>)) {
    if (key in base) {
      continue
    }

    base[key] = value
  }

  const seen = new WeakSet<object>([error])
  const serialized = toJsonValue(base, seen)

  if (!serialized || Array.isArray(serialized) || typeof serialized !== "object") {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? null,
    }
  }

  return serialized as JsonObject
}
