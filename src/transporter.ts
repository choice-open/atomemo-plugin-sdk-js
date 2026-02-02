import chalk from "chalk"
import { type Channel, Socket, type SocketConnectOption } from "phoenix"
import { getEnv } from "./env"

export interface TransporterOptions
  extends Partial<Pick<SocketConnectOption, "heartbeatIntervalMs">> {
  onOpen?: Parameters<Socket["onOpen"]>[0]
  onClose?: Parameters<Socket["onClose"]>[0]
  onError?: Parameters<Socket["onError"]>[0]
  onMessage?: Parameters<Socket["onMessage"]>[0]
}

/**
 * Creates a network transporter for communication with the Hub Server.
 *
 * @param options - The options for the transporter.
 * @returns An object with a connect method to establish the connection and a dispose method to close it.
 */
export function createTransporter(options: TransporterOptions = {}) {
  const env = getEnv()

  const url = `${env.HUB_WS_URL}/${env.HUB_MODE}_socket`
  const socket = new Socket(url, {
    debug: env.DEBUG,
    heartbeatIntervalMs: options.heartbeatIntervalMs ?? 30 * 1000,
    logger(kind, message: unknown, data) {
      const timestamp = chalk.bgGrey(` ${new Date().toLocaleString()} `)
      const coloredKind = chalk.underline.bold.yellow(kind.toUpperCase())
      const coloredMessage =
        message instanceof Object && "message" in message
          ? chalk.italic.red(message.message)
          : chalk.italic.dim(message)
      const inspection = data ? Bun.inspect(data, { colors: true }) : ""
      console.debug(`${timestamp} ${coloredKind} ${coloredMessage}`, inspection)
    },
    params: { api_key: env.HUB_DEBUG_API_KEY },
  })

  socket.onOpen(() => {
    options.onOpen?.()
  })

  socket.onClose((event) => {
    options.onClose?.(event)
  })

  socket.onError((error, transport, establishedConnections) => {
    if (error instanceof ErrorEvent && error.message.includes("failed: Expected 101 status code")) {
      console.error("Error: Can't connect to the Plugin Hub server.\n")
      console.error("This is usually because the Debug API Key is missing or has expired.\n")
      console.error("Run `atomemo plugin refresh-key` to get a new key.\n")
      process.exit(1)
    }
    options.onError?.(error, transport, establishedConnections)
  })

  socket.onMessage((message) => {
    options.onMessage?.(message)
  })

  socket.connect()

  return {
    /**
     * Connects to the specified channel and returns a channel object and a dispose function.
     *
     * @returns An object with a channel property and a dispose function.
     */
    connect: (channelName: string) => {
      return new Promise<{ channel: Channel; dispose: () => void }>((resolve, reject) => {
        const channel = socket.channel(channelName, {})

        channel
          .join()
          .receive("ok", (response) => {
            socket.log("channel:joined", `Joined ${channelName} successfully`, response)

            resolve({
              channel,
              dispose: () => {
                channel.leave()
                socket.disconnect()
                process.exit(0)
              },
            })
          })
          .receive("error", (response) => {
            socket.log("channel:error", `Failed to join ${channelName}`, response)

            reject(new Error(`Failed to join ${channelName}: ${response.reason}`))
          })
          .receive("timeout", (response) => {
            socket.log("channel:timeout", `Timeout while joining ${channelName}`, response)
            reject(new Error(`Timeout while joining ${channelName}`))
          })
      })
    },
  }
}
