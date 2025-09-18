-- Create comprehensive tax database schema
CREATE TABLE IF NOT EXISTS tax_brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  filing_status TEXT NOT NULL, -- 'single', 'married_joint', 'married_separate', 'head_of_household'
  bracket_min DECIMAL(12,2) NOT NULL,
  bracket_max DECIMAL(12,2),
  rate DECIMAL(5,4) NOT NULL,
  tax_type TEXT NOT NULL DEFAULT 'federal', -- 'federal', 'state', 'local'
  jurisdiction TEXT, -- state code or locality identifier
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS state_tax_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code TEXT NOT NULL,
  state_name TEXT NOT NULL,
  has_income_tax BOOLEAN DEFAULT true,
  flat_rate DECIMAL(5,4), -- for flat tax states
  standard_deduction DECIMAL(10,2),
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS local_tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code TEXT NOT NULL,
  city TEXT,
  county TEXT,
  state_code TEXT NOT NULL,
  local_income_tax_rate DECIMAL(5,4) DEFAULT 0,
  sales_tax_rate DECIMAL(5,4) DEFAULT 0,
  property_tax_rate DECIMAL(5,4) DEFAULT 0,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payroll_tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  social_security_rate DECIMAL(5,4) NOT NULL,
  medicare_rate DECIMAL(5,4) NOT NULL,
  additional_medicare_rate DECIMAL(5,4) NOT NULL,
  social_security_wage_base DECIMAL(12,2) NOT NULL,
  additional_medicare_threshold DECIMAL(12,2) NOT NULL,
  unemployment_rate DECIMAL(5,4) NOT NULL,
  unemployment_wage_base DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert current tax data for 2024
INSERT INTO tax_brackets (year, filing_status, bracket_min, bracket_max, rate, tax_type) VALUES
-- Federal tax brackets for 2024 - Single
(2024, 'single', 0, 11000, 0.10, 'federal'),
(2024, 'single', 11000, 44725, 0.12, 'federal'),
(2024, 'single', 44725, 95375, 0.22, 'federal'),
(2024, 'single', 95375, 197050, 0.24, 'federal'),
(2024, 'single', 197050, 250525, 0.32, 'federal'),
(2024, 'single', 250525, 626350, 0.35, 'federal'),
(2024, 'single', 626350, NULL, 0.37, 'federal'),

-- Federal tax brackets for 2024 - Married Filing Jointly
(2024, 'married_joint', 0, 22000, 0.10, 'federal'),
(2024, 'married_joint', 22000, 89450, 0.12, 'federal'),
(2024, 'married_joint', 89450, 190750, 0.22, 'federal'),
(2024, 'married_joint', 190750, 364200, 0.24, 'federal'),
(2024, 'married_joint', 364200, 462500, 0.32, 'federal'),
(2024, 'married_joint', 462500, 693750, 0.35, 'federal'),
(2024, 'married_joint', 693750, NULL, 0.37, 'federal');

INSERT INTO payroll_tax_rates (year, social_security_rate, medicare_rate, additional_medicare_rate, social_security_wage_base, additional_medicare_threshold, unemployment_rate, unemployment_wage_base) VALUES
(2024, 0.062, 0.0145, 0.009, 168600, 200000, 0.006, 7000);

-- Sample state tax data
INSERT INTO state_tax_info (state_code, state_name, has_income_tax, flat_rate, standard_deduction, year) VALUES
('CA', 'California', true, NULL, 5202, 2024),
('TX', 'Texas', false, NULL, 0, 2024),
('FL', 'Florida', false, NULL, 0, 2024),
('NY', 'New York', true, NULL, 8000, 2024),
('WA', 'Washington', false, NULL, 0, 2024);

-- California state tax brackets
INSERT INTO tax_brackets (year, filing_status, bracket_min, bracket_max, rate, tax_type, jurisdiction) VALUES
(2024, 'single', 0, 10099, 0.01, 'state', 'CA'),
(2024, 'single', 10099, 23942, 0.02, 'state', 'CA'),
(2024, 'single', 23942, 37788, 0.04, 'state', 'CA'),
(2024, 'single', 37788, 52455, 0.06, 'state', 'CA'),
(2024, 'single', 52455, 66295, 0.08, 'state', 'CA'),
(2024, 'single', 66295, 338639, 0.093, 'state', 'CA'),
(2024, 'single', 338639, 406364, 0.103, 'state', 'CA'),
(2024, 'single', 406364, 677278, 0.113, 'state', 'CA'),
(2024, 'single', 677278, NULL, 0.123, 'state', 'CA');

-- New York state tax brackets
INSERT INTO tax_brackets (year, filing_status, bracket_min, bracket_max, rate, tax_type, jurisdiction) VALUES
(2024, 'single', 0, 8500, 0.04, 'state', 'NY'),
(2024, 'single', 8500, 11700, 0.045, 'state', 'NY'),
(2024, 'single', 11700, 13900, 0.0525, 'state', 'NY'),
(2024, 'single', 13900, 80650, 0.055, 'state', 'NY'),
(2024, 'single', 80650, 215400, 0.06, 'state', 'NY'),
(2024, 'single', 215400, 1077550, 0.0685, 'state', 'NY'),
(2024, 'single', 1077550, 5000000, 0.0965, 'state', 'NY'),
(2024, 'single', 5000000, 25000000, 0.103, 'state', 'NY'),
(2024, 'single', 25000000, NULL, 0.109, 'state', 'NY');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tax_brackets_year_status ON tax_brackets(year, filing_status, tax_type);
CREATE INDEX IF NOT EXISTS idx_state_tax_year ON state_tax_info(year, state_code);
CREATE INDEX IF NOT EXISTS idx_local_tax_zip ON local_tax_rates(zip_code, year);
CREATE INDEX IF NOT EXISTS idx_payroll_tax_year ON payroll_tax_rates(year);
