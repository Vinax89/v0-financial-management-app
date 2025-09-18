-- Advanced database optimization for financial management app

-- Create materialized views for common queries
CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_transaction_summary AS
SELECT 
  DATE_TRUNC('month', transaction_date) as month,
  account_id,
  category_id,
  type,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount,
  MIN(amount) as min_amount,
  MAX(amount) as max_amount
FROM transactions
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', transaction_date), account_id, category_id, type;

CREATE MATERIALIZED VIEW IF NOT EXISTS account_balances AS
SELECT 
  a.id,
  a.name,
  a.type,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) as calculated_balance,
  COUNT(t.id) as transaction_count,
  MAX(t.transaction_date) as last_transaction_date
FROM accounts a
LEFT JOIN transactions t ON a.id = t.account_id AND t.status = 'completed'
GROUP BY a.id, a.name, a.type;

CREATE MATERIALIZED VIEW IF NOT EXISTS budget_performance AS
SELECT 
  b.id,
  b.name,
  b.amount as budget_amount,
  b.period,
  b.category_id,
  COALESCE(SUM(t.amount), 0) as spent_amount,
  (COALESCE(SUM(t.amount), 0) / NULLIF(b.amount, 0)) * 100 as utilization_percentage,
  COUNT(t.id) as transaction_count
FROM budgets b
LEFT JOIN transactions t ON b.category_id = t.category_id 
  AND t.transaction_date >= b.start_date 
  AND (b.end_date IS NULL OR t.transaction_date <= b.end_date)
  AND t.status = 'completed'
  AND t.type = 'expense'
WHERE b.is_active = true
GROUP BY b.id, b.name, b.amount, b.period, b.category_id;

-- Create indexes for optimal query performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_composite 
ON transactions(account_id, transaction_date DESC, status) 
WHERE status = 'completed';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_category_date 
ON transactions(category_id, transaction_date DESC) 
WHERE status = 'completed';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_amount_range 
ON transactions(amount) 
WHERE status = 'completed' AND amount > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calendar_events_composite 
ON calendar_events(event_type, start_date, status) 
WHERE status IN ('scheduled', 'overdue');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bill_reminders_due_status 
ON bill_reminders(due_date, is_autopay) 
WHERE due_date >= CURRENT_DATE;

-- Partial indexes for common filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_recent 
ON transactions(transaction_date DESC, amount) 
WHERE transaction_date >= CURRENT_DATE - INTERVAL '90 days' 
AND status = 'completed';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recurring_active 
ON recurring_transactions(next_occurrence, frequency) 
WHERE is_active = true AND next_occurrence <= CURRENT_DATE + INTERVAL '30 days';

-- GIN indexes for array and JSONB columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_tags 
ON transactions USING GIN(tags) 
WHERE tags IS NOT NULL AND array_length(tags, 1) > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calendar_events_metadata 
ON calendar_events USING GIN(metadata) 
WHERE metadata IS NOT NULL;

-- Function-based indexes for common calculations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_month_year 
ON transactions(EXTRACT(YEAR FROM transaction_date), EXTRACT(MONTH FROM transaction_date), type);

-- Create stored procedures for common operations
CREATE OR REPLACE FUNCTION update_account_balance(account_uuid UUID)
RETURNS DECIMAL(12,2) AS $$
DECLARE
  new_balance DECIMAL(12,2);
BEGIN
  SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
  INTO new_balance
  FROM transactions
  WHERE account_id = account_uuid AND status = 'completed';
  
  UPDATE accounts SET balance = new_balance, updated_at = NOW()
  WHERE id = account_uuid;
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_monthly_spending_by_category(
  target_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)
)
RETURNS TABLE(
  category_name TEXT,
  category_icon TEXT,
  total_spent DECIMAL(12,2),
  transaction_count BIGINT,
  avg_transaction DECIMAL(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.name,
    c.icon,
    COALESCE(SUM(t.amount), 0) as total_spent,
    COUNT(t.id) as transaction_count,
    COALESCE(AVG(t.amount), 0) as avg_transaction
  FROM categories c
  LEFT JOIN transactions t ON c.id = t.category_id
    AND DATE_TRUNC('month', t.transaction_date) = target_month
    AND t.status = 'completed'
    AND t.type = 'expense'
  WHERE c.type = 'expense'
  GROUP BY c.id, c.name, c.icon
  ORDER BY total_spent DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_upcoming_bills(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE(
  bill_name TEXT,
  amount DECIMAL(12,2),
  due_date DATE,
  days_until_due INTEGER,
  account_name TEXT,
  category_name TEXT,
  is_autopay BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    br.bill_name,
    br.amount,
    br.due_date,
    (br.due_date - CURRENT_DATE)::INTEGER as days_until_due,
    a.name as account_name,
    c.name as category_name,
    br.is_autopay
  FROM bill_reminders br
  LEFT JOIN accounts a ON br.account_id = a.id
  LEFT JOIN categories c ON br.category_id = c.id
  WHERE br.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day' * days_ahead
  ORDER BY br.due_date ASC, br.amount DESC;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic balance updates
CREATE OR REPLACE FUNCTION trigger_update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_account_balance(NEW.account_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM update_account_balance(OLD.account_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_transaction_balance_update ON transactions;
CREATE TRIGGER trigger_transaction_balance_update
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_account_balance();

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_financial_views()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_transaction_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY account_balances;
  REFRESH MATERIALIZED VIEW CONCURRENTLY budget_performance;
END;
$$ LANGUAGE plpgsql;

-- Create table for caching expensive calculations
CREATE TABLE IF NOT EXISTS calculation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  cache_value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calculation_cache_key ON calculation_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_calculation_cache_expires ON calculation_cache(expires_at);

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM calculation_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create table for query performance monitoring
CREATE TABLE IF NOT EXISTS query_performance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_name TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  rows_affected INTEGER,
  parameters JSONB,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_query_performance_name_time ON query_performance_log(query_name, executed_at DESC);

-- Analyze tables for optimal query planning
ANALYZE transactions;
ANALYZE accounts;
ANALYZE categories;
ANALYZE calendar_events;
ANALYZE bill_reminders;
ANALYZE budgets;
ANALYZE tax_brackets;
ANALYZE payroll_tax_rates;
