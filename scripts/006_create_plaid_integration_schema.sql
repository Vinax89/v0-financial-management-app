-- Plaid Integration Schema
-- Creates tables for managing Plaid connections, accounts, and transactions

-- Plaid Items (Bank connections)
CREATE TABLE IF NOT EXISTS plaid_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uu```sql file="scripts/006_create_plaid_integration_schema.sql"
-- Plaid Integration Schema
-- Creates tables for managing Plaid connections, accounts, and transactions

-- Plaid Items (Bank connections)
CREATE TABLE IF NOT EXISTS plaid_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Reference to your users table
    item_id VARCHAR(255) NOT NULL UNIQUE,
    access_token TEXT NOT NULL,
    institution_id VARCHAR(255),
    institution_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'error', 'requires_update'
    error_code VARCHAR(100),
    error_message TEXT,
    available_products TEXT[], -- ['transactions', 'accounts', 'identity', etc.]
    billed_products TEXT[],
    consent_expiration_time TIMESTAMP WITH TIME ZONE,
    update_type VARCHAR(50), -- 'background', 'user_present_required'
    webhook_url TEXT,
    last_successful_update TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plaid Accounts
CREATE TABLE IF NOT EXISTS plaid_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plaid_item_id UUID REFERENCES plaid_items(id) ON DELETE CASCADE,
    account_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    official_name VARCHAR(255),
    type VARCHAR(50) NOT NULL, -- 'depository', 'credit', 'loan', 'investment'
    subtype VARCHAR(50), -- 'checking', 'savings', 'credit card', etc.
    mask VARCHAR(10), -- Last 4 digits
    verification_status VARCHAR(50),
    
    -- Balance information
    available_balance DECIMAL(12,2),
    current_balance DECIMAL(12,2),
    limit_amount DECIMAL(12,2),
    iso_currency_code VARCHAR(3) DEFAULT 'USD',
    unofficial_currency_code VARCHAR(10),
    
    -- Account metadata
    is_active BOOLEAN DEFAULT true,
    last_balance_update TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(plaid_item_id, account_id)
);

-- Plaid Transactions
CREATE TABLE IF NOT EXISTS plaid_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plaid_account_id UUID REFERENCES plaid_accounts(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) NOT NULL UNIQUE,
    
    -- Transaction details
    amount DECIMAL(12,2) NOT NULL,
    iso_currency_code VARCHAR(3) DEFAULT 'USD',
    unofficial_currency_code VARCHAR(10),
    date DATE NOT NULL,
    datetime TIMESTAMP WITH TIME ZONE,
    authorized_date DATE,
    authorized_datetime TIMESTAMP WITH TIME ZONE,
    
    -- Transaction description
    name VARCHAR(500) NOT NULL,
    merchant_name VARCHAR(255),
    original_description VARCHAR(500),
    
    -- Categories
    category TEXT[], -- Plaid's category hierarchy
    category_id VARCHAR(50),
    detailed_category VARCHAR(100),
    confidence_level VARCHAR(20), -- 'very_high', 'high', 'medium', 'low'
    
    -- Transaction metadata
    account_owner VARCHAR(50), -- 'user' or 'other'
    pending BOOLEAN DEFAULT false,
    pending_transaction_id VARCHAR(255),
    transaction_type VARCHAR(50), -- 'digital', 'place', 'special', 'unresolved'
    transaction_code VARCHAR(50), -- 'adjustment', 'atm', 'bank charge', etc.
    
    -- Location data
    location_address VARCHAR(500),
    location_city VARCHAR(100),
    location_region VARCHAR(100),
    location_postal_code VARCHAR(20),
    location_country VARCHAR(10),
    location_lat DECIMAL(10,8),
    location_lon DECIMAL(11,8),
    
    -- Payment metadata
    payment_method VARCHAR(50),
    payment_channel VARCHAR(50), -- 'online', 'in store', 'other'
    by_order_of VARCHAR(255),
    payee VARCHAR(255),
    payer VARCHAR(255),
    payment_processor VARCHAR(100),
    ppd_id VARCHAR(50),
    reason VARCHAR(255),
    reference_number VARCHAR(100),
    
    -- Personal finance category (Plaid's enhanced categorization)
    personal_finance_category_primary VARCHAR(100),
    personal_finance_category_detailed VARCHAR(100),
    personal_finance_category_confidence_level VARCHAR(20),
    
    -- Sync metadata
    is_synced_to_transactions BOOLEAN DEFAULT false,
    local_transaction_id UUID, -- Reference to your main transactions table
    sync_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plaid Webhooks Log
CREATE TABLE IF NOT EXISTS plaid_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_type VARCHAR(100) NOT NULL,
    webhook_code VARCHAR(100) NOT NULL,
    item_id VARCHAR(255),
    error_code VARCHAR(100),
    error_message TEXT,
    new_transactions INTEGER DEFAULT 0,
    removed_transactions TEXT[], -- Array of transaction IDs
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plaid Sync Cursors (for incremental updates)
CREATE TABLE IF NOT EXISTS plaid_sync_cursors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plaid_item_id UUID REFERENCES plaid_items(id) ON DELETE CASCADE,
    cursor VARCHAR(500),
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(plaid_item_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_plaid_items_user_id ON plaid_items(user_id);
CREATE INDEX IF NOT EXISTS idx_plaid_items_item_id ON plaid_items(item_id);
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_item_id ON plaid_accounts(plaid_item_id);
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_account_id ON plaid_accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_plaid_transactions_account_id ON plaid_transactions(plaid_account_id);
CREATE INDEX IF NOT EXISTS idx_plaid_transactions_date ON plaid_transactions(date);
CREATE INDEX IF NOT EXISTS idx_plaid_transactions_transaction_id ON plaid_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_plaid_transactions_pending ON plaid_transactions(pending);
CREATE INDEX IF NOT EXISTS idx_plaid_webhooks_processed ON plaid_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_plaid_webhooks_created_at ON plaid_webhooks(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_plaid_items_updated_at BEFORE UPDATE ON plaid_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plaid_accounts_updated_at BEFORE UPDATE ON plaid_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plaid_transactions_updated_at BEFORE UPDATE ON plaid_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plaid_sync_cursors_updated_at BEFORE UPDATE ON plaid_sync_cursors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
