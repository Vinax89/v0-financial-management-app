import { z } from 'zod'

export const ExchangePublicTokenSchema = z.object({
  publicToken: z.string().min(1, 'publicToken required'),
})
