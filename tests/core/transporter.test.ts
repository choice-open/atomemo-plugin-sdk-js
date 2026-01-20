import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test"
import type { Channel, Push, Socket } from "phoenix"

// We'll dynamically import createTransporter after mocking phoenix
let createTransporter: typeof import("../../src/transporter").createTransporter

// Store receive callbacks for testing
let joinReceiveCallbacks: Record<string, (response?: unknown) => void> = {}
let leaveReceiveCallbacks: Record<string, () => void> = {}

// Mock phoenix module
const mockChannelJoin = mock(() => {
  const push = {
    receive: mock((status: string, callback: (response?: unknown) => void) => {
      joinReceiveCallbacks[status] = callback
      // Auto-trigger 'ok' callback after a short delay to resolve the promise
      if (status === "ok") {
        setTimeout(() => {
          if (joinReceiveCallbacks.ok) {
            joinReceiveCallbacks.ok({ messages: [] })
          }
        }, 1)
      }
      return push
    }),
  } as unknown as Push
  return push
})

const mockChannelLeave = mock(() => {
  const push = {
    receive: mock((status: string, callback: () => void) => {
      leaveReceiveCallbacks[status] = callback
      return push
    }),
  } as unknown as Push
  return push
})

const mockChannelOn = mock(() => 1)
const mockChannelOff = mock(() => {})
const mockChannelPush = mock(() => {
  return {
    receive: mock(() => ({})),
  } as unknown as Push
})

const mockChannel = {
  join: mockChannelJoin,
  leave: mockChannelLeave,
  on: mockChannelOn,
  off: mockChannelOff,
  push: mockChannelPush,
  params: {},
} as unknown as Channel

const mockSocketChannel = mock(() => mockChannel)
const mockSocketConnect = mock(() => {})
const mockSocketDisconnect = mock(() => {})
const mockSocketLog = mock(() => {})

// Store handlers to test them
let storedOnOpenHandler: (() => void) | undefined
let storedOnCloseHandler: ((event: unknown) => void) | undefined
let storedOnErrorHandler:
  | ((error: unknown, transport?: unknown, establishedConnections?: unknown) => void)
  | undefined
let storedOnMessageHandler: ((message: unknown) => void) | undefined

const mockSocketOnOpen = mock((handler: () => void) => {
  storedOnOpenHandler = handler
})
const mockSocketOnClose = mock((handler: (event: unknown) => void) => {
  storedOnCloseHandler = handler
})
const mockSocketOnError = mock(
  (handler: (error: unknown, transport?: unknown, establishedConnections?: unknown) => void) => {
    storedOnErrorHandler = handler
  },
)
const mockSocketOnMessage = mock((handler: (message: unknown) => void) => {
  storedOnMessageHandler = handler
})

const MockSocket = mock((_url: string, _options?: unknown) => {
  return {
    channel: mockSocketChannel,
    connect: mockSocketConnect,
    disconnect: mockSocketDisconnect,
    onOpen: mockSocketOnOpen,
    onClose: mockSocketOnClose,
    onError: mockSocketOnError,
    onMessage: mockSocketOnMessage,
    log: mockSocketLog,
  } as unknown as Socket
}) as unknown as typeof Socket

// Mock phoenix module at top level before any imports
mock.module("phoenix", () => ({
  Socket: MockSocket,
  Channel: class {} as unknown as typeof Channel,
  Push: class {} as unknown as typeof Push,
}))

// Import transporter after mocking - it will use mocked phoenix
const transporterModule = await import("../../src/transporter")
createTransporter = transporterModule.createTransporter

