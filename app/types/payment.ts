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
  cf_payment_id: string;
  amount: number;
  status: string;
  payment_time: string;
  payment_completion_time: string;
  created_at: string;
  user_id: string;
  payment_currency: string;
  payment_message: string;
  bank_reference: string;
  auth_id: string;
  payment_group: string;
  is_captured: boolean;
  error_details?: {
    error_code: string;
    error_description: string;
    error_reason: string;
    error_source: string;
  };
  payment_method: {
    card?: {
      channel: string;
      card_number: string;
    };
    upi?: {
      channel: string;
      upi_id: string;
    };
  };
  payment_gateway_details?: {
    gateway_name: string;
    gateway_order_id: string;
    gateway_payment_id: string;
    gateway_order_reference_id: string;
    gateway_settlement: string;
  };
  event?: {
    name: string;
  };
  team?: {
    team_name: string;
  } | null;
}
