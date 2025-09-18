-- Create comprehensive transaction and financial data schema
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  parent_id UUID REFERENCES categories(id),
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'investment', 'cash')),
  balance DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  category_id UUID REFERENCES categories(id),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  notes TEXT,
  transaction_date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  tags TEXT[],
  location TEXT,
  receipt_url TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_rule JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_transaction_id UUID NOT NULL REFERENCES transactions(id),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  interval_count INTEGER DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE,
  next_occurrence DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  amount DECIMAL(12,2) NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, icon, color, type, is_system) VALUES
-- Income categories
('Salary', '💼', '#10b981', 'income', true),
('Freelance', '💻', '#06b6d4', 'income', true),
('Investment', '📈', '#8b5cf6', 'income', true),
('Other Income', '💰', '#f59e0b', 'income', true),

-- Expense categories
('Food & Dining', '🍽️', '#ef4444', 'expense', true),
('Transportation', '🚗', '#3b82f6', 'expense', true),
('Shopping', '🛍️', '#ec4899', 'expense', true),
('Entertainment', '🎬', '#f97316', 'expense', true),
('Bills & Utilities', '⚡', '#6366f1', 'expense', true),
('Healthcare', '🏥', '#14b8a6', 'expense', true),
('Education', '📚', '#8b5cf6', 'expense', true),
('Travel', '✈️', '#06b6d4', 'expense', true),
('Home & Garden', '🏠', '#84cc16', 'expense', true),
('Personal Care', '💅', '#f59e0b', 'expense', true),
('Insurance', '🛡️', '#64748b', 'expense', true),
('Taxes', '📋', '#dc2626', 'expense', true),
('Other Expenses', '📦', '#6b7280', 'expense', true);

-- Insert default accounts
INSERT INTO accounts (name, type, balance) VALUES
('Primary Checking', 'checking', 0),
('Savings Account', 'savings', 0),
('Credit Card', 'credit', 0),
('Cash', 'cash', 0);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_recurring_next_occurrence ON recurring_transactions(next_occurrence);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(start_date, end_date);
