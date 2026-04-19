-- Trichy Premier League PostgreSQL bootstrap
-- Run with: psql -U postgres -f database/init.sql

CREATE DATABASE tpl_db;
\connect tpl_db;

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) UNIQUE NOT NULL,
  logo_url VARCHAR(300),
  captain VARCHAR(120) NOT NULL
);

CREATE TYPE player_role AS ENUM ('batsman', 'bowler', 'all_rounder');
CREATE TYPE match_status AS ENUM ('upcoming', 'completed', 'live');

CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  role player_role NOT NULL,
  runs INT NOT NULL DEFAULT 0,
  wickets INT NOT NULL DEFAULT 0,
  strike_rate FLOAT NOT NULL DEFAULT 0,
  team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  team_a_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team_b_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  date_time TIMESTAMPTZ NOT NULL,
  venue VARCHAR(200) NOT NULL,
  status match_status NOT NULL DEFAULT 'upcoming',
  winner_team_id INT REFERENCES teams(id) ON DELETE SET NULL,
  team_a_runs INT NOT NULL DEFAULT 0,
  team_a_wickets INT NOT NULL DEFAULT 0,
  team_a_overs FLOAT NOT NULL DEFAULT 0,
  team_b_runs INT NOT NULL DEFAULT 0,
  team_b_wickets INT NOT NULL DEFAULT 0,
  team_b_overs FLOAT NOT NULL DEFAULT 0,
  current_innings INT NOT NULL DEFAULT 1,
  striker_id INT REFERENCES players(id) ON DELETE SET NULL,
  non_striker_id INT REFERENCES players(id) ON DELETE SET NULL,
  bowler_id INT REFERENCES players(id) ON DELETE SET NULL,
  commentary JSON NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS media_assets (
  id SERIAL PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) UNIQUE NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS live_stream_configs (
  id SERIAL PRIMARY KEY,
  stream_url VARCHAR(500),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
