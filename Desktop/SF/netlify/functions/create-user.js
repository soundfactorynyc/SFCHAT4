const { createClient } = require('@supabase/supabase-js');

function normalizePhone(input, fallback = '+1') {
  if (!input) return null;
  let p = String(input).trim().replace(/[^\d+]/g, '');
  const cc = process.env.DEFAULT_COUNTRY_CODE || fallback;
  if (p.startsWith('+')) return p;
  if (p.length === 11 && p.startsWith('1')) return '+' + p;
  if (p.length === 10) return cc + p;
  return null;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { phone, displayName } = JSON.parse(event.body || '{}');
    const normalized = normalizePhone(phone);
    if (!normalized) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Phone number required' }) };

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    // Admin numbers injected by installer (already normalized)
    const ADMIN_PHONES = ['+19082550185'];
    const isAdmin = ADMIN_PHONES.includes(normalized);

    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('phone', normalized)
      .single();

    let userData;

    if (existing) {
      const { data, error } = await supabase
        .from('users')
        .update({
          is_admin: isAdmin,
          name: displayName || existing.name,
          last_login: new Date().toISOString()
        })
        .eq('phone', normalized)
        .select()
        .single();
      if (error) throw error;
      userData = data;
    } else {
      const { data, error } = await supabase
        .from('users')
        .insert({
          phone: normalized,
          is_admin: isAdmin,
          is_promoter: false,
          name: displayName || `User ${normalized.slice(-4)}`,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      userData = data;
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, user: userData, isAdmin: userData.is_admin || false }) };
  } catch (error) {
    console.error('Create user error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to create/update user', details: error.message }) };
  }
};
