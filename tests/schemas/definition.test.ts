import { describe, expect, test } from "bun:test"
import {
  BaseDefinitionSchema,
  CredentialDefinitionSchema,
  DataSourceDefinitionSchema,
  ModelDefinitionSchema,
  PluginDefinitionSchema,
  ToolDefinitionSchema,
} from "../../src/schemas/definition"

const validI18n = { en_US: "Test" }

describe("BaseDefinitionSchema", () => {
  const validBase = {
    name: "valid-name",
    display_name: validI18n,
    description: validI18n,
    icon: "🔧",
    parameters: [],
  }

  describe("name validation - length constraints", () => {
    test("should reject name with less than 5 characters", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "abc" })
      expect(result.success).toBe(false)
    })

    test("should reject name with exactly 4 characters ending in special char", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "abc-" })
      expect(result.success).toBe(false)
    })

    test("should accept name with exactly 5 characters", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "abcde" })
      expect(result.success).toBe(true)
    })

    test("should accept name with 64 characters", () => {
      const name = "a" + "b".repeat(62) + "c"
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name })
      expect(result.success).toBe(true)
    })

    test("should reject name with more than 65 characters", () => {
      const name = "a" + "b".repeat(64) + "c"
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name })
      expect(result.success).toBe(false)
    })
  })

  describe("name validation - start character", () => {
    test("should reject name starting with number", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "1abcde" })
      expect(result.success).toBe(false)
    })

    test("should reject name starting with underscore", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "_abcde" })
      expect(result.success).toBe(false)
    })

    test("should reject name starting with hyphen", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "-abcde" })
      expect(result.success).toBe(false)
    })

    test("should accept name starting with lowercase letter", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "abcdef" })
      expect(result.success).toBe(true)
    })

    test("should accept name starting with uppercase letter", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "Abcdef" })
      expect(result.success).toBe(true)
    })
  })

  describe("name validation - end character", () => {
    test("should reject name ending with underscore", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "abcde_" })
      expect(result.success).toBe(false)
    })

    test("should reject name ending with hyphen", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "abcde-" })
      expect(result.success).toBe(false)
    })

    test("should accept name ending with number", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "abcde1" })
      expect(result.success).toBe(true)
    })

    test("should accept name ending with letter", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "abcdef" })
      expect(result.success).toBe(true)
    })
  })

  describe("name validation - consecutive special characters", () => {
    test("should reject name with consecutive hyphens", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "abc--def" })
      expect(result.success).toBe(false)
    })

    test("should reject name with consecutive underscores", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "abc__def" })
      expect(result.success).toBe(false)
    })

    test("should reject name with mixed consecutive special chars", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "abc-_def" })
      expect(result.success).toBe(false)
    })

    test("should accept name with single hyphen", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "abc-def" })
      expect(result.success).toBe(true)
    })

    test("should accept name with single underscore", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "abc_def" })
      expect(result.success).toBe(true)
    })

    test("should accept name with alternating special chars", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "a-b_c-d" })
      expect(result.success).toBe(true)
    })
  })

  describe("name validation - forbidden characters", () => {
    test("should reject name with space", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "abc def" })
      expect(result.success).toBe(false)
    })

    test("should reject name with special symbols", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "abc@def" })
      expect(result.success).toBe(false)
    })

    test("should reject name with dot", () => {
      const result = BaseDefinitionSchema.safeParse({ ...validBase, name: "abc.def" })
      expect(result.success).toBe(false)
    })
  })
})

describe("PluginDefinitionSchema", () => {
  const validPlugin = {
    name: "test-plugin",
    display_name: validI18n,
    description: validI18n,
    icon: "🔌",
    author: "Test Author",
    email: "test@example.com",
    locales: ["en_US"],
  }

  describe("email validation", () => {
    test("should reject invalid email without @", () => {
      const result = PluginDefinitionSchema.safeParse({ ...validPlugin, email: "invalid" })
      expect(result.success).toBe(false)
    })

    test("should reject invalid email without domain", () => {
      const result = PluginDefinitionSchema.safeParse({ ...validPlugin, email: "test@" })
      expect(result.success).toBe(false)
    })

    test("should reject invalid email without local part", () => {
      const result = PluginDefinitionSchema.safeParse({ ...validPlugin, email: "@example.com" })
      expect(result.success).toBe(false)
    })

    test("should accept valid email", () => {
      const result = PluginDefinitionSchema.safeParse({ ...validPlugin, email: "user@domain.com" })
      expect(result.success).toBe(true)
    })
  })

  describe("repo URL validation", () => {
    test("should reject invalid URL", () => {
      const result = PluginDefinitionSchema.safeParse({ ...validPlugin, repo: "not-a-url" })
      expect(result.success).toBe(false)
    })

    test("should reject non-http URL", () => {
      const result = PluginDefinitionSchema.safeParse({ ...validPlugin, repo: "ftp://example.com" })
      expect(result.success).toBe(false)
    })

    test("should accept http URL", () => {
      const result = PluginDefinitionSchema.safeParse({
        ...validPlugin,
        repo: "http://github.com/org/repo",
      })
      expect(result.success).toBe(true)
    })

    test("should accept https URL", () => {
      const result = PluginDefinitionSchema.safeParse({
        ...validPlugin,
        repo: "https://github.com/org/repo",
      })
      expect(result.success).toBe(true)
    })

    test("should accept undefined repo (optional)", () => {
      const { repo: _, ...pluginWithoutRepo } = validPlugin
      const result = PluginDefinitionSchema.safeParse(pluginWithoutRepo)
      expect(result.success).toBe(true)
    })
  })

  describe("valid plugin definition", () => {
    test("should accept valid plugin with all fields", () => {
      const result = PluginDefinitionSchema.safeParse({
        ...validPlugin,
        repo: "https://github.com/org/repo",
        version: "1.0.0",
      })
      expect(result.success).toBe(true)
    })
  })
})

