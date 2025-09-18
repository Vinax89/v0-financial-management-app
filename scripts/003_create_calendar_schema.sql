-- Create unified calendar schema for bills, transactions, and work schedule
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('bill', 'transaction', 'work', 'reminder', 'goal')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN DEFAULT false,
  amount DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'overdue', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category_id UUID REFERENCES categories(id),
  account_id UUID REFERENCES accounts(id),
  transaction_id UUID REFERENCES transactions(id),
  recurring_rule JSONB,
  is_recurring BOOLEAN DEFAULT false,
  parent_event_id UUID REFERENCES calendar_events(id),
  color TEXT DEFAULT '#3b82f6',
  location TEXT,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hourly_rate DECIMAL(8,2),
  hours_per_week DECIMAL(5,2),
  start_time TIME,
  end_time TIME,
  work_days INTEGER[], -- Array of day numbers (0=Sunday, 1=Monday, etc.)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bill_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_event_id UUID NOT NULL REFERENCES calendar_events(id),
  bill_name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  account_id UUID REFERENCES accounts(id),
  category_id UUID REFERENCES categories(id),
  is_autopay BOOLEAN DEFAULT false,
  reminder_days INTEGER[] DEFAULT ARRAY[7, 3, 1], -- Days before due date to remind
  last_paid_date DATE,
  next_due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO work_schedules (name, hourly_rate, hours_per_week, start_time, end_time, work_days) VALUES
('Full-time Job', 25.00, 40, '09:00', '17:00', ARRAY[1,2,3,4,5]),
('Part-time Weekend', 20.00, 16, '10:00', '18:00', ARRAY[0,6]);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_bill_reminders_due_date ON bill_reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_work_schedules_active ON work_schedules(is_active);
