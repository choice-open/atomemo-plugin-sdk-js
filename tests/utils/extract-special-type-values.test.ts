import { describe, expect, test } from "bun:test"
import { extractSpecialTypeValues } from "../../src/utils/extract-special-type-values"

describe("extractSpecialTypeValues", () => {
  test("should extract resource_locator and resource_mapper values recursively", () => {
    const input = {
      spreadsheet: {
        __type__: "resource_locator",
        mode_name: "list",
        value: "spread-123",
        cached_result_label: "Budget 2024",
      },
      columns: {
        __type__: "resource_mapper",
        mapping_mode: "manual",
        value: { name: "fullName", age: "age" },
      },
      nested: {
        arr: [
          {
            __type__: "resource_locator",
            mode_name: "id",
            value: "sheet-456",
          },
          {
            __type__: "resource_mapper",
            mapping_mode: "auto",
            value: "{{ $json }}",
          },
        ],
      },
      file: {
        __type__: "file_ref",
        source: "mem",
        extension: ".txt",
        content: "aGVsbG8=",
      },
    }

    const result = extractSpecialTypeValues(input)

    expect(result).toEqual({
      spreadsheet: "spread-123",
      columns: { name: "fullName", age: "age" },
      nested: {
        arr: ["sheet-456", "{{ $json }}"],
      },
      file: input.file,
    })
  })
})

