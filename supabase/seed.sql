-- ============================================================
-- SEED: Action Plan — full historical table
-- Run in Supabase SQL Editor to replace all existing actions
-- ============================================================

-- Clear existing actions (versions are preserved)
DELETE FROM actions;

-- ─── Business Analysis ───────────────────────────────────────
INSERT INTO actions (stage, action_list, owner, impact_quarter, kpi, status, archived) VALUES
('Business Analysis',
 'Dashboard, traffic analysis, ICP review target',
 'Boyu', '', '', false, false);

-- ─── ICP Operation ───────────────────────────────────────────
INSERT INTO actions (stage, action_list, owner, impact_quarter, kpi, status, archived) VALUES
('ICP Operation',
 'Green Path Push and new Push/EDM mechanism product launches — performance monitoring & strategic iteration',
 'Boyu', '', '', false, false),
('ICP Operation',
 'Search & Recommendation weighting experiments — performance analysis & iterative strategy optimization',
 'Boyu', '', '', false, false);

-- ─── Lead Generation ─────────────────────────────────────────
INSERT INTO actions (stage, action_list, owner, impact_quarter, kpi, status, archived) VALUES
('Lead Generation',
 'Lead affiliate partnerships (Associations of core categories per ICP, Unespain for Spain)',
 'Arianna', 'Q1', '#of Qualified Leads shared to DS team', false, false),

('Lead Generation',
 'Shopify EU integration: postpone post-US launch. Keep May requests, evaluate after Accio Work priorities. Possible EU rollout June.',
 'Karl/Arianna', 'TBC', '', false, false),

('Lead Generation',
 'Develop Lead Base for Upselling via Shopify implementation',
 'Karl/Arianna', 'TBC', '#Free TS, #Orders', false, false),

('Lead Generation',
 'Focus Shopify user communication on Alibaba.com ICP',
 'Karl/Arianna', 'TBC', '', false, false),

('Lead Generation',
 'Collaborate to ensure proper translations of funnel and Payoneer for TA',
 'Karl/Arianna', 'TBC', '', false, false),

('Lead Generation',
 'Tiers with ICP',
 'Jinjin', 'Q1', '', false, false),

('Lead Generation',
 'New landing page',
 'Jinjin', 'Q1', '', false, false),

('Lead Generation',
 'AI enrichment tool',
 'Jinjin', 'Q1', '', false, false),

('Lead Generation',
 'Collaboration with Marketing Team on Tradeshows',
 'Jinjin', 'FY27', '', false, false);

-- ─── New Customer Acquisition ────────────────────────────────
INSERT INTO actions (stage, action_list, owner, impact_quarter, kpi, status, archived) VALUES
('New Customer Acquisition',
 'Handover of Channels from Franci to Ana',
 'Arianna', 'Q1', '#of New Sign; Cash Revenue, Revenue', true, true),

('New Customer Acquisition',
 'Reseller partnership in Italy and Spain / Recovery of partnerships renewed in PT',
 'Arianna', 'Q1', '#of Newly Signed Contracts', false, false),

('New Customer Acquisition',
 'Amended contract (changes agreed Feb; amendment solicited to Borui Mar)',
 'Arianna', 'Q1', 'n.a.', false, false),

('New Customer Acquisition',
 'Payment resolution (discussed Feb w/ Ella; follow-up on solutions Mar)',
 'Arianna', 'TBC', 'n.a.', false, false),

('New Customer Acquisition',
 'Commission policy',
 'Jinjin', 'Q1', '', true, true),

('New Customer Acquisition',
 'Compensation for consumption from FY26',
 'Jinjin', 'Q1', '', true, true),

('New Customer Acquisition',
 'Commercial products: Packages, Guaranteed ads, KSP',
 'Jinjin', 'Q1', '', false, false),

('New Customer Acquisition',
 'Target assignment',
 'Jinjin', 'FY27', '', false, false);

-- ─── Customer Success ────────────────────────────────────────
INSERT INTO actions (stage, action_list, owner, impact_quarter, kpi, status, archived) VALUES
('Customer Success',
 'New structure per channel: different tasks and priorities based on channel situation (KWA Consumption, KWA Top-Up, TA Activation)',
 'Arianna', 'Q1', 'Revenue, Renewal Rate', false, false);

-- ─── Buyers ──────────────────────────────────────────────────
INSERT INTO actions (stage, action_list, owner, impact_quarter, kpi, status, archived) VALUES
('Buyers',
 'Leverage channels for targeted buyer acquisition: Revolut Business (Accio Work benefit) — PENDING, Italian partner buyer acquirer — PENDING, EU players (Atradius, IFEMA, VISA) — negotiations ongoing',
 'Arianna', 'Q2', '#of Buyers', false, false),

('Buyers',
 'Pilot B2B and B2B2C buyer acquisition model: Unespain proposal — IN PROGRESS, multiple EU industry players — IN PROGRESS',
 'Arianna', 'Q2', '#of Buyers', false, false);

-- ─── Gov. Project ────────────────────────────────────────────
INSERT INTO actions (stage, action_list, owner, impact_quarter, kpi, status, archived) VALUES
('Gov. Project',
 'ICE Italy: conditions agreed (DONE), closing old commission issue (IN PROGRESS), start activity on 303 ICE3 clients 94.5% expired pool (PENDING)',
 'Arianna', 'Q1', 'Cash Revenue (Q1), Revenue (Q2)', false, false),

('Gov. Project',
 'ICEX Spain: align with Giusy and Sylvia to secure remaining payments (60%)',
 'Arianna', 'Q1', 'Cash Revenue and Revenue (Q1)', false, false),

('Gov. Project',
 'Business France: BF1/BF service criticalities, Visable involvement review, new ICP/SOP alignment, BF2 SOP, new POC for payments, process ~26 client payments',
 'Arianna', 'Q1', 'Cash Revenue and Revenue (Q1)', false, false);
