import { FileRefSchema } from "@choiceopen/atomemo-plugin-schema/schemas"

function parseFileRefsInner(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) {
    return value
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) return value
    seen.add(value)
    return value.map((item) => parseFileRefsInner(item, seen))
  }

  if (typeof value === "object") {
    if (seen.has(value as object)) return value
    seen.add(value as object)

    const obj = value as Record<string, unknown>

    if (obj.__type__ === "file_ref") {
      return FileRefSchema.parse(obj)
    }

    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [key, parseFileRefsInner(val, seen)]),
    )
  }

  return value
}

/**
 * Recursively traverses a value and parses any plain objects with
 * `__type__: "file_ref"` into validated FileRef structures.
 *
 * This mirrors the behavior of Elixir SDK's recursive file_ref parsing
 * in invoke_tool parameter handling.
 */
export function parseFileRefs(value: unknown): unknown {
  return parseFileRefsInner(value, new WeakSet())
}
