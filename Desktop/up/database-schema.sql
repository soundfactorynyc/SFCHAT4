-- SOUND FACTORY USER SYSTEM DATABASE SCHEMA
-- For Supabase, PostgreSQL, or any SQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_pic_url TEXT,
    pin_hash VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    vip_status BOOLEAN DEFAULT FALSE,
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    energy_level INTEGER DEFAULT 1 CHECK (energy_level >= 1 AND energy_level <= 10),
    chaos_level INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stripe_customer_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- User preferences
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    favorite_personality VARCHAR(50),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    public_profile BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    dark_mode BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User stats
CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    messages_sent INTEGER DEFAULT 0,
    effects_triggered INTEGER DEFAULT 0,
    demon_summons INTEGER DEFAULT 0,
    payments_made INTEGER DEFAULT 0,
    tickets_purchased INTEGER DEFAULT 0,
    events_attended INTEGER DEFAULT 0,
    highest_energy_reached INTEGER DEFAULT 1,
    total_time_active INTEGER DEFAULT 0, -- in minutes
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_emoji VARCHAR(10),
    points INTEGER DEFAULT 10,
    rarity VARCHAR(20) DEFAULT 'COMMON' CHECK (rarity IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements (many-to-many)
CREATE TABLE user_achievements (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue VARCHAR(255) DEFAULT 'Sound Factory',
    capacity INTEGER,
    tickets_sold INTEGER DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    vip_price DECIMAL(10, 2),
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    ticket_code VARCHAR(20) UNIQUE NOT NULL,
    ticket_type VARCHAR(20) DEFAULT 'GENERAL' CHECK (ticket_type IN ('GENERAL', 'VIP', 'BACKSTAGE', 'TABLE')),
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    price DECIMAL(10, 2) NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    qr_code_url TEXT,
    stripe_payment_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- QR scan history
CREATE TABLE qr_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scanner_id VARCHAR(100),
    location VARCHAR(100),
    valid BOOLEAN DEFAULT TRUE
);

-- SMS messages history
CREATE TABLE sms_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    message_sent TEXT,
    message_received TEXT,
    personality_mode VARCHAR(50),
    energy_level INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment effects history
CREATE TABLE payment_effects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    effect_type VARCHAR(50) NOT NULL,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_seconds INTEGER,
    stripe_payment_id VARCHAR(255)
);

-- User sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

-- Leaderboards (materialized view for performance)
CREATE MATERIALIZED VIEW leaderboard AS
SELECT 
    u.id,
    u.username,
    u.profile_pic_url,
    u.verified,
    u.vip_status,
    u.total_spent,
    u.chaos_level,
    u.energy_level,
    us.effects_triggered,
    us.messages_sent,
    COUNT(DISTINCT ua.achievement_id) as achievement_count,
    RANK() OVER (ORDER BY u.chaos_level DESC) as chaos_rank,
    RANK() OVER (ORDER BY u.total_spent DESC) as spending_rank,
    RANK() OVER (ORDER BY us.effects_triggered DESC) as effects_rank
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
WHERE u.verified = TRUE
GROUP BY u.id, u.username, u.profile_pic_url, u.verified, u.vip_status, 
         u.total_spent, u.chaos_level, u.energy_level, us.effects_triggered, us.messages_sent;

-- Create indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_code ON tickets(ticket_code);
CREATE INDEX idx_sms_history_user_id ON sms_history(user_id);
CREATE INDEX idx_payment_effects_user_id ON payment_effects(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- Functions and triggers

-- Auto-update last_active
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET last_active = NOW() 
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_active
AFTER INSERT ON sms_history
FOR EACH ROW
EXECUTE FUNCTION update_last_active();

-- Auto-update total_spent
CREATE OR REPLACE FUNCTION update_total_spent()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET total_spent = total_spent + NEW.price 
    WHERE id = NEW.user_id;
    
    -- Check for VIP status upgrade
    UPDATE users 
    SET vip_status = TRUE 
    WHERE id = NEW.user_id 
    AND total_spent >= 500 
    AND vip_status = FALSE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_total_spent
AFTER INSERT ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_total_spent();

-- Auto-generate ticket code
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ticket_code := 'SF' || TO_CHAR(NOW(), 'YYMM') || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_ticket_code
BEFORE INSERT ON tickets
FOR EACH ROW
WHEN (NEW.ticket_code IS NULL)
EXECUTE FUNCTION generate_ticket_code();

-- Row Level Security (for Supabase)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_effects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own tickets" ON tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON sms_history
    FOR SELECT USING (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO achievements (name, description, icon_emoji, points, rarity) VALUES
('FIRST_STEPS', 'Send your first message', '👶', 10, 'COMMON'),
('VERIFIED', 'Verify your account with PIN', '✅', 20, 'COMMON'),
('VIP', 'Achieve VIP status', '👑', 100, 'EPIC'),
('CHAOS_MASTER', 'Reach Chaos Level 100', '💀', 200, 'LEGENDARY'),
('BIG_SPENDER', 'Spend over $1000', '💰', 150, 'EPIC'),
('ENERGY_OVERLOAD', 'Reach Energy Level 10', '⚡', 50, 'RARE'),
('DEMON_SUMMONER', 'Summon 50 demons', '😈', 75, 'RARE'),
('EFFECT_WIZARD', 'Trigger 100 effects', '🎆', 60, 'RARE'),
('LOYAL_RAVER', 'Attend 10 events', '🎫', 80, 'RARE'),
('MIDNIGHT_WARRIOR', 'Active between 2-5 AM', '🌙', 30, 'COMMON'),
('SOCIAL_BUTTERFLY', '100 messages sent', '🦋', 40, 'COMMON'),
('REALITY_BREAKER', 'Use Reality Glitch effect', '🌀', 90, 'EPIC');
