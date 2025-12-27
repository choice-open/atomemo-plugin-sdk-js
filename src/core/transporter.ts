import chalk from "chalk"
import { Socket, type SocketConnectOption } from "phoenix"
import { getEnv } from "../env"

export interface TransporterOptions
  extends Partial<Pick<SocketConnectOption, "heartbeatIntervalMs">> {
  onOpen?: Parameters<Socket["onOpen"]>[0]
  onClose?: Parameters<Socket["onClose"]>[0]
  onError?: Parameters<Socket["onError"]>[0]
  onMessage?: Parameters<Socket["onMessage"]>[0]
}

/**
 * Creates a network transporter for communication with the Daemon Server.
 *
 * @param options - The options for the transporter.
 * @returns An object with a connect method to establish the connection and a dispose method to close it.
 */
export function createTransporter(options: TransporterOptions = {}) {
  const env = getEnv()

  const socket = new Socket(env.DAEMON_SERVER_WS_URL, {
    debug: env.DEBUG,
    heartbeatIntervalMs: options.heartbeatIntervalMs ?? 30 * 1000,
    logger(kind, message, data) {
      const timestamp = chalk.bgGrey(` ${new Date().toLocaleString()} `)
      const formattedKind = chalk.underline.bold.yellow(kind.toUpperCase())
      const inspection = data ? Bun.inspect(data, { colors: true }) : ""
      console.debug(
        `${timestamp} ${formattedKind} ${chalk.italic.dim(message)}`,
        inspection,
      )
    },
  })

  socket.onOpen(() => {
    options.onOpen?.()
  })

  socket.onClose((event) => {
    options.onClose?.(event)
  })

  socket.onError((error, transport, establishedConnections) => {
    options.onError?.(error, transport, establishedConnections)
  })

  socket.onMessage((message) => {
    options.onMessage?.(message)
  })

  socket.connect()

  return {
    /**
     * Connects to the mirror:lobby channel and returns a channel object and a dispose function.
     *
     * @returns An object with a channel property and a dispose function.
     */
    connect: () => {
      const channel = socket.channel("mirror:lobby", {})

      channel
        .join()
        .receive("ok", (response) => {
          socket.log(
            "channel:joined",
            `Joined mirror:lobby successfully`,
            response,
          )
        })
        .receive("error", (response) => {
          socket.log("channel:error", `Failed to join mirror:lobby`, response)
        })
        .receive("timeout", (response) => {
          socket.log(
            "channel:timeout",
            `Timeout while joining mirror:lobby`,
            response,
          )
        })

      return {
        channel,
        dispose: () => {
          channel.leave()
          socket.disconnect()
          process.exit(0)
        },
      }
    },
  }
}
