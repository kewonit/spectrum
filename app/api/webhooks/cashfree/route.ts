import { createClient } from "@/app/utils/supabase/server";
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
  const { order, payment } = payload.data;

  // Validate webhook signature here if Cashfree provides it

  // Verify if order exists and prevent duplicate processing
  const { data: paymentRecord } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', order.order_id)
    .single();

  if (!paymentRecord) {
    throw new Error(`Payment not found for order ${order.order_id}`);
  }

  // Prevent duplicate webhook processing
  if (paymentRecord.status === 'success' && payment.payment_status === 'SUCCESS') {
    return { success: true, status: 'already_processed' };
  }

  // Map payment method details
  const paymentMethodDetails = {
    payment_group: payment.payment_group,
    payment_method: payment.payment_method
  };

  // 1. Log webhook event
  const { error: logError } = await supabase
    .from('payment_logs')
    .insert({
      event_type: payload.type,
      order_id: order.order_id,
      payload
    });

  if (logError) {
    console.error("Failed to log webhook:", logError);
  }

  // 3. Map Cashfree status to our status
  const statusMap: Record<string, string> = {
    'SUCCESS': 'success',
    'FAILED': 'failed',
    'USER_DROPPED': 'failed'
  };

  const mappedStatus = statusMap[payment.payment_status] || 'pending';

  // 4. Build payment update data
  const paymentUpdateData: PaymentUpdateData = {
    status: mappedStatus,
    payment_method: payment.payment_group,
    transaction_id: payment.cf_payment_id,
    bank_reference: payment.bank_reference,
    cf_payment_id: payment.cf_payment_id,
    payment_time: new Date(payment.payment_time).toISOString(),
    metadata: {
      webhook_event: payload,
      payment_details: {
        message: payment.payment_message,
        method: payment.payment_method,
        group: payment.payment_group
      }
    },
    updated_at: new Date().toISOString()
  };

  // Enhanced error details logging
  if (payload.data.error_details) {
    paymentUpdateData.error_details = payload.data.error_details;
  }

  // Add gateway details if available
  if (payload.data.payment_gateway_details) {
    paymentUpdateData.payment_gateway_details = payload.data.payment_gateway_details;
  }

  // 5. Update payment record
  const { error: updateError } = await supabase
    .from('payments')
    .update(paymentUpdateData)
    .eq('id', paymentRecord.id)
    .eq('order_id', order.order_id); // Double check order_id for safety

  if (updateError) {
    throw new Error(`Failed to update payment: ${updateError.message}`);
  }

  // 6. Handle successful payment
  if (mappedStatus === 'success' && !paymentRecord.registration_id) {
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        event_id: paymentRecord.event_id,
        team_id: paymentRecord.team_id,
        individual_id: paymentRecord.team_id ? null : paymentRecord.user_id,
        registration_status: 'confirmed',
        payment_status: 'success'
      })
      .select()
      .single();

    if (regError) {
      throw new Error(`Failed to create registration: ${regError.message}`);
    }

    // Update payment with registration_id
    await supabase
      .from('payments')
      .update({ 
        registration_id: registration.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentRecord.id);
  }

  // 7. Log success
  await supabase
    .from('payment_logs')
    .insert({
      payment_id: paymentRecord.id,
      order_id: order.order_id,
      event_type: 'webhook_processed',
      payload: {
        status: mappedStatus,
        payment_id: payment.cf_payment_id,
        timestamp: new Date().toISOString()
      }
    });

  return { 
    success: true,
    status: mappedStatus,
    order_id: order.order_id 
  };
}

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = await createClient();
  let retries = 0;
  let lastError: Error | null = null;

  // Temporarily comment out signature validation for testing
  // const signature = request.headers.get('x-cashfree-signature');
  // if (!signature) {
  //   return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  // }

  try {
    const payload = await request.json() as CashfreeWebhookPayload;

    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-cashfree-signature',
    };

    // Process with retries
    while (retries < MAX_RETRIES) {
      try {
        const result = await processWebhook(supabase, payload);
        return NextResponse.json(result, { headers });
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
    console.error("Webhook error:", error);

    // Log error but don't expose internal details
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
