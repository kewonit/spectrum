export interface PaymentDetailsResponse {
  orderId: string;
  paymentSessionId: string;
  amount: number;
}

export interface PaymentInitiationRequest {
  eventId: string;
  teamId?: string;
  type: 'solo' | 'team';
}

export interface PaymentVerificationResponse {
  success: boolean;
  orderId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  message?: string;
}

export interface PaymentRecord {
  id: string;
  order_id: string;
  user_id: string;
  team_id?: string;
  event_id?: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  payment_method?: string;
  transaction_id?: string;
  bank_reference?: string;
  created_at?: string;
  updated_at?: string;
  cf_order_id?: string;
  cf_payment_id?: string;
  payment_time?: string;
  registration_id?: string;
  metadata?: {
    webhook_event?: {
      data?: {
        charges_details?: {
          service_tax: number;
          service_charge: number;
          settlement_amount: number;
          settlement_currency: string;
        };
        customer_details?: {
          customer_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
        };
        payment?: {
          payment_group: string;
          payment_method: any;
          payment_message: string;
        };
      };
    };
  };
  event?: {
    name: string;
  };
  team?: {
    team_name: string;
  };
}
