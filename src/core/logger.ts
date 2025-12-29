import pino from "pino"
import { getEnv } from "../env"

const env = getEnv()

export const logger = pino({
  level: env.DEBUG ? "trace" : "error",
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: ["development", "test"].includes(env.NODE_ENV)
    ? {
        targets: [
          {
            target: "pino-pretty",
            options: {
              colorize: true,
              ignore: "pid,hostname",
              translateTime: "mm/dd/yyyy HH:MM:ss TT",
            },
          },
        ],
      }
    : undefined,
})
