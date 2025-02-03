interface CustomerDetails {
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
}

interface PaymentSessionRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerDetails: CustomerDetails;
}

interface CashfreeResponse {
  payment_session_id?: string; // Made optional
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code: string;
    type: string;
  };
  status: number;
  duplicate?: boolean;
}

interface CashfreeWebhookPayload {
  data: {
    order: {
      order_id: string;
      order_amount: number;
      order_currency: string;
      order_tags: any;
    };
    payment: {
      cf_payment_id: number;
      payment_status: string;
      payment_amount: number;
      payment_currency: string;
      payment_message: string;
      payment_time: string;
      bank_reference: string;
      auth_id: string | null;
      payment_method: {
        [key: string]: {
          channel: string | null;
          upi_id?: string;
        };
      };
      payment_group: string;
    };
    customer_details: CustomerDetails;
    error_details: {
      error_code: string | null;
      error_description: string | null;
      error_reason: string | null;
      error_source: string | null;
      error_code_raw: string | null;
      error_description_raw: string | null;
    };
    payment_gateway_details: {
      gateway_name: string;
      gateway_order_id: string | null;
      gateway_payment_id: string | null;
      gateway_status_code: string | null;
      gateway_order_reference_id: string | null;
    };
  };
  event_time: string;
  type: string;
}

export class Cashfree {
  private appId: string;
  private secretKey: string;
  private baseUrl: string;
  private readonly timeout = 30000; // 30 seconds
  private readonly maxRetries = 3;
  private readonly rateLimitDelay = 100; // ms between requests

  private lastRequestTime: number = 0;
  private pendingOrders: Map<string, { timestamp: number, attempts: number }> = new Map();
  private readonly ORDER_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_ATTEMPTS = 3;

  constructor(appId: string, secretKey: string) {
    if (!appId || !secretKey) {
      throw new Error('Cashfree credentials are missing');
    }
    this.appId = appId;
    this.secretKey = secretKey;
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';
  }

  private async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private validatePaymentInput(params: PaymentSessionRequest): void {
    if (!params.orderId || typeof params.orderId !== 'string') {
      throw new Error('Invalid orderId');
    }
    if (!params.amount || typeof params.amount !== 'number' || params.amount <= 0) {
      throw new Error('Invalid amount');
    }
    if (!params.currency || typeof params.currency !== 'string') {
      throw new Error('Invalid currency');
    }
    if (!params.customerDetails?.customerEmail?.includes('@')) {
      throw new Error('Invalid customer email');
    }
  }

