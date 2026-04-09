-- ============================================================
-- SEED — run in Supabase SQL Editor
-- Replaces all existing actions with the imported dataset
-- ============================================================
DELETE FROM actions;

INSERT INTO actions (stage, action_list, owner, impact_quarter, kpi, status, archived) VALUES

('Business Analysis',
 'Dashboard, traffic analysis, iCP review target',
 'Boyu', 'Q1', 'Analysis completed',
 false, false),

('ICP Operation & Mid Platform Resources/Traffic',
 'Green Path Push and new Push/EDM mechanism product launches — performance monitoring & strategic iteration',
 'Boyu', 'Q1', 'Conversion rate increase',
 false, false),

('ICP Operation & Mid Platform Resources/Traffic',
 'Search & Recommendation weighting experiments — performance analysis & iterative strategy optimization',
 'Boyu', 'Q1', 'Search relevance score',
 false, false),

('Lead Generation',
 'Lead affiliate partnerships (main focus: Associations of core categories according to ICP, Unespain for Spain)',
 'Arianna', 'Q1', '# of Qualified Leads shared',
 false, false),

('Lead Generation',
 'Develop Lead Base for Upselling via Shopify implementation',
 'Karl / Arianna', 'TBC', '# Free TS, # Orders',
 false, false),

('New Customers Acquisition',
 'Handover of Channels from Franci to Ana',
 'Arianna', 'Q1', 'Handover completed',
 true, true),

('New Customers Acquisition',
 'Working on reseller partnership in Italy and Spain / Recovery of partnerships renewed in PT',
 'Arianna', 'Q1', '# of New Sign; Cash Revenue',
 false, false),

('New Customers Acquisition',
 'Amended contract (Agreed on changes in Feb; solicited to Borui the amendment to contract in Mar)',
 'Arianna', 'Q1', '# of Newly Signed Contracts',
 false, false),

('New Customers Acquisition',
 'Commission policy re-definition',
 'Jinjin', 'Q1', 'Policy approved',
 true, true),

('New Customers Acquisition',
 'Commercial products (Packages, Guaranteed ads, KSP)',
 'Jinjin', 'Q1', 'Product launch',
 true, true),

('Customer Success & Account Management',
 'Working with Ana on new structure per channel pushing different tasks and priorities (e.g. KWA Consumption, KWA Top-Up, TA Activation..)',
 'Arianna', 'Q1', 'Revenue, Renewals',
 false, false),

('Buyers',
 'Leverage channels for targeted buyer acquisition (Shared proposal to Revolut Business, Italian partner, advanced negotiation with EU player Atradius, IFEMA, VISA)',
 'Arianna', 'Q2', '# of Buyers',
 false, false),

('Gov. Project',
 'ICE (Italy): Agreed on ICE3 conditions (DONE); Closing old commission issue (IN PROGRESS); Start activity on 303 ICE 3 clients (PENDING)',
 'Arianna', 'Q1', 'Cash Revenue (Q1)',
 false, false),

('Gov. Project',
 'ICEX (Spain): Align with Giusy and Sylvia to secure remaining payments (60%)',
 'Arianna', 'Q1', 'Cash Revenue',
 false, false),

('Gov. Project',
 'BUSINESS FRANCE (France): Align with Sylvia on BF1 and BF service criticalities (DONE); Review Visable involvement',
 'Arianna', 'Q1', 'Cash Revenue',
 false, false);
