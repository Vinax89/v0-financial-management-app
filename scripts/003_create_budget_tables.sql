-- Create budget-related tables for comprehensive budget management

-- Budget categories table
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('need', 'want', 'save')),
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'DollarSign',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets table (main budget periods)
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pay_period TEXT NOT NULL CHECK (pay_period IN ('weekly', 'biweekly', 'semimonthly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_income DECIMAL(12,2) DEFAULT 0,
  total_allocated DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget allocations (category amounts per budget period)
CREATE TABLE IF NOT EXISTS budget_allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id) ON DELETE CASCADE,
  allocated_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  spent_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(budget_id, category_id)
);

-- Budget goals table
CREATE TABLE IF NOT EXISTS budget_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  target_date DATE,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table for budget tracking
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
  budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  payment_method TEXT DEFAULT 'cash',
  merchant TEXT,
  notes TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_budget_categories_user_id ON budget_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_active ON budgets(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_budget_allocations_budget_id ON budget_allocations(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_goals_user_id ON budget_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

-- Enable Row Level Security
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own budget categories" ON budget_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget categories" ON budget_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget categories" ON budget_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget categories" ON budget_categories
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own budget allocations" ON budget_allocations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM budgets 
      WHERE budgets.id = budget_allocations.budget_id 
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own budget allocations" ON budget_allocations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets 
      WHERE budgets.id = budget_allocations.budget_id 
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own budget allocations" ON budget_allocations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM budgets 
      WHERE budgets.id = budget_allocations.budget_id 
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own budget allocations" ON budget_allocations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM budgets 
      WHERE budgets.id = budget_allocations.budget_id 
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own budget goals" ON budget_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget goals" ON budget_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget goals" ON budget_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget goals" ON budget_goals
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
