import { createClient } from "@/app/utils/supabase/super-server";
import { NextResponse } from "next/server";
import { CashfreeWebhookPayload, PaymentGroup } from "@/app/types/payments";
import { SupabaseClient } from '@supabase/supabase-js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

interface PaymentUpdateData {
  status: string;
  payment_method: PaymentGroup;
  transaction_id: string;
  bank_reference: string;
  cf_payment_id: string;
  payment_time: string;
  metadata: {
    webhook_event: CashfreeWebhookPayload;
    payment_details: {
      message: string;
      method: CashfreeWebhookPayload['data']['payment']['payment_method'];
      group: PaymentGroup;
    };
  };
  updated_at: string;
  error_details?: CashfreeWebhookPayload['data']['error_details'];
  payment_gateway_details?: CashfreeWebhookPayload['data']['payment_gateway_details'];
}

async function processWebhook(supabase: SupabaseClient, payload: CashfreeWebhookPayload) {
  if (!payload?.data?.order?.order_id || !payload?.data?.payment) {
    console.error('Invalid payload structure:', JSON.stringify(payload, null, 2));
    throw new Error('Invalid webhook payload structure');
  }

  const { order, payment, error_details, payment_gateway_details, customer_details } = payload.data;
  const { type: webhookType, event_time } = payload;

  // Map webhook status to payment status
  const statusMap: Record<string, string> = {
    'PAYMENT_SUCCESS_WEBHOOK': 'success',
    'PAYMENT_FAILED_WEBHOOK': 'failed',
    'PAYMENT_USER_DROPPED_WEBHOOK': 'failed',
    'PAYMENT_CANCELLED_WEBHOOK': 'failed'
  };

  const status = statusMap[webhookType] || 'failed';

  // First check if payment record exists
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id, registration_id, status')
    .eq('order_id', order.order_id)
    .maybeSingle();

  // Create metadata
  const metadata = {
    payment_status: payment.payment_status,
    payment_message: payment.payment_message,
    webhook_type: webhookType,
    event_time,
    payment_details: {
      cf_payment_id: payment.cf_payment_id,
      payment_time: payment.payment_time,
      payment_group: payment.payment_group,
      payment_method: payment.payment_method,
      auth_id: payment.auth_id,
      bank_reference: payment.bank_reference
    },
    customer_info: customer_details,
    gateway_info: payment_gateway_details,
    error_info: {
      ...error_details,
      webhook_error: webhookType.includes('FAILED') || webhookType.includes('DROPPED')
    },
    transaction_details: {
      amount: payment.payment_amount,
      currency: payment.payment_currency,
      status: payment.payment_status,
      order_id: order.order_id
    },
    raw_webhook: payload,
    last_updated: new Date().toISOString()
  };

  let updatedPayment;

  if (existingPayment) {
    // Update existing payment
    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({
        status,
        payment_method: payload.data.payment.payment_group,
        transaction_id: payload.data.payment.cf_payment_id.toString(),
        bank_reference: payload.data.payment.bank_reference || null,
        cf_payment_id: payload.data.payment.cf_payment_id.toString(),
        cf_order_id: payment_gateway_details?.gateway_order_id || null,
        payment_time: new Date(payload.data.payment.payment_time).toISOString(),
        metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingPayment.id)
      .select()
      .single();

    if (updateError) throw updateError;
    updatedPayment = payment;
  }

  // Now log the webhook after payment record exists or has been updated
  await supabase
    .from('payment_logs')
    .insert({
      payment_id: updatedPayment?.id,
      order_id: order.order_id,
      event_type: webhookType,
      payload: {
        webhook: payload,
        processed_at: new Date().toISOString(),
        status_change: existingPayment ? {
          from: existingPayment.status,
          to: status
        } : undefined
      }
    });

  // Update registration if payment was successful
  if (status === 'success' && updatedPayment?.registration_id) {
    await supabase
      .from('registrations')
      .update({
        registration_status: 'confirmed',
        payment_status: 'success',
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedPayment.registration_id);
  }

  return {
    success: true,
    status,
    orderId: order.order_id,
    paymentId: updatedPayment?.id,
    registrationId: updatedPayment?.registration_id
  };
}

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  console.log('Received webhook request');
  const supabase = await createClient();
  let retries = 0;
  let lastError: Error | null = null;

  // Temporarily comment out signature validation for testing
  // const signature = request.headers.get('x-cashfree-signature');
  // if (!signature) {
  //   return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  // }

  try {
    const rawBody = await request.text();
    console.log('Raw webhook body:', rawBody);
    
    const payload = JSON.parse(rawBody) as CashfreeWebhookPayload;
    console.log('Parsed webhook payload:', JSON.stringify(payload, null, 2));

    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-cashfree-signature',
    };

    // Log raw webhook immediately (without status)
    await supabase
      .from('payment_logs')
      .insert({
        order_id: payload.data.order.order_id,
        event_type: 'WEBHOOK_RECEIVED',
        payload: {
          raw_webhook: payload,
          received_at: new Date().toISOString()
        }
      });

    // Process with retries
    while (retries < MAX_RETRIES) {
      try {
        const result = await processWebhook(supabase, payload);
        return NextResponse.json({ 
          ...result,
          redirectUrl: '/dashboard/events/registrations'
        }, { headers });
      } catch (error: any) {
        lastError = error;
        retries++;
        if (retries < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }

    throw lastError;
  } catch (error: any) {
    console.error("Webhook error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Log error (without status)
    await supabase
      .from('payment_logs')
      .insert({
        event_type: 'webhook_error',
        payload: {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }
      });

    // Return 200 with CORS headers
    return NextResponse.json({ 
      success: false,
      error: "Webhook processing failed"
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-cashfree-signature',
      }
    });
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-cashfree-signature',
    },
  });
}