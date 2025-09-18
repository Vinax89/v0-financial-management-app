import { pgTable, text, uuid, timestamp, char, boolean, numeric } from 'drizzle-orm/pg-core'

// Minimal subset to express existing Plaid tables for migration control
export const plaidItems = pgTable('plaid_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  itemId: text('item_id').notNull().unique(),
  accessToken: text('access_token').notNull(),
  institutionId: text('institution_id'),
  institutionName: text('institution_name'),
  status: text('status').notNull().default('active'),
  availableProducts: text('available_products').array(),
  billedProducts: text('billed_products').array(),
  consentExpirationTime: timestamp('consent_expiration_time', { withTimezone: true }),
  updateType: text('update_type'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const plaidAccounts = pgTable('plaid_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  plaidItemId: uuid('plaid_item_id').notNull(),
  accountId: text('account_id').notNull(),
  name: text('name').notNull(),
  officialName: text('official_name'),
  type: text('type').notNull(),
  subtype: text('subtype'),
  mask: text('mask'),
  verificationStatus: text('verification_status'),
  availableBalance: numeric('available_balance', { precision: 12, scale: 2 }),
  currentBalance: numeric('current_balance', { precision: 12, scale: 2 }),
  limitAmount: numeric('limit_amount', { precision: 12, scale: 2 }),
  isoCurrencyCode: char('iso_currency_code', { length: 3 }).default('USD'),
  unofficialCurrencyCode: text('unofficial_currency_code'),
  lastBalanceUpdate: timestamp('last_balance_update', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const plaidTransactions = pgTable('plaid_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  plaidItemId: uuid('plaid_item_id').notNull(),
  accountId: text('account_id').notNull(),
  transactionId: text('transaction_id').notNull().unique(),
  pending: boolean('pending').default(false),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  isoCurrencyCode: char('iso_currency_code', { length: 3 }).default('USD'),
  date: timestamp('date').notNull(),
  authorizedDate: timestamp('authorized_date'),
  name: text('name'),
  merchantName: text('merchant_name'),
  category: text('category').array(),
  personalFinanceCategoryPrimary: text('personal_finance_category_primary'),
  personalFinanceCategoryDetailed: text('personal_finance_category_detailed'),
  paymentChannel: text('payment_channel'),
  checkNumber: text('check_number'),
  logoUrl: text('logo_url'),
  website: text('website'),
  authorizedDatetime: timestamp('authorized_datetime', { withTimezone: true }),
  datetime: timestamp('datetime', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const budgetCategories = pgTable('budget_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  color: text('color'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const budgets = pgTable('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  categoryId: uuid('category_id').notNull(),
  month: text('month').notNull(), // YYYY-MM
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const categoryRules = pgTable('category_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  pattern: text('pattern').notNull(), // applied to transaction name/merchant
  categoryId: uuid('category_id').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
