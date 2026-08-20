-- ============================================================
-- SEED ADMIN USER: Mayur Aglawe
-- Mobile: 7620098404
-- PIN: 1234 (Bcrypt Hashed)
-- Role: ADMIN
-- ============================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "public";

-- Upsert Mayur Aglawe as Admin User
INSERT INTO "users" (
    "id",
    "name",
    "mobile",
    "hashed_pin",
    "role",
    "is_verified",
    "is_active",
    "consent_given",
    "created_at",
    "updated_at"
) VALUES (
    gen_random_uuid(),
    'Mayur Aglawe',
    '7620098404',
    '$2b$10$bK9TL9OZqq5XmyA8GmR40.Ylx9Wb2h74i5MOW52NHXs8L2v5dYdSC',
    'ADMIN',
    true,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("mobile") 
DO UPDATE SET 
    "name" = EXCLUDED."name",
    "hashed_pin" = EXCLUDED."hashed_pin",
    "role" = EXCLUDED."role",
    "is_verified" = true,
    "is_active" = true,
    "updated_at" = CURRENT_TIMESTAMP;
