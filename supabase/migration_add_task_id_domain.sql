-- Migration: add task_id and domain columns to actions table
-- Run this in the Supabase SQL Editor before running the new seed

ALTER TABLE actions
  ADD COLUMN IF NOT EXISTS task_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS domain  TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_actions_domain ON actions(domain);
