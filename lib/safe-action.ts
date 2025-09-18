import { createSafeActionClient } from 'next-safe-action'
import { getAuth } from './auth'

export class ActionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ActionError'
  }
}

const handleReturnedServerError = (e: Error) => {
  if (e instanceof ActionError) {
    return e.message
  }

  return 'An unexpected error occurred'
}

export const action = createSafeActionClient({
  handleReturnedServerError: (e) => handleReturnedServerError(e),
})

export const authAction = createSafeActionClient({
  handleReturnedServerError: (e) => handleReturnedServerError(e),
  async middleware() {
    const { userId } = getAuth()

    if (!userId) {
      throw new Error('Session is not valid!')
    }

    return { userId }
  },
})
