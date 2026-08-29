ALTER TABLE "user_state"
ADD COLUMN IF NOT EXISTS "active_roadmap_id" UUID;

CREATE INDEX IF NOT EXISTS "idx_user_state_active_roadmap"
ON "user_state" ("active_roadmap_id");
