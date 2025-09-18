-- Data Orchestrator and Parser System Schema
-- Creates tables for managing data parsing, validation, and orchestration

-- Data Sources Management
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'bank', 'plaid', 'manual', 'ocr', 'csv'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'error'
    config JSONB DEFAULT '{}',
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Processing Jobs
CREATE TABLE IF NOT EXISTS data_processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES data_sources(id),
    job_type VARCHAR(100) NOT NULL, -- 'import', 'categorize', 'validate', 'reconcile'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    input_data JSONB,
    output_data JSONB,
    error_details TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Validation Rules
CREATE TABLE IF NOT EXISTS data_validation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(100) NOT NULL, -- 'amount_range', 'category_mapping', 'duplicate_detection'
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction Categories with ML Training Data
CREATE TABLE IF NOT EXISTS transaction_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES transaction_categories(id),
    color VARCHAR(7) DEFAULT '#0891b2',
    icon VARCHAR(50),
    keywords TEXT[], -- For ML categorization
    patterns TEXT[], -- Regex patterns for auto-categorization
    confidence_threshold DECIMAL(3,2) DEFAULT 0.8,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OCR Processing Results
CREATE TABLE IF NOT EXISTS ocr_processing_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    raw_text TEXT,
    structured_data JSONB,
    confidence_score DECIMAL(3,2),
    processing_status VARCHAR(50) DEFAULT 'pending',
    transaction_id UUID REFERENCES transactions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Quality Metrics
CREATE TABLE IF NOT EXISTS data_quality_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type VARCHAR(100) NOT NULL, -- 'accuracy', 'completeness', 'consistency'
    source_id UUID REFERENCES data_sources(id),
    metric_value DECIMAL(5,2),
    measurement_date DATE DEFAULT CURRENT_DATE,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchdog Alerts
CREATE TABLE IF NOT EXISTS watchdog_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(100) NOT NULL, -- 'data_anomaly', 'sync_failure', 'validation_error'
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    source_reference VARCHAR(255),
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_processing_jobs_status ON data_processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_data_processing_jobs_created_at ON data_processing_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_categories_parent_id ON transaction_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_ocr_processing_results_status ON ocr_processing_results(processing_status);
CREATE INDEX IF NOT EXISTS idx_watchdog_alerts_severity ON watchdog_alerts(severity, is_resolved);

-- Insert default transaction categories
INSERT INTO transaction_categories (name, color, icon, keywords, patterns, is_system) VALUES
('Income', '#10b981', 'TrendingUp', ARRAY['salary', 'wage', 'paycheck', 'bonus', 'commission'], ARRAY['PAYROLL', 'DIRECT DEP'], true),
('Food & Dining', '#f59e0b', 'Utensils', ARRAY['restaurant', 'grocery', 'food', 'dining'], ARRAY['RESTAURANT', 'GROCERY', 'FOOD'], true),
('Transportation', '#3b82f6', 'Car', ARRAY['gas', 'fuel', 'uber', 'taxi', 'parking'], ARRAY['GAS STATION', 'UBER', 'PARKING'], true),
('Shopping', '#ec4899', 'ShoppingBag', ARRAY['amazon', 'store', 'retail', 'shopping'], ARRAY['AMAZON', 'WALMART', 'TARGET'], true),
('Bills & Utilities', '#ef4444', 'Zap', ARRAY['electric', 'water', 'internet', 'phone', 'utility'], ARRAY['ELECTRIC', 'WATER', 'INTERNET'], true),
('Healthcare', '#8b5cf6', 'Heart', ARRAY['doctor', 'pharmacy', 'medical', 'health'], ARRAY['PHARMACY', 'MEDICAL', 'DOCTOR'], true),
('Entertainment', '#06b6d4', 'Film', ARRAY['movie', 'streaming', 'entertainment', 'netflix'], ARRAY['NETFLIX', 'SPOTIFY', 'MOVIE'], true),
('Other', '#6b7280', 'MoreHorizontal', ARRAY[], ARRAY[], true)
ON CONFLICT DO NOTHING;
