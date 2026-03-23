import { describe, expect, test } from "bun:test"
import type { CredentialDefinition } from "../../src/types"
import { serializeFeature } from "../../src/utils/serialize-feature"

// Feature type for testing - any object with name and description
type Feature = Pick<CredentialDefinition, "name" | "description">

describe("serializeFeature", () => {
  test("should serialize feature with only primitive values", () => {
    const feature = {
      name: "Test Feature",
      description: {
        en_US: "A test feature",
      },
      version: "1.0.0",
    } as Feature & { version: string }
    const result = serializeFeature(feature)
    expect(result).toEqual({
      name: {
        en_US: "Test Feature",
      },
      description: {
        en_US: "A test feature",
      },
      version: "1.0.0",
    })
  })

  test("should exclude functions from serialization", () => {
    const feature = {
      name: "Test Feature",
      description: {
        en_US: "Test Description",
      },
      handler: () => {
        return "result"
      },
      config: {
        enabled: true,
      },
    } as Feature & { handler: () => string; config: { enabled: boolean } }
    const result = serializeFeature(feature)
    expect(result).toEqual({
      name: "Test Feature",
      description: {
        en_US: "Test Description",
      },
      config: {
        enabled: true,
      },
    })
    expect(result).not.toHaveProperty("handler")
  })

  test("should exclude multiple functions", () => {
    const feature = {
      name: "Test Feature",
      description: {
        en_US: "Test Description",
      },
      execute: () => {},
      validate: () => {},
      metadata: {
        author: "Test",
      },
    } as Feature & {
      execute: () => void
      validate: () => void
      metadata: { author: string }
    }
    const result = serializeFeature(feature)
    expect(result).toEqual({
      name: "Test Feature",
      description: {
        en_US: "Test Description",
      },
      metadata: {
        author: "Test",
      },
    })
    expect(result).not.toHaveProperty("execute")
    expect(result).not.toHaveProperty("validate")
  })

  test("should handle feature with only functions", () => {
    const feature = {
      name: "Test Feature",
      description: {
        en_US: "Test Description",
      },
      handler: () => {},
      executor: () => {},
    } as Feature & { handler: () => void; executor: () => void }
    const result = serializeFeature(feature)
    expect(result).toEqual({
      name: "Test Feature",
      description: {
        en_US: "Test Description",
      },
    })
  })

  test("should handle empty feature object", () => {
    const feature = {
      name: "Test Feature",
      description: {
        en_US: "Test Description",
      },
    } satisfies Feature
    const result = serializeFeature(feature)
    expect(result).toEqual({
      name: "Test Feature",
      description: {
        en_US: "Test Description",
      },
    })
  })

  test("should preserve nested objects", () => {
    const feature = {
      name: "Test Feature",
      description: {
        en_US: "Test Description",
      },
      config: {
        nested: {
          deep: {
            value: "test",
          },
        },
      },
    } as Feature & {
      config: { nested: { deep: { value: string } } }
    }
    const result = serializeFeature(feature)
    expect(result).toEqual({
      name: "Test Feature",
      description: {
        en_US: "Test Description",
      },
      config: {
        nested: {
          deep: {
            value: "test",
          },
        },
      },
    })
  })

  test("should handle arrays", () => {
    const feature = {
      name: "Test Feature",
      description: {
        en_US: "Test Description",
      },
      tags: ["tag1", "tag2", "tag3"],
    } as Feature & { tags: string[] }
    const result = serializeFeature(feature)
    expect(result).toEqual({
      name: "Test Feature",
      description: {
        en_US: "Test Description",
      },
      tags: ["tag1", "tag2", "tag3"],
    })
  })

  test("should handle null and undefined values", () => {
    const feature = {
      name: "Test Feature",
      description: {
        en_US: "Test Description",
      },
      nullable: null,
      optional: undefined,
      value: "test",
    } as Feature & {
      nullable: null
      optional: undefined
      value: string
    }
    const result = serializeFeature(feature)
    expect(result).toHaveProperty("nullable", null)
    expect(result).toHaveProperty("optional", undefined)
    expect(result).toHaveProperty("value", "test")
    expect(result).toHaveProperty("description", { en_US: "Test Description" })
  })

  test("should omit locator_list and resource_mapping function records", () => {
    const feature = {
      name: "Resource Tool",
      description: {
        en_US: "Tool with resource methods",
      },
      locator_list: {
        search_spreadsheets: async () => ({ results: [] }),
        search_sheets: async () => ({ results: [] }),
      },
      resource_mapping: {
        get_fields: async () => ({ fields: [] }),
      },
    } as Feature & {
      locator_list: Record<string, (...args: unknown[]) => unknown>
      resource_mapping: Record<string, (...args: unknown[]) => unknown>
    }

    const result = serializeFeature(feature)
    expect(result).toEqual({
      name: { en_US: "Resource Tool" },
      description: { en_US: "Tool with resource methods" },
    })
  })

  test("should still serialize other function records to method name arrays", () => {
    const feature = {
      name: "Generic Function Record Tool",
      description: {
        en_US: "Tool with generic function record",
      },
      other_methods: {
        foo: async () => "ok",
        bar: async () => "ok2",
      },
    } as Feature & {
      other_methods: Record<string, (...args: unknown[]) => unknown>
    }

    const result = serializeFeature(feature)
    expect(result).toEqual({
      name: { en_US: "Generic Function Record Tool" },
      description: { en_US: "Tool with generic function record" },
      other_methods: ["foo", "bar"],
    })
  })

  test("should keep mixed-value objects unchanged", () => {
    const feature = {
      name: "Mixed Object Tool",
      description: {
        en_US: "Object has both function and non-function values",
      },
      mixed_object: {
        run: () => "ok",
        label: "value",
      },
    } as Feature & {
      mixed_object: Record<string, string | (() => string)>
    }

    const result = serializeFeature(feature)
    expect(result).toEqual({
      name: { en_US: "Mixed Object Tool" },
      description: { en_US: "Object has both function and non-function values" },
      mixed_object: {
        run: expect.any(Function),
        label: "value",
      },
    })
  })
})