  private async makeRequest(url: string, options: RequestInit, attempt = 1): Promise<Response> {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await this.wait(this.rateLimitDelay - timeSinceLastRequest);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      this.lastRequestTime = Date.now();
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      if (!response.ok && attempt < this.maxRetries) {
        const backoff = Math.min(1000 * Math.pow(2, attempt), 5000);
        await this.wait(backoff);
        return this.makeRequest(url, options, attempt + 1);
      }

      return response;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      if (attempt < this.maxRetries) {
        const backoff = Math.min(1000 * Math.pow(2, attempt), 5000);
        await this.wait(backoff);
        return this.makeRequest(url, options, attempt + 1);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private isPendingOrder(orderId: string): boolean {
    const orderData = this.pendingOrders.get(orderId);
    if (!orderData) return false;

    // Check if the order is expired
    if (Date.now() - orderData.timestamp > this.ORDER_EXPIRY_TIME) {
      this.pendingOrders.delete(orderId);
      return false;
    }

    // Check if max attempts reached
    if (orderData.attempts >= this.MAX_ATTEMPTS) {
      this.pendingOrders.delete(orderId);
      return false;
    }

    return true;
  }

  private trackOrder(orderId: string): boolean {
    if (this.isPendingOrder(orderId)) {
      const orderData = this.pendingOrders.get(orderId)!;
      orderData.attempts++;
      return false;
    }

    this.pendingOrders.set(orderId, {
      timestamp: Date.now(),
      attempts: 1
    });
    return true;
  }

  async createPaymentSession(params: PaymentSessionRequest): Promise<CashfreeResponse> {
    try {
      this.validatePaymentInput(params);

      // Check for duplicate/pending order
      if (!this.trackOrder(params.orderId)) {
        console.warn('Duplicate payment attempt detected:', {
          orderId: params.orderId,
          timestamp: new Date().toISOString()
        });
        
        return {
          success: false,
          error: {
            message: 'A payment attempt is already in progress',
            code: 'DUPLICATE_ORDER',
            type: 'VALIDATION_ERROR'
          },
          status: 409,
          payment_session_id: undefined,
          duplicate: true
        };
      }

      console.log('Creating payment session with Cashfree:', {
        baseUrl: this.baseUrl,
        orderId: params.orderId,
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      });

      const response = await this.makeRequest(
        `${this.baseUrl}/orders`,
        {
          method: 'POST',
          headers: {
            'x-api-version': '2022-09-01',
            'x-client-id': this.appId,
            'x-client-secret': this.secretKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: params.orderId,
            order_amount: params.amount,
            order_currency: params.currency,
            customer_details: {
              customer_id: params.customerDetails.customerId,
              customer_email: params.customerDetails.customerEmail,
              customer_phone: params.customerDetails.customerPhone,
              customer_name: params.customerDetails.customerName,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Cashfree API error:', {
          status: response.status,
          error: data,
          timestamp: new Date().toISOString()
        });
        // Remove from pending orders if request fails
        this.pendingOrders.delete(params.orderId);
        return {
          success: false,
          error: {
            message: data.message || 'Unknown error',
            code: data.code || 'UNKNOWN_ERROR',
            type: data.type || 'API_ERROR'
          },
          status: response.status,
          payment_session_id: data.payment_session_id
        };
      }

      return {
        success: true,
        data,
        status: response.status,
        payment_session_id: data.payment_session_id
      };
    } catch (error: any) {
      console.error('Cashfree payment session creation failed:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      // Remove from pending orders if request fails
      this.pendingOrders.delete(params.orderId);
      return {
        success: false,
        error: {
          message: error.message,
          code: 'INTERNAL_ERROR',
          type: 'SYSTEM_ERROR'
        },
        status: 500,
        payment_session_id: undefined
      };
    }
  }

  async verifySignature(orderId: string, orderAmount: string, referenceId: string, txStatus: string, paymentMode: string, txMsg: string, txTime: string, signature: string): Promise<boolean> {
    const data = orderId + orderAmount + referenceId + txStatus + paymentMode + txMsg + txTime;
    const computedSignature = await this.computeSignature(data);
    return computedSignature === signature;
  }

  private async computeSignature(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(data);
    const keyBuffer = encoder.encode(this.secretKey);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      messageBuffer
    );
    
    return Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Add cleanup method for maintenance
  private cleanupPendingOrders(): void {
    const now = Date.now();
    Array.from(this.pendingOrders.keys()).forEach(orderId => {
      const data = this.pendingOrders.get(orderId)!;
      if (now - data.timestamp > this.ORDER_EXPIRY_TIME) {
        this.pendingOrders.delete(orderId);
      }
    });
  }

  private getPaymentStatus(webhookStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'PAYMENT_SUCCESS_WEBHOOK': 'success',
      'PAYMENT_FAILED_WEBHOOK': 'failed',
      'PAYMENT_USER_DROPPED_WEBHOOK': 'failed', // Changed from 'dropped' to 'failed'
      'PAYMENT_CANCELLED_WEBHOOK': 'failed'     // Changed from 'cancelled' to 'failed'
    };
    return statusMap[webhookStatus] || 'failed'; // Default to failed instead of pending
  }

  async handleWebhookPayload(payload: CashfreeWebhookPayload, supabase: any): Promise<boolean> {
    try {
      if (!payload?.data?.order?.order_id || !payload?.data?.payment) {
        console.error('Invalid webhook payload:', payload);
        return false;
      }

      const {
        data: { order, payment, error_details, payment_gateway_details, customer_details },
        type: webhookType,
        event_time
      } = payload;

      // Log raw webhook data immediately
      console.log('Processing webhook:', {
        orderId: order.order_id,
        type: webhookType,
        status: payment.payment_status,
        amount: payment.payment_amount,
        timestamp: new Date().toISOString()
      });

      // Create payment log entry first
      const { data: paymentLog, error: logError } = await supabase
        .from('payment_logs')
        .insert({
          order_id: order.order_id,
          event_type: webhookType,
          payload: payload, // Store complete webhook payload
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (logError) {
        console.error('Failed to create payment log:', { error: logError, orderId: order.order_id });
      }

      const paymentStatus = this.getPaymentStatus(webhookType);
      
      // Build comprehensive metadata
      const metadata = {
        payment_status: payment.payment_status,
        payment_message: payment.payment_message,
        payment_method_details: payment.payment_method,
        error_details: error_details || null,
        gateway_details: payment_gateway_details || null,
        customer_details: customer_details || null,
        webhook_type: webhookType,
        event_time: event_time,
        payment_status_original: webhookType,
        is_user_dropped: webhookType === 'PAYMENT_USER_DROPPED_WEBHOOK',
        is_cancelled: webhookType === 'PAYMENT_CANCELLED_WEBHOOK',
        auth_id: payment.auth_id,
        bank_additional_info: payment.payment_method,
        cf_payment_id: payment.cf_payment_id,
        bank_reference: payment.bank_reference,
        raw_webhook: payload // Store complete payload for reference
      };

      // Prepare update data
      const paymentData = {
        order_id: order.order_id,
        amount: order.order_amount,
        currency: order.order_currency,
        status: paymentStatus,
        payment_method: payment.payment_group,
        transaction_id: payment.cf_payment_id.toString(),
        bank_reference: payment.bank_reference || null,
        cf_payment_id: payment.cf_payment_id.toString(),
        cf_order_id: payment_gateway_details?.gateway_order_id || null,
        payment_time: payment.payment_time,
        metadata,
        updated_at: new Date().toISOString()
      };

      // First try to find the payment
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id, status')
        .eq('order_id', order.order_id)
        .maybeSingle();

      let result;

      if (existingPayment) {
        // Update existing payment
        result = await supabase
          .from('payments')
          .update(paymentData)
          .eq('id', existingPayment.id)
          .select()
          .single();
      } else {
        // Create new payment record
        result = await supabase
          .from('payments')
          .insert(paymentData)
          .select()
          .single();
      }

      const { data: updatedPayment, error: updateError } = result;

      if (updateError) {
        console.error('Payment update/insert failed:', {
          error: updateError,
          orderId: order.order_id,
          status: paymentStatus
        });
        return false;
      }

      // Update payment log with payment_id
      if (paymentLog && updatedPayment) {
        await supabase
          .from('payment_logs')
          .update({ payment_id: updatedPayment.id })
          .eq('id', paymentLog.id);
      }

      console.log('Payment record processed:', {
        orderId: order.order_id,
        status: paymentStatus,
        paymentId: updatedPayment.id,
        type: webhookType,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Webhook processing failed:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      // Still try to save the raw webhook data
      try {
        await supabase
          .from('payment_logs')
          .insert({
            order_id: payload?.data?.order?.order_id,
            event_type: 'ERROR_' + payload?.type,
            payload: {
              error: error.message,
              stack: error.stack,
              original_payload: payload
            },
            created_at: new Date().toISOString()
          });
      } catch (logErr: unknown) {
        const logError = logErr as Error;
        console.error('Failed to log webhook error:', {
          message: logError.message,
          stack: logError.stack
        });
      }
      return false;
    }
  }
}
