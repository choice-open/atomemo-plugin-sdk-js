import { beforeEach, describe, expect, mock, test } from "bun:test"
import { __resetEnvForTesting, EnvSchema, getEnv } from "../src/env"

describe("env module", () => {
  const originalEnv = { ...process.env }
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv }
    process.env.NODE_ENV = originalNodeEnv
    __resetEnvForTesting()
  })

  describe("EnvSchema validation", () => {
    test("should accept valid ws:// URL", () => {
      const result = EnvSchema.safeParse({
        HUB_WS_URL: "ws://localhost:4000/socket",
        HUB_DEBUG_API_KEY: "test-api-key",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.HUB_WS_URL).toBe("ws://localhost:4000/socket")
      }
    })

    test("should accept valid wss:// URL", () => {
      const result = EnvSchema.safeParse({
        HUB_WS_URL: "wss://example.com/socket",
        HUB_DEBUG_API_KEY: "test-api-key",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.HUB_WS_URL).toBe("wss://example.com/socket")
      }
    })

    test("should reject non-WebSocket URL", () => {
      const result = EnvSchema.safeParse({
        HUB_WS_URL: "https://example.com",
        HUB_DEBUG_API_KEY: "test-api-key",
      })
      expect(result.success).toBe(false)
    })

    test("should reject invalid URL", () => {
      const result = EnvSchema.safeParse({
        HUB_WS_URL: "not-a-url",
        HUB_DEBUG_API_KEY: "test-api-key",
      })
      expect(result.success).toBe(false)
    })

    test("should reject missing HUB_SERVER_WS_URL", () => {
      const result = EnvSchema.safeParse({
        HUB_DEBUG_API_KEY: "test-api-key",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("DEBUG field validation", () => {
    test("should return true when DEBUG is not set and NODE_ENV is not production", () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = "development"
      try {
        const result = EnvSchema.safeParse({
          HUB_WS_URL: "ws://localhost:4000/socket",
          HUB_DEBUG_API_KEY: "test-api-key",
        })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.DEBUG).toBe(true)
        }
      } finally {
        process.env.NODE_ENV = originalNodeEnv
      }
    })

    test("should return false when DEBUG is not set and NODE_ENV is production", () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = "production"
      try {
        const result = EnvSchema.safeParse({
          HUB_WS_URL: "ws://localhost:4000/socket",
          HUB_DEBUG_API_KEY: "test-api-key",
        })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.DEBUG).toBe(false)
        }
      } finally {
        process.env.NODE_ENV = originalNodeEnv
      }
    })

    test("should return true when DEBUG is 'true'", () => {
      const result = EnvSchema.safeParse({
        HUB_WS_URL: "ws://localhost:4000/socket",
        HUB_DEBUG_API_KEY: "test-api-key",
        DEBUG: "true",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.DEBUG).toBe(true)
      }
    })

    test("should return true when DEBUG is 'True' (case-insensitive)", () => {
      const result = EnvSchema.safeParse({
        HUB_WS_URL: "ws://localhost:4000/socket",
        HUB_DEBUG_API_KEY: "test-api-key",
        DEBUG: "True",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.DEBUG).toBe(true)
      }
    })

    test("should return true when DEBUG is 'TRUE' (case-insensitive)", () => {
      const result = EnvSchema.safeParse({
        HUB_WS_URL: "ws://localhost:4000/socket",
        HUB_DEBUG_API_KEY: "test-api-key",
        DEBUG: "TRUE",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.DEBUG).toBe(true)
      }
    })

    test("should return false when DEBUG is 'false'", () => {
      const result = EnvSchema.safeParse({
        HUB_WS_URL: "ws://localhost:4000/socket",
        HUB_DEBUG_API_KEY: "test-api-key",
        DEBUG: "false",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.DEBUG).toBe(false)
      }
    })

    test("should return false when DEBUG is any other value", () => {
      const result = EnvSchema.safeParse({
        HUB_WS_URL: "ws://localhost:4000/socket",
        HUB_DEBUG_API_KEY: "test-api-key",
        DEBUG: "anything else",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.DEBUG).toBe(false)
      }
    })
  })

  describe("getEnv function", () => {
    test("should return parsed env when HUB_WS_URL is valid ws:// URL", () => {
      ;(process.env as Record<string, string | undefined>).HUB_WS_URL = "ws://localhost:4000/socket"
      ;(process.env as Record<string, string | undefined>).HUB_DEBUG_API_KEY = "test-api-key"

      const env = getEnv()

      expect(env).toBeDefined()
      expect(env.HUB_WS_URL).toBe("ws://localhost:4000/socket")
      expect(typeof env.DEBUG).toBe("boolean")
    })

    test("should return parsed env when HUB_WS_URL is valid wss:// URL", () => {
      ;(process.env as Record<string, string | undefined>).HUB_WS_URL = "wss://example.com/socket"
      ;(process.env as Record<string, string | undefined>).HUB_DEBUG_API_KEY = "test-api-key"

      const env = getEnv()

      expect(env).toBeDefined()
      expect(env.HUB_WS_URL).toBe("wss://example.com/socket")
    })

    test("should cache parsed env on subsequent calls", () => {
      ;(process.env as Record<string, string | undefined>).HUB_WS_URL = "ws://localhost:4000/socket"
      ;(process.env as Record<string, string | undefined>).HUB_DEBUG_API_KEY = "test-api-key"

      const env1 = getEnv()
      const env2 = getEnv()

      expect(env1).toBe(env2)
      expect(env1.HUB_WS_URL).toBe("ws://localhost:4000/socket")
    })

    test("should exit process when HUB_SERVER_WS_URL is missing", () => {
      delete (process.env as Record<string, string | undefined>).HUB_WS_URL

      const exitMock = mock((code?: number) => {
        throw new Error(`process.exit(${code})`)
      })
      const consoleErrorMock = mock(() => {})
      const originalExit = process.exit
      const originalConsoleError = console.error

      process.exit = exitMock as unknown as typeof process.exit
      console.error = consoleErrorMock

      try {
        expect(() => {
          getEnv()
        }).toThrow()
      } finally {
        process.exit = originalExit
        console.error = originalConsoleError
      }

      expect(exitMock).toHaveBeenCalledWith(1)
      expect(consoleErrorMock).toHaveBeenCalled()
    })

    test("should exit process when HUB_SERVER_WS_URL is invalid", () => {
      ;(process.env as Record<string, string | undefined>).HUB_WS_URL = "https://example.com"
      ;(process.env as Record<string, string | undefined>).HUB_DEBUG_API_KEY = "test-api-key"

      const exitMock = mock((code?: number) => {
        throw new Error(`process.exit(${code})`)
      })
      const consoleErrorMock = mock(() => {})
      const originalExit = process.exit
      const originalConsoleError = console.error

      process.exit = exitMock as unknown as typeof process.exit
      console.error = consoleErrorMock

      try {
        expect(() => {
          getEnv()
        }).toThrow()
      } finally {
        process.exit = originalExit
        console.error = originalConsoleError
      }

      expect(exitMock).toHaveBeenCalledWith(1)
      expect(consoleErrorMock).toHaveBeenCalled()
    })

    describe("DEBUG field in getEnv", () => {
      test("should return true when DEBUG is not set and NODE_ENV is development", () => {
        const originalNodeEnv = process.env.NODE_ENV
        ;(process.env as Record<string, string | undefined>).HUB_WS_URL =
          "ws://localhost:4000/socket"
        ;(process.env as Record<string, string | undefined>).HUB_DEBUG_API_KEY = "test-api-key"
        delete (process.env as Record<string, string | undefined>).DEBUG
        process.env.NODE_ENV = "development"

        try {
          const env = getEnv()
          expect(env.DEBUG).toBe(true)
        } finally {
          process.env.NODE_ENV = originalNodeEnv
        }
      })

      test("should return false when DEBUG is not set and NODE_ENV is production", () => {
        const originalNodeEnv = process.env.NODE_ENV
        ;(process.env as Record<string, string | undefined>).HUB_WS_URL =
          "ws://localhost:4000/socket"
        ;(process.env as Record<string, string | undefined>).HUB_DEBUG_API_KEY = "test-api-key"
        delete (process.env as Record<string, string | undefined>).DEBUG
        process.env.NODE_ENV = "production"

        try {
          const env = getEnv()
          expect(env.DEBUG).toBe(false)
        } finally {
          process.env.NODE_ENV = originalNodeEnv
        }
      })

      test("should return true when DEBUG is 'true'", () => {
        ;(process.env as Record<string, string | undefined>).HUB_WS_URL =
          "ws://localhost:4000/socket"
        ;(process.env as Record<string, string | undefined>).HUB_DEBUG_API_KEY = "test-api-key"
        ;(process.env as Record<string, string | undefined>).DEBUG = "true"

        const env = getEnv()
        expect(env.DEBUG).toBe(true)
      })

      test("should return true when DEBUG is 'True' (case-insensitive)", () => {
        ;(process.env as Record<string, string | undefined>).HUB_WS_URL =
          "ws://localhost:4000/socket"
        ;(process.env as Record<string, string | undefined>).HUB_DEBUG_API_KEY = "test-api-key"
        ;(process.env as Record<string, string | undefined>).DEBUG = "True"

        const env = getEnv()
        expect(env.DEBUG).toBe(true)
      })

      test("should return false when DEBUG is 'false'", () => {
        ;(process.env as Record<string, string | undefined>).HUB_WS_URL =
          "ws://localhost:4000/socket"
        ;(process.env as Record<string, string | undefined>).HUB_DEBUG_API_KEY = "test-api-key"
        ;(process.env as Record<string, string | undefined>).DEBUG = "false"

        const env = getEnv()
        expect(env.DEBUG).toBe(false)
      })

      test("should return false when DEBUG is any other value", () => {
        ;(process.env as Record<string, string | undefined>).HUB_WS_URL =
          "ws://localhost:4000/socket"
        ;(process.env as Record<string, string | undefined>).HUB_DEBUG_API_KEY = "test-api-key"
        ;(process.env as Record<string, string | undefined>).DEBUG = "anything"

        const env = getEnv()
        expect(env.DEBUG).toBe(false)
      })
    })
  })
})
