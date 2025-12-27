import { describe, expect, test } from "bun:test"
import type { Feature } from "../../src/core/provider"
import { serializeFeature } from "../../src/utils/serialize-feature"

describe("serializeFeature", () => {
  test("should serialize feature with only primitive values", () => {
    const feature = {
      name: {
        en_US: "Test Feature",
      },
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
      name: {
        en_US: "Test Feature",
      },
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
      name: {
        en_US: "Test Feature",
      },
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
      name: {
        en_US: "Test Feature",
      },
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
      name: {
        en_US: "Test Feature",
      },
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
      name: {
        en_US: "Test Feature",
      },
      description: {
        en_US: "Test Description",
      },
      handler: () => {},
      executor: () => {},
    } as Feature & { handler: () => void; executor: () => void }
    const result = serializeFeature(feature)
    expect(result).toEqual({
      name: {
        en_US: "Test Feature",
      },
      description: {
        en_US: "Test Description",
      },
    })
  })

  test("should handle empty feature object", () => {
    const feature: Feature = {
      name: {
        en_US: "Test Feature",
      },
      description: {
        en_US: "Test Description",
      },
    }
    const result = serializeFeature(feature)
    expect(result).toEqual({
      name: {
        en_US: "Test Feature",
      },
      description: {
        en_US: "Test Description",
      },
    })
  })

  test("should preserve nested objects", () => {
    const feature = {
      name: {
        en_US: "Test Feature",
      },
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
      name: {
        en_US: "Test Feature",
      },
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
      name: {
        en_US: "Test Feature",
      },
      description: {
        en_US: "Test Description",
      },
      tags: ["tag1", "tag2", "tag3"],
    } as Feature & { tags: string[] }
    const result = serializeFeature(feature)
    expect(result).toEqual({
      name: {
        en_US: "Test Feature",
      },
      description: {
        en_US: "Test Description",
      },
      tags: ["tag1", "tag2", "tag3"],
    })
  })

  test("should handle null and undefined values", () => {
    const feature = {
      name: {
        en_US: "Test Feature",
      },
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
})
