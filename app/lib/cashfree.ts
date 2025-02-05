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
  returnUrl?: string; // Add this line
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
      const env = process.env.NODE_ENV || 'development';
      throw new Error(`Missing Cashfree credentials for ${env} environment. Please check your environment variables.`);
    }

    // Validate credential format
    if (!this.validateCredentials(appId, secretKey)) {
      throw new Error('Invalid Cashfree credentials format');
    }

    this.appId = appId;
    this.secretKey = secretKey;
    this.baseUrl = this.getBaseUrl();
  }

  private validateCredentials(appId: string, secretKey: string): boolean {
    if (!appId || !secretKey) {
      throw new Error(
        "Cashfree credentials are missing or invalid. Please verify your environment variables."
      );
    }
    
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      // In development, just check if the credentials exist and are strings
      // Remove the TEST prefix requirement as Cashfree sandbox creds don't always have it
      return typeof appId === 'string' && typeof secretKey === 'string';
    }
    
    // In production, ensure credentials don't have TEST prefix
    return !appId.startsWith('TEST') && !secretKey.startsWith('TEST');
  }

  private getBaseUrl(): string {
    const isDev = process.env.NODE_ENV !== 'production';
    const baseUrl = isDev 
      ? 'https://api.cashfree.com/pg'  // Use sandbox URL for development
      : 'https://api.cashfree.com/pg';
      
    console.log('Using Cashfree baseUrl:', {
      env: process.env.NODE_ENV,
      url: baseUrl
    });
    
    return baseUrl;
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
    // Add proper headers for authentication
    const headers = {
      'x-api-version': '2022-09-01',
      'x-client-id': this.appId,
      'x-client-secret': this.secretKey,
      'Content-Type': 'application/json',
      ...options.headers,
    };

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
        headers,
        signal: controller.signal
      });

      // Enhanced error handling
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error(`Authentication failed: Please check Cashfree credentials (${errorData.message || 'Unknown error'})`);
        }
        if (attempt < this.maxRetries) {
          console.warn(`Request failed (attempt ${attempt}/${this.maxRetries}):`, errorData);
          const backoff = Math.min(1000 * Math.pow(2, attempt), 5000);
          await this.wait(backoff);
          return this.makeRequest(url, options, attempt + 1);
        }
        throw new Error(`Cashfree API error: ${errorData.message || response.statusText}`);
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

  private async createOrGetCustomer(details: CustomerDetails): Promise<string> {
    // Ensure phone is exactly 10 digits
    const phone = (details.customerPhone || '').replace(/\D/g, '').slice(-10);
    
    // Create (or retrieve) a valid customer record using the /customers endpoint
    const response = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': this.appId,
        'x-client-secret': this.secretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_phone: phone,
        customer_email: details.customerEmail || '',
        customer_name: details.customerName || 'Guest'
      }),
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to create/retrieve customer: ${errorData.message || response.statusText}`);
    }
  
    const customerData = await response.json(); 
    // 'customer_uid' is returned by Cashfree
    return customerData.customer_uid;
  }

  async createPaymentSession(params: PaymentSessionRequest): Promise<CashfreeResponse> {
    try {
      this.validatePaymentInput(params);
  
      // 1) Ensure a valid Cashfree customer UID
      const customerUid = await this.createOrGetCustomer(params.customerDetails);
  
      // 2) Create the order (Cashfree returns a payment_session_id if possible)
      const orderResponse = await this.makeRequest(
        `${this.baseUrl}/orders`,
        {
          method: 'POST',
          headers: {
            'x-api-version': '2023-08-01',
            'x-client-id': this.appId,
            'x-client-secret': this.secretKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: params.orderId,
            order_amount: params.amount,
            order_currency: params.currency,
            customer_details: {
              customer_id: customerUid,
              customer_email: params.customerDetails.customerEmail,
              customer_phone: params.customerDetails.customerPhone,
              customer_name: params.customerDetails.customerName
            },
            order_meta: {
              return_url: params.returnUrl,
              notify_url: params.returnUrl?.replace('/registrations', '/api/payments/webhook')
            }
          }),
        }
      );
  
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(`Order creation failed: ${orderData.message}`);
      }
  
      // 3) If no payment_session_id returned, create a session explicitly
      if (!orderData.payment_session_id) {
        const sessionResponse = await this.makeRequest(
          `${this.baseUrl}/orders/sessions`,
          {
            method: 'POST',
            headers: {
              'x-api-version': '2023-08-01',
              'x-client-id': this.appId,
              'x-client-secret': this.secretKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ order_id: params.orderId }),
          }
        );
  
        const sessionData = await sessionResponse.json();
        if (!sessionResponse.ok) {
          throw new Error(`Session creation failed: ${sessionData.message}`);
        }
  
        orderData.payment_session_id = sessionData.payment_session_id;
      }
  
      return {
        success: true,
        data: orderData,
        status: orderResponse.status,
        payment_session_id: orderData.payment_session_id
      };
  
    } catch (error: any) {
      console.error('Payment session creation error:', {
        error: error.message,
        orderId: params.orderId,
        timestamp: new Date().toISOString()
      });
      throw error;
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
