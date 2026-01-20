import { beforeEach, describe, expect, test } from "bun:test"
import { createRegistry } from "../../src/registry"
import type {
  CredentialDefinition,
  ModelDefinition,
  PluginDefinition,
  ToolDefinition,
} from "../../src/types"

describe("registry", () => {
  const mockPlugin: PluginDefinition = {
    name: "test-plugin",
    display_name: { en_US: "Test Plugin" },
    description: { en_US: "A test plugin" },
    icon: "🔌",
    author: "Test Author",
    email: "test@example.com",
    locales: ["en_US"],
  }

  let registry: ReturnType<typeof createRegistry>

  beforeEach(() => {
    registry = createRegistry(mockPlugin)
  })

  describe("register", () => {
    test("should register a credential successfully", () => {
      const credential: CredentialDefinition = {
        name: "test-credential",
        display_name: { en_US: "Test Credential" },
        description: { en_US: "A test credential" },
        icon: "🔑",
        parameters: [],
      }

      expect(() => registry.register("credential", credential)).not.toThrow()
    })

    test("should register a tool successfully", () => {
      const tool: ToolDefinition = {
        name: "test-tool",
        display_name: { en_US: "Test Tool" },
        description: { en_US: "A test tool" },
        icon: "🛠️",
        parameters: [],
        invoke: async () => "result",
      }

      expect(() => registry.register("tool", tool)).not.toThrow()
    })

    test("should register a model successfully", () => {
      const model: ModelDefinition = {
        name: "test-provider/test-model",
        display_name: { en_US: "Test Model" },
        description: { en_US: "A test model" },
        icon: "🤖",
        model_type: "llm",
        input_modalities: ["text"],
        output_modalities: ["text"],
        unsupported_parameters: [],
      }

      expect(() => registry.register("model", model)).not.toThrow()
    })

    test("should overwrite feature with same name", () => {
      const tool1: ToolDefinition = {
        name: "test-tool",
        display_name: { en_US: "Test Tool 1" },
        description: { en_US: "First tool" },
        icon: "🛠️",
        parameters: [],
        invoke: async () => "result1",
      }

      const tool2: ToolDefinition = {
        name: "test-tool",
        display_name: { en_US: "Test Tool 2" },
        description: { en_US: "Second tool" },
        icon: "🛠️",
        parameters: [],
        invoke: async () => "result2",
      }

      registry.register("tool", tool1)
      registry.register("tool", tool2)

      const resolved = registry.resolve("tool", "test-tool")
      expect(resolved).toBe(tool2)
    })
  })

  describe("resolve", () => {
    test("should resolve a registered credential", () => {
      const credential: CredentialDefinition = {
        name: "test-credential",
        display_name: { en_US: "Test Credential" },
        description: { en_US: "A test credential" },
        icon: "🔑",
        parameters: [],
      }

      registry.register("credential", credential)
      const resolved = registry.resolve("credential", "test-credential")
      expect(resolved).toBe(credential)
    })

    test("should resolve a registered tool", () => {
      const tool: ToolDefinition = {
        name: "test-tool",
        display_name: { en_US: "Test Tool" },
        description: { en_US: "A test tool" },
        icon: "🛠️",
        parameters: [],
        invoke: async () => "result",
      }

      registry.register("tool", tool)
      const resolved = registry.resolve("tool", "test-tool")
      expect(resolved).toBe(tool)
    })

    test("should resolve a registered model", () => {
      const model: ModelDefinition = {
        name: "test-provider/test-model",
        display_name: { en_US: "Test Model" },
        description: { en_US: "A test model" },
        icon: "🤖",
        model_type: "llm",
        input_modalities: ["text"],
        output_modalities: ["text"],
        unsupported_parameters: [],
      }

      registry.register("model", model)
      const resolved = registry.resolve("model", "test-provider/test-model")
      expect(resolved).toBe(model)
    })

    test("should throw error when feature is not registered", () => {
      expect(() => registry.resolve("tool", "non-existent-tool")).toThrow(
        'Feature "non-existent-tool" not registered',
      )
    })

    test("should resolve features of different types with same name", () => {
      const credential: CredentialDefinition = {
        name: "shared-name",
        display_name: { en_US: "Credential" },
        description: { en_US: "A credential" },
        icon: "🔑",
        parameters: [],
      }

      const tool: ToolDefinition = {
        name: "shared-name",
        display_name: { en_US: "Tool" },
        description: { en_US: "A tool" },
        icon: "🛠️",
        parameters: [],
        invoke: async () => "result",
      }

      registry.register("credential", credential)
      registry.register("tool", tool)

      expect(registry.resolve("credential", "shared-name")).toBe(credential)
      expect(registry.resolve("tool", "shared-name")).toBe(tool)
    })
  })

  describe("serialize", () => {
    test("should serialize registry with plugin info", () => {
      const serialized = registry.serialize()
      expect(serialized).toHaveProperty("plugin")
      expect(serialized.plugin.name).toBe("test-plugin")
      expect(serialized.plugin.display_name).toEqual({ en_US: "Test Plugin" })
    })

    test("should serialize registered features", () => {
      const credential: CredentialDefinition = {
        name: "test-credential",
        display_name: { en_US: "Test Credential" },
        description: { en_US: "A test credential" },
        icon: "🔑",
        parameters: [],
      }

      const tool: ToolDefinition = {
        name: "test-tool",
        display_name: { en_US: "Test Tool" },
        description: { en_US: "A test tool" },
        icon: "🛠️",
        parameters: [],
        invoke: async () => "result",
      }

      registry.register("credential", credential)
      registry.register("tool", tool)

      const serialized = registry.serialize()
      expect(serialized.plugin).toHaveProperty("credentials")
      expect(serialized.plugin).toHaveProperty("tools")
      expect(serialized.plugin.credentials).toHaveLength(1)
      expect(serialized.plugin.tools).toHaveLength(1)
      expect(serialized.plugin.credentials[0].name).toBe("test-credential")
      expect(serialized.plugin.tools[0].name).toBe("test-tool")
    })

    test("should exclude function properties from serialized features", () => {
      const tool: ToolDefinition = {
        name: "test-tool",
        display_name: { en_US: "Test Tool" },
        description: { en_US: "A test tool" },
        icon: "🛠️",
        parameters: [],
        invoke: async () => "result",
      }

      registry.register("tool", tool)
      const serialized = registry.serialize()
      expect(serialized.plugin.tools[0]).not.toHaveProperty("invoke")
    })

    test("should serialize empty arrays when no features registered", () => {
      const serialized = registry.serialize()
      expect(serialized.plugin.credentials).toEqual([])
      expect(serialized.plugin.models).toEqual([])
      expect(serialized.plugin.tools).toEqual([])
    })

    test("should serialize all feature types", () => {
      const credential: CredentialDefinition = {
        name: "test-credential",
        display_name: { en_US: "Test Credential" },
        description: { en_US: "A test credential" },
        icon: "🔑",
        parameters: [],
      }

      const model: ModelDefinition = {
        name: "test-provider/test-model",
        display_name: { en_US: "Test Model" },
        description: { en_US: "A test model" },
        icon: "🤖",
        model_type: "llm",
        input_modalities: ["text"],
        output_modalities: ["text"],
        unsupported_parameters: [],
      }

      const tool: ToolDefinition = {
        name: "test-tool",
        display_name: { en_US: "Test Tool" },
        description: { en_US: "A test tool" },
        icon: "🛠️",
        parameters: [],
        invoke: async () => "result",
      }

      registry.register("credential", credential)
      registry.register("model", model)
      registry.register("tool", tool)

      const serialized = registry.serialize()
      expect(serialized.plugin.credentials).toHaveLength(1)
      expect(serialized.plugin.models).toHaveLength(1)
      expect(serialized.plugin.tools).toHaveLength(1)
    })
  })

  describe("integration", () => {
    test("should handle complete workflow", () => {
      const credential: CredentialDefinition = {
        name: "api-key",
        display_name: { en_US: "API Key" },
        description: { en_US: "API key credential" },
        icon: "🔑",
        parameters: [],
      }

      const tool1: ToolDefinition = {
        name: "send-email",
        display_name: { en_US: "Send Email" },
        description: { en_US: "Send an email" },
        icon: "📧",
        parameters: [],
        invoke: async () => ({ success: true }),
      }

      const tool2: ToolDefinition = {
        name: "get-weather",
        display_name: { en_US: "Get Weather" },
        description: { en_US: "Get weather information" },
        icon: "☁️",
        parameters: [],
        invoke: async () => ({ temperature: 20 }),
      }

      // Register features
      registry.register("credential", credential)
      registry.register("tool", tool1)
      registry.register("tool", tool2)

      // Resolve features
      expect(registry.resolve("credential", "api-key")).toBe(credential)
      expect(registry.resolve("tool", "send-email")).toBe(tool1)
      expect(registry.resolve("tool", "get-weather")).toBe(tool2)

      // Serialize
      const serialized = registry.serialize()
      expect(serialized.plugin.credentials).toHaveLength(1)
      expect(serialized.plugin.tools).toHaveLength(2)
    })
  })
})
