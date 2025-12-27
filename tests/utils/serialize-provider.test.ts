import { describe, expect, test } from "bun:test"
import type { Feature } from "../../src/core/provider"
import type { ProviderStore } from "../../src/core/registry"
import { serializeProvider } from "../../src/utils/serialize-provider"

describe("serializeProvider", () => {
  test("should serialize provider with primitive values", () => {
    const provider: ProviderStore = {
      name: {
        en_US: "Test Provider",
      },
      tool: new Map(),
    }
    const result = serializeProvider(provider)
    expect(result).toEqual({
      name: {
        en_US: "Test Provider",
      },
      tool: {},
    })
  })

  test("should serialize provider with features in tool map", () => {
    const feature1 = {
      name: {
        en_US: "Feature 1",
      },
      description: {
        en_US: "Feature 1 Description",
      },
    } as Feature
    const feature2 = {
      name: {
        en_US: "Feature 2",
      },
      description: {
        en_US: "Feature 2 Description",
      },
    } as Feature
    const provider: ProviderStore = {
      name: {
        en_US: "Test Provider",
      },
      tool: new Map([
        ["Feature 1", feature1],
        ["Feature 2", feature2],
      ]),
    }
    const result = serializeProvider(provider)
    expect(result).toEqual({
      name: {
        en_US: "Test Provider",
      },
      tool: {
        "Feature 1": {
          name: {
            en_US: "Feature 1",
          },
          description: {
            en_US: "Feature 1 Description",
          },
        },
        "Feature 2": {
          name: {
            en_US: "Feature 2",
          },
          description: {
            en_US: "Feature 2 Description",
          },
        },
      },
    })
  })

  test("should exclude functions from serialization", () => {
    const provider = {
      name: {
        en_US: "Test Provider",
      },
      tool: new Map(),
      handler: () => {
        return "result"
      },
      config: {
        enabled: true,
      },
    } as ProviderStore & { handler: () => string; config: { enabled: boolean } }
    const result = serializeProvider(provider)
    expect(result).toEqual({
      name: {
        en_US: "Test Provider",
      },
      tool: {},
      config: {
        enabled: true,
      },
    })
    expect(result).not.toHaveProperty("handler")
  })

  test("should exclude functions from features in tool map", () => {
    const feature = {
      name: {
        en_US: "Test Feature",
      },
      description: {
        en_US: "Test Description",
      },
      execute: () => {},
      metadata: {
        author: "Test",
      },
    } as Feature & {
      execute: () => void
      metadata: { author: string }
    }
    const provider: ProviderStore = {
      name: {
        en_US: "Test Provider",
      },
      tool: new Map([["Test Feature", feature]]),
    }
    const result = serializeProvider(provider)
    expect(result).toEqual({
      name: {
        en_US: "Test Provider",
      },
      tool: {
        "Test Feature": {
          name: {
            en_US: "Test Feature",
          },
          description: {
            en_US: "Test Description",
          },
          metadata: {
            author: "Test",
          },
        },
      },
    })
    expect(result.tool["Test Feature"]).not.toHaveProperty("execute")
  })

  test("should handle empty tool map", () => {
    const provider: ProviderStore = {
      name: {
        en_US: "Test Provider",
      },
      tool: new Map(),
    }
    const result = serializeProvider(provider)
    expect(result.tool).toEqual({})
  })

  test("should handle multiple features in tool map", () => {
    const features = [
      {
        name: {
          en_US: "Feature 1",
        },
        description: {
          en_US: "Feature 1 Description",
        },
        tag: "tag1",
      },
      {
        name: {
          en_US: "Feature 2",
        },
        description: {
          en_US: "Feature 2 Description",
        },
        tag: "tag2",
      },
      {
        name: {
          en_US: "Feature 3",
        },
        description: {
          en_US: "Feature 3 Description",
        },
        tag: "tag3",
      },
    ] as Array<Feature & { tag: string }>
    const provider: ProviderStore = {
      name: {
        en_US: "Test Provider",
      },
      tool: new Map(features.map((f) => [f.name.en_US, f])),
    }
    const result = serializeProvider(provider)
    expect(Object.keys(result.tool)).toHaveLength(3)
    expect(result.tool).toEqual({
      "Feature 1": {
        name: {
          en_US: "Feature 1",
        },
        description: {
          en_US: "Feature 1 Description",
        },
        tag: "tag1",
      },
      "Feature 2": {
        name: {
          en_US: "Feature 2",
        },
        description: {
          en_US: "Feature 2 Description",
        },
        tag: "tag2",
      },
      "Feature 3": {
        name: {
          en_US: "Feature 3",
        },
        description: {
          en_US: "Feature 3 Description",
        },
        tag: "tag3",
      },
    })
  })

  test("should preserve nested objects in provider", () => {
    const provider = {
      name: {
        en_US: "Test Provider",
      },
      tool: new Map(),
      metadata: {
        nested: {
          deep: {
            value: "test",
          },
        },
      },
    } as ProviderStore & {
      metadata: { nested: { deep: { value: string } } }
    }
    const result = serializeProvider(provider)
    expect(result.metadata).toEqual({
      nested: {
        deep: {
          value: "test",
        },
      },
    })
  })

  test("should handle provider with only functions", () => {
    const provider = {
      name: {
        en_US: "Test Provider",
      },
      tool: new Map(),
      handler: () => {},
      executor: () => {},
    } as ProviderStore & { handler: () => void; executor: () => void }
    const result = serializeProvider(provider)
    expect(result).toEqual({
      name: {
        en_US: "Test Provider",
      },
      tool: {},
    })
  })

  test("should handle features with functions in tool map", () => {
    const feature = {
      name: {
        en_US: "Test Feature",
      },
      description: {
        en_US: "A feature",
      },
      handler: () => {},
      executor: () => {},
    } as Feature & {
      handler: () => void
      executor: () => void
    }
    const provider: ProviderStore = {
      name: {
        en_US: "Test Provider",
      },
      tool: new Map([["Test Feature", feature]]),
    }
    const result = serializeProvider(provider)
    expect(result.tool["Test Feature"]).toEqual({
      name: {
        en_US: "Test Feature",
      },
      description: {
        en_US: "A feature",
      },
    })
    expect(result.tool["Test Feature"]).not.toHaveProperty("handler")
    expect(result.tool["Test Feature"]).not.toHaveProperty("executor")
  })

  test("should handle null and undefined values", () => {
    const provider = {
      name: {
        en_US: "Test Provider",
      },
      tool: new Map(),
      nullable: null,
      optional: undefined,
      value: "test",
    } as ProviderStore & {
      nullable: null
      optional: undefined
      value: string
    }
    const result = serializeProvider(provider)
    expect(result).toHaveProperty("nullable", null)
    expect(result).toHaveProperty("optional", undefined)
    expect(result).toHaveProperty("value", "test")
  })
})
