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
  user_id: string;
  event_id: string;
  order_id: string;
  amount: number;
  status: string;
  payment_time: string | null;
  payment_method: string | null;
  created_at: string;
  metadata: PaymentMetadata;
  event?: { name: string };
  team?: { team_name: string };
}

interface PaymentMetadata {
  webhook_type?: string;
  payment_status?: string;
  webhook_event?: {
    data: {
      order?: any;
      payment?: {
        cf_payment_id?: string;
        payment_group?: string;
        bank_reference?: string;
        payment_method?: {
          upi?: {
            upi_id?: string;
          }
        }
      };
      customer_details?: {
        customer_name: string;
        customer_email: string;
        customer_phone: string;
      };
      charges_details?: {
        settlement_amount: number;
      };
    }
  };
  customer_info?: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  payment_details?: any;
  transaction_details?: any;
  gateway_info?: any;
}

interface PaymentInfo {
  required: boolean;
  status: string;
  amount: number | null;
  timestamp: string | null;
  pendingMembers?: number;
  acceptedMembers?: number;
  perMemberAmount?: number; // e.g., set to 100 in your logic
  totalMembers?: number;  // New field
  totalAmount?: number;  // Add this for total amount including pending members
}
