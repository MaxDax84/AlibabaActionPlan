-- Actions table
CREATE TABLE IF NOT EXISTS actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stage TEXT NOT NULL,
  action_list TEXT NOT NULL,
  owner TEXT NOT NULL,
  impact_quarter TEXT,
  kpi TEXT DEFAULT '',
  status BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering
CREATE INDEX idx_actions_archived ON actions(archived);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_actions_stage ON actions(stage);
CREATE INDEX idx_actions_owner ON actions(owner);
CREATE INDEX idx_actions_impact_quarter ON actions(impact_quarter);

-- Version history table
CREATE TABLE IF NOT EXISTS database_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot JSONB NOT NULL,
  version_label TEXT NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO actions (stage, action_list, owner, impact_quarter, kpi, status, archived)
VALUES
  ('Lead Generation', 'Lead affiliate partnerships (Associations)', 'Arianna', 'Q1', '', FALSE, FALSE),
  ('New Customer Acquisition', 'Re-Define Commissions Framework', 'Jinjin/Nic', '', '', TRUE, TRUE);

-- Row Level Security (open access - no auth required)
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on actions" ON actions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on versions" ON database_versions FOR ALL USING (true) WITH CHECK (true);
