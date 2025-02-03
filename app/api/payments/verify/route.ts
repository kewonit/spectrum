import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { SupabaseClient } from '@supabase/supabase-js';

interface VerificationResult {
  orderData: {
    order_status: string;
    order_id: string;
    [key: string]: any;
  };
  paymentData: {
    payment_method?: { type: string };
    cf_payment_id: string;
    bank_reference: string;
    payment_completion_time: string;
    [key: string]: any;
  } | null;
}

async function verifyPaymentStatus(orderId: string): Promise<VerificationResult> {
  const response = await fetch(
    `https://sandbox.cashfree.com/pg/orders/${orderId}`,
    {
      headers: {
        "x-client-id": process.env.CASHFREE_APP_ID!,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
        "x-api-version": "2023-08-01"
      }
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch order status");
  }

  const orderData = await response.json();
  
  // Get payment details if order is paid
  if (orderData.order_status === 'PAID') {
    const paymentsResponse = await fetch(
      `https://sandbox.cashfree.com/pg/orders/${orderId}/payments`,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID!,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
          "x-api-version": "2023-08-01"
        }
      }
    );

    if (!paymentsResponse.ok) {
      throw new Error("Failed to fetch payment details");
    }

    const payments = await paymentsResponse.json();
    return { orderData, paymentData: payments[0] };
  }

  return { orderData, paymentData: null };
}

async function updatePaymentRecord(supabase: SupabaseClient, payment: any, orderData: any) {
  const paymentUpdateData = {
    status: orderData.order_status === 'PAID' ? 'success' : 'failed',
    payment_method: payment?.payment_group,
    transaction_id: payment?.cf_payment_id,
    bank_reference: payment?.bank_reference,
    cf_payment_id: payment?.cf_payment_id,
    payment_time: payment?.payment_time,
    metadata: {
      payment_details: payment,
      order_details: orderData
    },
    error_details: payment?.error_details,
    payment_gateway_details: payment?.payment_gateway_details,
    updated_at: new Date().toISOString()
  };

}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('order_id');
  
  if (!orderId) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }

  // Add request validation
  if (!orderId.match(/^ORD_\d+_[a-z0-9]+$/)) {
    throw new Error("Invalid order ID format");
  }

  const supabase = await createClient();

  try {
    // Check if payment is already verified by webhook
    const { data: existingPayment, error: initialFetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (initialFetchError) throw initialFetchError;

    if (existingPayment.status === 'success') {
      return NextResponse.json({
        success: true,
        orderId,
        status: 'success',
        message: "Payment already verified"
      });
    }

    // Verify payment status with retries
    let attempts = 0;
    let paymentVerified = false;
    let verificationResult: VerificationResult | undefined;

    while (attempts < 3 && !paymentVerified) {
      verificationResult = await verifyPaymentStatus(orderId);
      
      if (verificationResult?.orderData.order_status === 'PAID') {
        paymentVerified = true;
      } else if (verificationResult?.orderData.order_status === 'FAILED') {
        break;
      } else {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }
    }

    if (!verificationResult) {
      throw new Error("Failed to verify payment status");
    }

    const { orderData, paymentData } = verificationResult;

    // Map payment status
    const statusMap: Record<string, string> = {
      'PAID': 'success',
      'FAILED': 'failed',
      'PENDING': 'pending',
      'ACTIVE': 'pending',
      'EXPIRED': 'failed'
    };

    const mappedStatus = statusMap[orderData.order_status] || 'pending';

    // Log verification attempt
    await supabase
      .from('payment_logs')
      .insert({
        payment_id: existingPayment.id,
        order_id: orderId,
        event_type: 'verification',
        payload: {
          order: orderData,
          payment: paymentData,
          attempts,
          timestamp: new Date().toISOString()
        }
      });

    // Enhanced logging
    await supabase.from('payment_logs').insert({
      payment_id: existingPayment.id,
      order_id: orderId,
      event_type: 'verification_complete',
      payload: {
        final_status: mappedStatus,
        verification_time: new Date().toISOString(),
        payment_details: paymentData
      }
    });

    // Update payment record
    const paymentUpdateData = {
      status: mappedStatus,
      metadata: {
        order: orderData,
        payment: paymentData
      }
    };

    // Add payment details if available
    if (paymentData) {
      Object.assign(paymentUpdateData, {
        payment_method: paymentData.payment_method?.type,
        transaction_id: paymentData.cf_payment_id,
        bank_reference: paymentData.bank_reference,
        cf_payment_id: paymentData.cf_payment_id,
        payment_time: paymentData.payment_completion_time
      });
    }

    const { error: updateError } = await supabase
      .from('payments')
      .update(paymentUpdateData)
      .eq('order_id', orderId);

    if (updateError) throw updateError;

    // Handle successful payment
    if (mappedStatus === 'success') {
      let registrationId = existingPayment.registration_id;
      
      if (!registrationId) {
        // Create new registration
        const { data: registration, error: regError } = await supabase
          .from('registrations')
          .insert({
            event_id: existingPayment.event_id,
            team_id: existingPayment.team_id,
            individual_id: existingPayment.team_id ? null : existingPayment.user_id,
            registration_status: 'confirmed',
            payment_status: 'success'
          })
          .select()
          .single();

        if (regError) throw regError;
        registrationId = registration.id;

        // Update payment with registration_id
        await supabase
          .from('payments')
          .update({ registration_id: registrationId })
          .eq('id', existingPayment.id);
      } else {
        // Update existing registration
        await supabase
          .from('registrations')
          .update({
            registration_status: 'confirmed',
            payment_status: 'success'
          })
          .eq('id', registrationId);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: orderData.order_id,
      status: mappedStatus,
      paymentId: paymentData?.cf_payment_id,
      verified: paymentVerified,
      attempts,
      message: paymentVerified 
        ? "Payment verification successful" 
        : "Payment pending or failed"
    });

  } catch (error: any) {
    console.error("Payment verification error:", error);
    
    // Log error
    if (orderId) {
      await supabase
        .from('payment_logs')
        .insert({
          order_id: orderId,
          event_type: 'error',
          payload: {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          }
        });
    }

    return NextResponse.json(
      { error: "Failed to verify payment", details: error.message },
      { status: 500 }
    );
  }
}
