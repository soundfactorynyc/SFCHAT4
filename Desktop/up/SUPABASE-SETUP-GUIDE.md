# Sound Factory Supabase Setup Guide

## 🚀 Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Choose your organization
5. Enter project name: `sound-factory`
6. Set a strong database password
7. Choose region closest to your users
8. Click "Create new project"

### 2. Get Your Credentials
1. Go to **Settings** → **API**
2. Copy your **Project URL** (looks like: `https://xyz.supabase.co`)
3. Copy your **anon public** key (starts with `eyJ...`)
4. Copy your **service_role** key (starts with `eyJ...`)

### 3. Update Configuration
Edit `index.html` and replace these values:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://YOUR-PROJECT-ID.supabase.co', // Your actual URL
    anonKey: 'eyJ...' // Your actual anon key
};
```

### 4. Create Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Create pins table
CREATE TABLE pins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    x_position INTEGER NOT NULL,
    y_position INTEGER NOT NULL,
    message TEXT,
    color TEXT DEFAULT '#ff6b00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE pins ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for now)
CREATE POLICY "Allow all users to read pins" ON pins FOR SELECT USING (true);
CREATE POLICY "Allow all users to insert pins" ON pins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all users to update pins" ON pins FOR UPDATE USING (true);
CREATE POLICY "Allow all users to delete pins" ON pins FOR DELETE USING (true);

-- Create purchases table (for Stripe integration)
CREATE TABLE purchases (
    id TEXT PRIMARY KEY,
    amount_total INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    customer_email TEXT,
    customer_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for purchases
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Allow all operations on purchases (for webhook)
CREATE POLICY "Allow all operations on purchases" ON purchases FOR ALL USING (true);
```

### 5. Test the Connection

Open your browser console and check for:
- ✅ "Supabase client initialized"
- No error messages

### 6. Test Pin Dropping

1. Go to your site
2. Switch to "Drop Pin" mode
3. Click anywhere on the floor
4. Check console for pin creation logs
5. Check Supabase dashboard → Table Editor → pins

## 🔧 Environment Variables

For production deployment, set these environment variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🐛 Troubleshooting

### Common Issues:

1. **"Supabase initialization failed"**
   - Check your URL and keys are correct
   - Ensure Supabase project is active

2. **"Failed to fetch" errors**
   - Check CORS settings in Supabase
   - Go to Settings → API → CORS
   - Add your domain to allowed origins

3. **"Row Level Security" errors**
   - Check your RLS policies
   - Temporarily disable RLS for testing

4. **Pins not saving**
   - Check browser console for errors
   - Verify table exists in Supabase
   - Check RLS policies allow inserts

## 📊 Monitoring

### Check Database:
1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Select **pins** table
4. View real-time data

### Check Logs:
1. Go to **Logs** in Supabase dashboard
2. Filter by **API** or **Database**
3. Look for errors or successful operations

## 🚀 Production Checklist

- [ ] Supabase project created
- [ ] Database tables created
- [ ] RLS policies configured
- [ ] CORS settings updated
- [ ] Environment variables set
- [ ] Pin dropping tested
- [ ] Real-time subscriptions working
- [ ] Error handling implemented

## 📱 Mobile Testing

Test on mobile devices:
1. Open site on phone
2. Test pin dropping
3. Check real-time updates
4. Verify touch events work

## 🔒 Security Notes

- Never expose service_role key in frontend
- Use anon key for client-side operations
- Implement proper RLS policies for production
- Consider rate limiting for pin creation


