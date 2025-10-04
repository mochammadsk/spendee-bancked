const { z } = require('zod');

const NameEnum = z.enum(['Cash', 'BRI', 'BLU', 'SeaBank', 'ShopeePay']);

const store = z.object({
  name: NameEnum,
  opening_balance: z.coerce.number().int().nonnegative().default(0),
  current_balance: z.coerce.number().int().nonnegative().optional(),
});

const update = z.object({
  name: NameEnum.optional(),
  opening_balance: z.coerce.number().int().nonnegative().optional(),
  current_balance: z.coerce.number().int().nonnegative().optional(),
});

const listQuery = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(10).optional(),
});

module.exports = { store, update, listQuery };
