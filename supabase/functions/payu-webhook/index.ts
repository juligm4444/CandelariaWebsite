import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const payload = (await req.json().catch(() => null)) as Record<string, string> | null;
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
  }

  const txRef = String(payload.reference_sale ?? payload.referenceCode ?? '').trim();
  const state = String(payload.state_pol ?? payload.state ?? '').toLowerCase();

  if (!txRef) {
    return new Response(JSON.stringify({ error: 'Missing transaction reference' }), {
      status: 400,
    });
  }

  let status = 'pending';
  if (state === '4' || state === 'approved' || state === 'succeeded') status = 'succeeded';
  if (state === '6' || state === 'declined' || state === 'failed') status = 'failed';
  if (state === '5' || state === 'canceled') status = 'canceled';

  const { error } = await supabase
    .from('payments')
    .update({ status })
    .eq('payu_transaction_id', txRef);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(
    JSON.stringify({ status: 'ok', transaction: txRef, payment_status: status }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});
