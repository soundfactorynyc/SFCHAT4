// Netlify Function: Retry Pending Commissions
// Scheduled or manual secured invocation to process pending_commissions queue.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const authHeader = event.headers.authorization;
  const expected = process.env.RETRY_JOB_SECRET;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const { data: pending, error: fetchError } = await supabase
      .from('pending_commissions')
      .select(`*, promoters:promoters(code, id, stripe_account_id, stripe_connected, commission_rate)`) // explicit alias join not needed but clarity
      .eq('status', 'pending')
      .lt('retry_count', 5)
      .or('next_retry_at.is.null,next_retry_at.lte.now()')
      .order('created_at', { ascending: true })
      .limit(15);

    if (fetchError) throw new Error(fetchError.message);

    const summary = { total: pending.length, processed: 0, failed: 0, skipped: 0 };

    for (const row of pending) {
      const promoter = row.promoters; // joined promoter row
      if (!promoter || !promoter.stripe_connected || !promoter.stripe_account_id) {
        summary.skipped++;
        continue;
      }

      const saleAmount = row.sale_amount; // already decimal dollars
      const commissionAmount = row.commission_amount ?? (saleAmount * promoter.commission_rate);
      const commissionAmountCents = Math.floor(commissionAmount * 100);

      try {
        const transfer = await stripe.transfers.create({
            amount: commissionAmountCents,
            currency: 'usd',
            destination: promoter.stripe_account_id,
            transfer_group: `RETRY_${row.booking_id}`,
            description: `Retry commission for booking ${row.booking_id}`,
            metadata: {
              booking_id: row.booking_id,
              promoter_code: row.promoter_code,
              retry_count: row.retry_count + 1
            }
        });

        // Insert into commissions
        await supabase.from('commissions').insert({
          promoter_id: promoter.id,
            booking_id: row.booking_id,
            sale_amount: saleAmount,
            commission_rate: promoter.commission_rate,
            commission_amount: commissionAmount,
            stripe_transfer_id: transfer.id,
            status: 'paid',
            paid_at: new Date().toISOString()
        });

        // Mark pending commission processed
        await supabase
          .from('pending_commissions')
          .update({ status: 'processed', processed_at: new Date().toISOString() })
          .eq('id', row.id);

        // Update stats
        await supabase.rpc('increment_promoter_stats', {
          p_promoter_id: promoter.id,
          p_sales_amount: saleAmount,
          p_commission_amount: commissionAmount
        });

        summary.processed++;
      } catch (err) {
        console.error('Commission retry failure:', row.id, err.message);
        const backoffHours = Math.pow(2, row.retry_count + 1); // exponential backoff
        const nextRetryAt = new Date(Date.now() + backoffHours * 3600 * 1000).toISOString();
        await supabase
          .from('pending_commissions')
          .update({
            retry_count: row.retry_count + 1,
            next_retry_at: nextRetryAt,
            error: err.message
          })
          .eq('id', row.id);
        summary.failed++;
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, summary, at: new Date().toISOString() })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
