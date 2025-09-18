-- Receipt OCR and Processing Schema
-- Creates tables for managing receipt uploads, OCR processing, and extracted data

-- Receipt uploads
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Reference to your users table
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    
    -- Processing status
    status VARCHAR(50) DEFAULT 'uploaded', -- 'uploaded', 'processing', 'completed', 'failed'
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- OCR results
    raw_text TEXT,
    confidence_score DECIMAL(3,2),
    
    -- Extracted structured data
    merchant_name VARCHAR(255),
    merchant_address TEXT,
    merchant_phone VARCHAR(50),
    
    -- Transaction details
    transaction_date DATE,
    transaction_time TIME,
    subtotal DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    tip_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Payment information
    payment_method VARCHAR(50), -- 'cash', 'credit', 'debit', 'mobile'
    card_last_four VARCHAR(4),
    
    -- Line items
    line_items JSONB DEFAULT '[]',
    
    -- Categories and tags
    suggested_category VARCHAR(100),
    category_confidence DECIMAL(3,2),
    tags TEXT[],
    
    -- Verification and corrections
    is_verified BOOLEAN DEFAULT false,
    verified_by_user BOOLEAN DEFAULT false,
    user_corrections JSONB,
    
    -- Integration
    is_synced_to_transactions BOOLEAN DEFAULT false,
    transaction_id UUID, -- Reference to main transactions table
    sync_error TEXT,
    
    -- Metadata
    processing_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipt line items (normalized for better querying)
CREATE TABLE IF NOT EXISTS receipt_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    
    -- Item details
    item_name VARCHAR(255),
    item_description TEXT,
    quantity DECIMAL(8,2),
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    
    -- Item categorization
    item_category VARCHAR(100),
    item_subcategory VARCHAR(100),
    
    -- Tax and discounts
    tax_amount DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    
    -- Metadata
    confidence_score DECIMAL(3,2),
    bounding_box JSONB, -- OCR bounding box coordinates
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OCR processing jobs queue
CREATE TABLE IF NOT EXISTS ocr_processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
    
    -- Job details
    job_type VARCHAR(50) NOT NULL, -- 'ocr_extract', 'data_parse', 'categorize'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    priority INTEGER DEFAULT 5, -- 1-10, lower is higher priority
    
    -- Processing details
    processor VARCHAR(50), -- 'openai_vision', 'google_vision', 'aws_textract'
    input_data JSONB,
    output_data JSONB,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Timing
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipt templates for common merchants
CREATE TABLE IF NOT EXISTS receipt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_name VARCHAR(255) NOT NULL,
    merchant_aliases TEXT[], -- Alternative names/spellings
    
    -- Template patterns
    date_pattern VARCHAR(255),
    time_pattern VARCHAR(255),
    total_pattern VARCHAR(255),
    tax_pattern VARCHAR(255),
    
    -- Field locations (relative positions)
    field_mappings JSONB,
    
    -- Validation rules
    validation_rules JSONB,
    
    -- Usage statistics
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(3,2),
    
    -- Template metadata
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(50) DEFAULT 'system',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User feedback for improving OCR accuracy
CREATE TABLE IF NOT EXISTS receipt_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Feedback type
    feedback_type VARCHAR(50) NOT NULL, -- 'correction', 'verification', 'flag_error'
    
    -- Original vs corrected values
    field_name VARCHAR(100),
    original_value TEXT,
    corrected_value TEXT,
    
    -- User rating
    accuracy_rating INTEGER, -- 1-5 stars
    
    -- Comments
    comments TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(transaction_date);
CREATE INDEX IF NOT EXISTS idx_receipts_merchant ON receipts(merchant_name);
CREATE INDEX IF NOT EXISTS idx_receipt_line_items_receipt_id ON receipt_line_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_ocr_jobs_status ON ocr_processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ocr_jobs_priority ON ocr_processing_jobs(priority, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_receipt_templates_merchant ON receipt_templates(merchant_name);
CREATE INDEX IF NOT EXISTS idx_receipt_feedback_receipt_id ON receipt_feedback(receipt_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receipt_line_items_updated_at BEFORE UPDATE ON receipt_line_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ocr_processing_jobs_updated_at BEFORE UPDATE ON ocr_processing_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receipt_templates_updated_at BEFORE UPDATE ON receipt_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some common receipt templates
INSERT INTO receipt_templates (merchant_name, merchant_aliases, date_pattern, time_pattern, total_pattern, tax_pattern, field_mappings, validation_rules) VALUES
('Walmart', ARRAY['WAL-MART', 'WALMART SUPERCENTER'], '\d{2}/\d{2}/\d{4}', '\d{2}:\d{2}:\d{2}', 'TOTAL\s+\$?(\d+\.\d{2})', 'TAX\s+\$?(\d+\.\d{2})', '{}', '{}'),
('Target', ARRAY['TARGET STORE'], '\d{2}/\d{2}/\d{4}', '\d{2}:\d{2}', 'TOTAL\s+\$?(\d+\.\d{2})', 'TAX\s+\$?(\d+\.\d{2})', '{}', '{}'),
('Starbucks', ARRAY['STARBUCKS COFFEE'], '\d{2}/\d{2}/\d{4}', '\d{2}:\d{2}:\d{2}', 'Total\s+\$?(\d+\.\d{2})', 'Tax\s+\$?(\d+\.\d{2})', '{}', '{}'),
('McDonald''s', ARRAY['MCDONALDS', 'MCD'], '\d{2}/\d{2}/\d{4}', '\d{2}:\d{2}', 'Total\s+\$?(\d+\.\d{2})', 'Tax\s+\$?(\d+\.\d{2})', '{}', '{}')
ON CONFLICT DO NOTHING;
