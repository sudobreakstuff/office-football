-- Office Football Supabase Schema
-- Run this in the Supabase SQL Editor

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  type VARCHAR(10) NOT NULL DEFAULT '1v1',
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
  game_state JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room players
CREATE TABLE IF NOT EXISTS room_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  nickname VARCHAR(30) NOT NULL,
  character JSONB DEFAULT '{}'::jsonb,
  team INTEGER DEFAULT 0,
  ready BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player profiles (persistent stats)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname VARCHAR(30) UNIQUE NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  goals_scored INTEGER DEFAULT 0,
  goals_conceded INTEGER DEFAULT 0,
  tournaments_won INTEGER DEFAULT 0,
  unlocked_celebrations JSONB DEFAULT '[]'::jsonb,
  unlocked_items JSONB DEFAULT '[]'::jsonb,
  character JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Tournaments
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
  bracket_size INTEGER DEFAULT 8,
  bracket_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournament matches
CREATE TABLE IF NOT EXISTS tournament_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  round INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  player1_id UUID REFERENCES profiles(id),
  player2_id UUID REFERENCES profiles(id),
  winner_id UUID REFERENCES profiles(id),
  score JSONB DEFAULT '{}'::jsonb,
  room_code VARCHAR(10),
  status VARCHAR(20) DEFAULT 'pending'
);

-- Match history
CREATE TABLE IF NOT EXISTS match_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID,
  player1 VARCHAR(30) NOT NULL,
  player2 VARCHAR(30) NOT NULL,
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  winner INTEGER DEFAULT -1,
  duration INTEGER DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for room-based access)
CREATE POLICY "Enable all access" ON rooms FOR ALL USING (true);
CREATE POLICY "Enable all access" ON room_players FOR ALL USING (true);
CREATE POLICY "Enable read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update own profile" ON profiles FOR UPDATE USING (true);
CREATE POLICY "Enable all access" ON tournaments FOR ALL USING (true);
CREATE POLICY "Enable all access" ON tournament_matches FOR ALL USING (true);
CREATE POLICY "Enable read history" ON match_history FOR SELECT USING (true);
CREATE POLICY "Enable insert history" ON match_history FOR INSERT WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE tournaments;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_players_room ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles(nickname);
CREATE INDEX IF NOT EXISTS idx_tournaments_code ON tournaments(code);
CREATE INDEX IF NOT EXISTS idx_match_history_played ON match_history(played_at DESC);