describe("CredentialDefinitionSchema", () => {
  const validCredential = {
    name: "test-credential",
    display_name: validI18n,
    description: validI18n,
    icon: "🔑",
    parameters: [],
  }

  test("should accept valid credential", () => {
    const result = CredentialDefinitionSchema.safeParse(validCredential)
    expect(result.success).toBe(true)
  })

  test("should reject credential without parameters", () => {
    const { parameters: _, ...withoutParams } = validCredential
    const result = CredentialDefinitionSchema.safeParse(withoutParams)
    expect(result.success).toBe(false)
  })
})

describe("DataSourceDefinitionSchema", () => {
  const validDataSource = {
    name: "test-datasource",
    display_name: validI18n,
    description: validI18n,
    icon: "📊",
    parameters: [],
  }

  test("should accept valid data source", () => {
    const result = DataSourceDefinitionSchema.safeParse(validDataSource)
    expect(result.success).toBe(true)
  })

  test("should accept data source with settings", () => {
    const result = DataSourceDefinitionSchema.safeParse({
      ...validDataSource,
      settings: [],
    })
    expect(result.success).toBe(true)
  })
})

describe("ModelDefinitionSchema", () => {
  const validModel = {
    name: "provider/model-name",
    display_name: validI18n,
    description: validI18n,
    icon: "🤖",
    model_type: "llm" as const,
    input_modalities: ["text" as const],
    output_modalities: ["text" as const],
    unsupported_parameters: [],
  }

  describe("name format validation", () => {
    test("should reject name without slash", () => {
      const result = ModelDefinitionSchema.safeParse({ ...validModel, name: "model-name" })
      expect(result.success).toBe(false)
    })

    // NOTE: The templateLiteral schema with z.string() accepts empty strings,
    // so "/" matches (empty/empty), "/model" matches (empty/model), "provider/" matches (provider/empty)
    // This is current implementation behavior, not necessarily ideal

    test("should accept name with only slash (matches empty/empty)", () => {
      const result = ModelDefinitionSchema.safeParse({ ...validModel, name: "/" })
      expect(result.success).toBe(true)
    })

    test("should accept name without provider (matches empty/model)", () => {
      const result = ModelDefinitionSchema.safeParse({ ...validModel, name: "/model-name" })
      expect(result.success).toBe(true)
    })

    test("should accept name without model name (matches provider/empty)", () => {
      const result = ModelDefinitionSchema.safeParse({ ...validModel, name: "provider/" })
      expect(result.success).toBe(true)
    })

    test("should accept valid provider/model format", () => {
      const result = ModelDefinitionSchema.safeParse({ ...validModel, name: "openai/gpt-4" })
      expect(result.success).toBe(true)
    })

    test("should accept name with multiple slashes", () => {
      const result = ModelDefinitionSchema.safeParse({
        ...validModel,
        name: "provider/category/model",
      })
      expect(result.success).toBe(true)
    })
  })

  describe("modality validation", () => {
    test("should reject invalid input modality", () => {
      const result = ModelDefinitionSchema.safeParse({
        ...validModel,
        input_modalities: ["audio" as unknown],
      })
      expect(result.success).toBe(false)
    })

    test("should reject invalid output modality", () => {
      const result = ModelDefinitionSchema.safeParse({
        ...validModel,
        output_modalities: ["image" as unknown],
      })
      expect(result.success).toBe(false)
    })

    test("should accept all valid input modalities", () => {
      const result = ModelDefinitionSchema.safeParse({
        ...validModel,
        input_modalities: ["file", "image", "text"],
      })
      expect(result.success).toBe(true)
    })

    test("should accept empty modalities array", () => {
      const result = ModelDefinitionSchema.safeParse({
        ...validModel,
        input_modalities: [],
        output_modalities: [],
      })
      expect(result.success).toBe(true)
    })
  })

  describe("valid model definition", () => {
    test("should accept model with all optional fields", () => {
      const result = ModelDefinitionSchema.safeParse({
        ...validModel,
        default_endpoint: "https://api.example.com",
        pricing: {
          currency: "USD",
          input: 0.01,
          output: 0.02,
        },
        override_parameters: {
          temperature: { default: 0.7, minimum: 0, maximum: 2 },
        },
      })
      expect(result.success).toBe(true)
    })
  })
})

describe("ToolDefinitionSchema", () => {
  const validTool = {
    name: "test-tool",
    display_name: validI18n,
    description: validI18n,
    icon: "🛠️",
    parameters: [],
    invoke: async () => "result",
  }

  test("should accept valid tool", () => {
    const result = ToolDefinitionSchema.safeParse(validTool)
    expect(result.success).toBe(true)
  })

  test("should reject tool without invoke function", () => {
    const { invoke: _, ...withoutInvoke } = validTool
    const result = ToolDefinitionSchema.safeParse(withoutInvoke)
    expect(result.success).toBe(false)
  })

  test("should reject tool with non-function invoke", () => {
    const result = ToolDefinitionSchema.safeParse({ ...validTool, invoke: "not-a-function" })
    expect(result.success).toBe(false)
  })

  test("should accept tool with settings", () => {
    const result = ToolDefinitionSchema.safeParse({
      ...validTool,
      settings: [],
    })
    expect(result.success).toBe(true)
  })
})
