-- ============================================================
-- SEED — run in Supabase SQL Editor (after migration)
-- Replaces all existing actions with the new dataset
-- ============================================================
DELETE FROM actions;

INSERT INTO actions (task_id, stage, domain, action_list, owner, kpi, status, archived) VALUES

-- ── Section 1: Business Analysis & Platform ────────────────
('BA_01', 'Business Analysis & Platform', 'Business Analysis',
 'Dashboard, traffic analysis, ICP review target',
 'Boyu', 'Analysis completed', false, false),

('BA_02', 'Business Analysis & Platform', 'Business Analysis',
 'Cross-category competitive benchmarking (pricing, assortment, content quality)',
 'Boyu', 'Benchmark report delivered', false, false),

('BA_03', 'Business Analysis & Platform', 'Business Analysis',
 'Weekly performance reporting framework — KPI dashboard setup and maintenance',
 'Boyu', 'Dashboard live & updated weekly', false, false),

('OP_01', 'Business Analysis & Platform', 'ICP Operation',
 'Green Path Push and new Push/EDM mechanism product launches — performance monitoring & strategic iteration',
 'Boyu', 'Conversion rate increase', false, false),

('OP_02', 'Business Analysis & Platform', 'ICP Operation',
 'Search & Recommendation weighting experiments — performance analysis & iterative strategy optimization',
 'Boyu', 'Search relevance score', false, false),

-- ── Section 2: Lead Generation & Shopify Strategy ─────────
('LG_01', 'Lead Generation & Shopify Strategy', 'Lead Gen',
 'Lead affiliate partnerships (main focus: Associations of core categories according to ICP, Unespain for Spain)',
 'Arianna', '# of Qualified Leads shared', false, false),

('LG_02', 'Lead Generation & Shopify Strategy', 'Lead Gen',
 'Email campaigns targeting cold leads (industry events, trade fairs, chamber of commerce lists)',
 'Arianna', '# of leads generated', false, false),

('LG_03', 'Lead Generation & Shopify Strategy', 'Lead Gen',
 'LinkedIn outreach program for ICP-aligned prospects in IT/ES/PT/FR',
 'Arianna', '# of qualified connections / meeting booked', false, false),

('LG_04', 'Lead Generation & Shopify Strategy', 'Lead Gen',
 'Referral incentive program for existing clients (introduce-a-buyer scheme)',
 'Arianna', '# referrals submitted', false, false),

('SH_01', 'Lead Generation & Shopify Strategy', 'Shopify',
 'Develop Lead Base for Upselling via Shopify implementation',
 'Karl / Arianna', '# Free TS, # Orders', false, false),

('SH_02', 'Lead Generation & Shopify Strategy', 'Shopify',
 'Shopify App Store optimisation — listing content, screenshots, keyword strategy',
 'Karl', 'App store ranking / # installs', false, false),

('SH_03', 'Lead Generation & Shopify Strategy', 'Shopify',
 'Shopify merchant onboarding flow — streamline trial activation and first-order journey',
 'Karl', 'Trial-to-paid conversion rate', false, false),

-- ── Section 3: New Customer Acquisition & Policy ──────────
('AC_01', 'New Customer Acquisition & Policy', 'Acquisition',
 'Working on reseller partnership in Italy and Spain / Recovery of partnerships renewed in PT',
 'Arianna', '# of New Sign; Cash Revenue', false, false),

('AC_02', 'New Customer Acquisition & Policy', 'Acquisition',
 'Amended contract (Agreed on changes in Feb; solicited to Borui the amendment to contract in Mar)',
 'Arianna', '# of Newly Signed Contracts', false, false),

('AC_03', 'New Customer Acquisition & Policy', 'Acquisition',
 'Handover of Channels from Franci to Ana',
 'Arianna', 'Handover completed', true, true),

('AC_04', 'New Customer Acquisition & Policy', 'Acquisition',
 'New logo acquisition campaign — targeted outreach to ICP companies not yet on platform',
 'Arianna', '# New logos signed', false, false),

('PL_01', 'New Customer Acquisition & Policy', 'Policy',
 'Commission policy re-definition',
 'Jinjin', 'Policy approved', true, true),

('PL_02', 'New Customer Acquisition & Policy', 'Policy',
 'Commercial products (Packages, Guaranteed ads, KSP)',
 'Jinjin', 'Product launch', true, true),

('PL_03', 'New Customer Acquisition & Policy', 'Policy',
 'Refund & dispute handling policy update — align with EU consumer protection requirements',
 'Jinjin', 'Policy published & team trained', false, false),

-- ── Section 4: Customer Success, Buyers & Gov Projects ────
('CS_01', 'Customer Success, Buyers & Gov Projects', 'CS & AM',
 'Working with Ana on new structure per channel pushing different tasks and priorities (e.g. KWA Consumption, KWA Top-Up, TA Activation)',
 'Arianna', 'Revenue, Renewals', false, false),

('BY_01', 'Customer Success, Buyers & Gov Projects', 'Buyers',
 'Leverage channels for targeted buyer acquisition (Shared proposal to Revolut Business, Italian partner, advanced negotiation with EU player Atradius, IFEMA, VISA)',
 'Arianna', '# of Buyers', false, false),

('BY_02', 'Customer Success, Buyers & Gov Projects', 'Buyers',
 'Buyer retention programme — quarterly business reviews and platform adoption check-ins',
 'Arianna', 'Buyer retention rate', false, false),

('GV_01', 'Customer Success, Buyers & Gov Projects', 'Gov (ITA)',
 'ICE (Italy): Agreed on ICE3 conditions (DONE); Closing old commission issue (IN PROGRESS); Start activity on 303 ICE 3 clients (PENDING)',
 'Arianna', 'Cash Revenue (Q1)', false, false),

('GV_02', 'Customer Success, Buyers & Gov Projects', 'Gov (SPA)',
 'ICEX (Spain): Align with Giusy and Sylvia to secure remaining payments (60%)',
 'Arianna', 'Cash Revenue', false, false),

('GV_03', 'Customer Success, Buyers & Gov Projects', 'Gov (FRA)',
 'BUSINESS FRANCE (France): Align with Sylvia on BF1 and BF service criticalities (DONE); Review Visable involvement',
 'Arianna', 'Cash Revenue', false, false);
