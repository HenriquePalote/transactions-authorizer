import { z } from 'zod';

export const TransactionRequest = z.object({
  id: z.string(),
  account: z.string(),
  amount: z.number(),
  merchant: z.string(),
  mcc: z
    .string()
    .length(4)
    .regex(/^[0-9]*$/),
});

export type TransactionRequest = z.infer<typeof TransactionRequest>;