describe("transporter", () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // Reset environment
    Object.assign(process.env, originalEnv)
    ;(process.env as Record<string, string>).HUB_SERVER_WS_URL = "ws://localhost:4000/socket"
    ;(process.env as Record<string, string>).DEBUG_API_KEY = "test-api-key"
    ;(process.env as Record<string, string>).DEBUG = "false"

    // Reset receive callbacks
    joinReceiveCallbacks = {}
    leaveReceiveCallbacks = {}

    // Reset stored handlers
    storedOnOpenHandler = undefined
    storedOnCloseHandler = undefined
    storedOnErrorHandler = undefined
    storedOnMessageHandler = undefined

    // Reset mocks
    mockChannelJoin.mockClear()
    mockChannelLeave.mockClear()
    mockSocketChannel.mockClear()
    mockSocketConnect.mockClear()
    mockSocketDisconnect.mockClear()
    mockSocketOnOpen.mockClear()
    mockSocketOnClose.mockClear()
    mockSocketOnError.mockClear()
    mockSocketOnMessage.mockClear()
    mockSocketLog.mockClear()
  })

  describe("createTransporter", () => {
    test("should create socket with correct URL and options", () => {
      createTransporter()
      expect(MockSocket).toHaveBeenCalledWith(
        "ws://localhost:4000/socket",
        expect.objectContaining({
          debug: false,
          heartbeatIntervalMs: 30 * 1000,
          logger: expect.any(Function),
        }),
      )
    })

    test("should use custom heartbeatIntervalMs when provided", () => {
      createTransporter({ heartbeatIntervalMs: 60 * 1000 })
      expect(MockSocket).toHaveBeenCalledWith(
        "ws://localhost:4000/socket",
        expect.objectContaining({
          heartbeatIntervalMs: 60 * 1000,
        }),
      )
    })

    test("should call socket.connect() immediately", () => {
      createTransporter()
      expect(mockSocketConnect).toHaveBeenCalledTimes(1)
    })

    test("should register onOpen handler when provided", () => {
      const onOpen = mock(() => {})
      createTransporter({ onOpen })
      expect(mockSocketOnOpen).toHaveBeenCalledTimes(1)

      // Call the registered handler
      if (storedOnOpenHandler) {
        storedOnOpenHandler()
        expect(onOpen).toHaveBeenCalledTimes(1)
      }
    })

    test("should register onClose handler when provided", () => {
      const onClose = mock(() => {})
      const closeEvent = { code: 1000, reason: "test" }
      createTransporter({ onClose })
      expect(mockSocketOnClose).toHaveBeenCalledTimes(1)

      // Call the registered handler
      if (storedOnCloseHandler) {
        storedOnCloseHandler(closeEvent)
        expect(onClose).toHaveBeenCalledWith(closeEvent)
      }
    })

    test("should register onError handler when provided", () => {
      const onError = mock(() => {})
      const error = new Error("test error")
      createTransporter({ onError })
      expect(mockSocketOnError).toHaveBeenCalledTimes(1)

      // Call the registered handler
      if (storedOnErrorHandler) {
        storedOnErrorHandler(error, "websocket", 1)
        expect(onError).toHaveBeenCalledWith(error, "websocket", 1)
      }
    })

    test("should register onMessage handler when provided", () => {
      const onMessage = mock(() => {})
      const message = { topic: "test", event: "test", payload: {} }
      createTransporter({ onMessage })
      expect(mockSocketOnMessage).toHaveBeenCalledTimes(1)

      // Call the registered handler
      if (storedOnMessageHandler) {
        storedOnMessageHandler(message)
        expect(onMessage).toHaveBeenCalledWith(message)
      }
    })

    test("should work without optional handlers", () => {
      expect(() => createTransporter()).not.toThrow()
      expect(mockSocketOnOpen).toHaveBeenCalledTimes(1)
      expect(mockSocketOnClose).toHaveBeenCalledTimes(1)
      expect(mockSocketOnError).toHaveBeenCalledTimes(1)
      expect(mockSocketOnMessage).toHaveBeenCalledTimes(1)
    })
  })

  describe("connect", () => {
    test("should create channel with correct topic and params", async () => {
      const transporter = createTransporter()
      await transporter.connect("mirror:lobby")
      expect(mockSocketChannel).toHaveBeenCalledWith("mirror:lobby", {})
    })

    test("should join the channel", async () => {
      const transporter = createTransporter()
      await transporter.connect("mirror:lobby")
      expect(mockChannelJoin).toHaveBeenCalledTimes(1)
    })

    test("should log success when channel join receives ok", async () => {
      const transporter = createTransporter()
      await transporter.connect("mirror:lobby")

      // Simulate ok response
      if (joinReceiveCallbacks.ok) {
        joinReceiveCallbacks.ok({ messages: [] })
      }

      expect(mockSocketLog).toHaveBeenCalledWith(
        "channel:joined",
        "Joined mirror:lobby successfully",
        { messages: [] },
      )
    })

    test("should log error when channel join receives error", async () => {
      const transporter = createTransporter()
      await transporter.connect("mirror:lobby")

      // Simulate error response
      const errorResponse = { reason: "unauthorized" }
      if (joinReceiveCallbacks.error) {
        joinReceiveCallbacks.error(errorResponse)
      }

      expect(mockSocketLog).toHaveBeenCalledWith(
        "channel:error",
        "Failed to join mirror:lobby",
        errorResponse,
      )
    })

    test("should log timeout when channel join receives timeout", async () => {
      const transporter = createTransporter()
      await transporter.connect("mirror:lobby")

      // Simulate timeout response
      if (joinReceiveCallbacks.timeout) {
        joinReceiveCallbacks.timeout()
      }

      expect(mockSocketLog).toHaveBeenCalledWith(
        "channel:timeout",
        "Timeout while joining mirror:lobby",
        undefined,
      )
    })

    test("should return channel and dispose function", async () => {
      const transporter = createTransporter()
      const result = await transporter.connect("mirror:lobby")

      expect(result).toHaveProperty("channel")
      expect(result).toHaveProperty("dispose")
      expect(result.channel).toBe(mockChannel)
      expect(typeof result.dispose).toBe("function")
    })
  })

  describe("dispose", () => {
    test("should leave channel when dispose is called", async () => {
      const transporter = createTransporter()
      const { dispose } = await transporter.connect("mirror:lobby")

      dispose()
      expect(mockChannelLeave).toHaveBeenCalledTimes(1)
    })

    test("should disconnect socket when dispose is called", async () => {
      const transporter = createTransporter()
      const { dispose } = await transporter.connect("mirror:lobby")

      const exitSpy = spyOn(process, "exit")
      exitSpy.mockImplementation(() => {
        throw new Error("process.exit called")
      })

      try {
        dispose()
      } catch {
        // Expected to throw due to process.exit mock
      }

      expect(mockSocketDisconnect).toHaveBeenCalledTimes(1)
      expect(exitSpy).toHaveBeenCalledWith(0)
      exitSpy.mockRestore()
    })

    test("should call process.exit(0) when dispose is called", async () => {
      const transporter = createTransporter()
      const { dispose } = await transporter.connect("mirror:lobby")

      const exitSpy = spyOn(process, "exit")
      exitSpy.mockImplementation(() => {
        throw new Error("process.exit called")
      })

      expect(() => dispose()).toThrow("process.exit called")
      expect(exitSpy).toHaveBeenCalledWith(0)
      exitSpy.mockRestore()
    })
  })

  describe("integration", () => {
    test("should handle complete workflow", async () => {
      const onOpen = mock(() => {})
      const onClose = mock(() => {})
      const transporter = createTransporter({ onOpen, onClose })

      const { channel, dispose } = await transporter.connect("mirror:lobby")

      expect(channel).toBeDefined()
      expect(mockSocketChannel).toHaveBeenCalledWith("mirror:lobby", {})
      expect(mockChannelJoin).toHaveBeenCalledTimes(1)

      const exitSpy = spyOn(process, "exit")
      exitSpy.mockImplementation(() => {
        throw new Error("process.exit called")
      })

      try {
        dispose()
      } catch {
        // Expected
      }

      expect(mockChannelLeave).toHaveBeenCalledTimes(1)
      expect(mockSocketDisconnect).toHaveBeenCalledTimes(1)
      exitSpy.mockRestore()
    })
  })
})
