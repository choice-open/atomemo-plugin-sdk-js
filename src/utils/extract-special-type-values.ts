/**
 * Recursively traverses a value and extracts the "raw" payloads from supported
 * `__type__` tagged runtime values.
 *
 * - `resource_locator` -> `value` (string id)
 * - `resource_mapper`  -> `value` (string | Record<string, unknown> | null)
 *
 * Note: `file_ref` is intentionally left unchanged so plugins can use
 * `context.files.*` helpers with the full FileRef object.
 */
function extractSpecialTypeValuesInner(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) {
    return value
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) return value
    seen.add(value)
    return value.map((item) => extractSpecialTypeValuesInner(item, seen))
  }

  if (typeof value === "object") {
    if (seen.has(value as object)) return value
    seen.add(value as object)

    const obj = value as Record<string, unknown>
    const type = obj.__type__

    if (type === "resource_locator") {
      // Note: when `mode_name` is `"url"`, `obj.value` is the raw URL string, not a stable ID.
      // If you need the ID, extract it from the URL using the `extract_value` regex.
      return obj.value
    }

    if (type === "resource_mapper") {
      return obj.value
    }

    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [key, extractSpecialTypeValuesInner(val, seen)]),
    )
  }

  return value
}

export function extractSpecialTypeValues(value: unknown): Record<string, unknown> {
  return extractSpecialTypeValuesInner(value, new WeakSet()) as Record<string, unknown>
}

