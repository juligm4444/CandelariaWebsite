import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const PAYU_API_LOGIN = Deno.env.get('PAYU_API_LOGIN') ?? '';
const PAYU_API_KEY = Deno.env.get('PAYU_API_KEY') ?? '';
const PAYU_MERCHANT_ID = Deno.env.get('PAYU_MERCHANT_ID') ?? '';
const PAYU_ACCOUNT_ID = Deno.env.get('PAYU_ACCOUNT_ID') ?? '';
const PAYU_BASE_URL =
  Deno.env.get('PAYU_BASE_URL') ?? 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.replace('Bearer ', '').trim();
  if (!jwt) {
    return new Response(JSON.stringify({ error: 'Missing bearer token' }), { status: 401 });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(jwt);
  if (authError || !authData?.user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    amount?: number;
    currency?: string;
    type?: 'donation' | 'subscription' | 'product';
    description?: string;
  } | null;

  if (!body?.amount || body.amount <= 0 || !body.type) {
    return new Response(JSON.stringify({ error: 'Invalid payment payload' }), { status: 400 });
  }

  const referenceCode = crypto.randomUUID();
  const amount = Number(body.amount);
  const currency = (body.currency ?? 'COP').toUpperCase();

  const { data: paymentRow, error: paymentInsertError } = await supabase
    .from('payments')
    .insert({
      user_id: authData.user.id,
      amount,
      currency,
      type: body.type,
      status: 'pending',
      payu_transaction_id: referenceCode,
    })
    .select('id')
    .single();

  if (paymentInsertError) {
    return new Response(JSON.stringify({ error: paymentInsertError.message }), { status: 500 });
  }

  const payuPayload = {
    language: 'es',
    command: 'SUBMIT_TRANSACTION',
    merchant: {
      apiLogin: PAYU_API_LOGIN,
      apiKey: PAYU_API_KEY,
    },
    transaction: {
      order: {
        accountId: PAYU_ACCOUNT_ID,
        referenceCode,
        description: body.description ?? `Candelaria ${body.type}`,
        language: 'es',
        signature: '',
        notifyUrl: '',
        additionalValues: {
          TX_VALUE: {
            value: amount,
            currency,
          },
        },
        buyer: {
          emailAddress: authData.user.email,
        },
      },
      type: 'AUTHORIZATION_AND_CAPTURE',
      paymentMethod: 'VISA',
      paymentCountry: 'CO',
      ipAddress: '127.0.0.1',
      userAgent: 'CandelariaWeb',
    },
    test: true,
  };

  const payuResponse = await fetch(PAYU_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payuPayload),
  });

  const payuJson = await payuResponse.json().catch(() => ({}));

  return new Response(
    JSON.stringify({
      payment_id: paymentRow.id,
      reference_code: referenceCode,
      payu_response: payuJson,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});
