import { Redis } from "@upstash/redis"

import { getBackendMode, hasRedisConfig, requireRedisConfig } from "@/lib/env"
import { AppError } from "@/lib/error"

type SlotLock = {
  release: () => Promise<void>
}

declare global {
  var __bowMockLocks: Map<string, string> | undefined
}

function getMockLocks() {
  if (!globalThis.__bowMockLocks) {
    globalThis.__bowMockLocks = new Map()
  }

  return globalThis.__bowMockLocks
}

export async function acquireSlotLock(slotId: string): Promise<SlotLock> {
  const key = `bow:slot:${slotId}`
  const token = crypto.randomUUID()

  if (getBackendMode() === "mock") {
    const locks = getMockLocks()

    if (locks.has(key)) {
      throw new AppError(
        "That interview time was just reserved. Please choose another slot.",
        409
      )
    }

    locks.set(key, token)

    return {
      release: async () => {
        if (locks.get(key) === token) {
          locks.delete(key)
        }
      },
    }
  }

  if (!hasRedisConfig()) {
    throw new AppError(
      "The booking lock service is not configured. Add your Vercel KV credentials before using the live Google backend.",
      500
    )
  }

  const { url, token: authToken } = requireRedisConfig()
  const redis = new Redis({ url, token: authToken })
  const result = await redis.set(key, token, {
    nx: true,
    ex: 120,
  })

  if (result !== "OK") {
    throw new AppError(
      "That interview time was just reserved. Please choose another slot.",
      409
    )
  }

  return {
    release: async () => {
      const current = await redis.get<string>(key)

      if (current === token) {
        await redis.del(key)
      }
    },
  }
}
