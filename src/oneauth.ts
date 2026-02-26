import { z } from "zod"
import { readConfig } from "./config"

const SessionSchema = z.object({
  id: z.string(),
  expiresAt: z.string(),
  token: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  ipAddress: z.string().nullish(),
  userAgent: z.string().nullish(),
  userId: z.string(),
  impersonatedBy: z.string().nullish(),
  activeOrganizationId: z.string().nullish(),
  activeTeamId: z.string().nullish(),
})

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean().optional(),
  image: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string(),
  role: z.string(),
  banned: z.boolean().optional(),
  banReason: z.string().nullish(),
  banExpires: z.string().nullish(),
  lastLoginMethod: z.string().optional(),
  inherentOrganizationId: z.string(),
  inherentTeamId: z.string(),
  referralCode: z.string(),
  referredBy: z.string().nullish(),
  metadata: z.record(z.string(), z.any()),
  stripeCustomerId: z.string().nullish(),
})

const GetSessionResponseSchema = z.object({
  session: SessionSchema,
  user: UserSchema,
})

export type Session = z.infer<typeof SessionSchema>
export type User = z.infer<typeof UserSchema>
export type GetSessionResponse = z.infer<typeof GetSessionResponseSchema>

const DEFAULT_ENDPOINT = "https://oneauth.atomemo.ai"

/**
 * Fetches the current session and user information from the OneAuth API.
 *
 * @returns The session and user information.
 * @throws If the config file is missing, access token is missing, or the API request fails.
 */
export async function getSession(
  deployment: "staging" | "production",
): Promise<GetSessionResponse> {
  const config = readConfig()

  if (!config?.auth?.[deployment]?.access_token) {
    throw new Error(
      "Access token not found. Please ensure ~/.choiceform/atomemo.json contains auth.access_token",
    )
  }

  const endpoint = config.auth?.[deployment]?.endpoint || DEFAULT_ENDPOINT
  const url = new URL("/v1/auth/get-session", endpoint).toString()

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.auth?.[deployment]?.access_token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(
      `OneAuth API request failed: ${response.status} ${response.statusText}. ${errorText}`,
    )
  }

  const data = await response.json()
  return GetSessionResponseSchema.parse(data)
}
