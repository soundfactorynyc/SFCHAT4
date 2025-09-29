// Sound Factory Supabase Configuration
// This file contains the Supabase client configuration for the frontend

export const SUPABASE_CONFIG = {
    // Replace these with your actual Supabase project values
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key-here'
};

// Supabase client initialization
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Database schema for pins table
export const PINS_TABLE_SCHEMA = `
CREATE TABLE IF NOT EXISTS pins (
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

-- Create policies
CREATE POLICY "Allow all users to read pins" ON pins FOR SELECT USING (true);
CREATE POLICY "Allow all users to insert pins" ON pins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update their own pins" ON pins FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Allow users to delete their own pins" ON pins FOR DELETE USING (auth.uid()::text = user_id);
`;

// Pin operations
export const pinOperations = {
    // Insert a new pin
    async insertPin(pinData) {
        try {
            const { data, error } = await supabase
                .from('pins')
                .insert([pinData])
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error inserting pin:', error);
            return { success: false, error };
        }
    },

    // Get all pins
    async getAllPins() {
        try {
            const { data, error } = await supabase
                .from('pins')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching pins:', error);
            return { success: false, error };
        }
    },

    // Delete a pin
    async deletePin(pinId, userId) {
        try {
            const { error } = await supabase
                .from('pins')
                .delete()
                .eq('id', pinId)
                .eq('user_id', userId);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting pin:', error);
            return { success: false, error };
        }
    }
};


