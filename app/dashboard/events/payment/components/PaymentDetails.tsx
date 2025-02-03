import { PaymentRecord } from "@/app/types/payment";
import { formatCurrency } from "@/app/utils/format";

interface PaymentDetailsProps {
  payment: PaymentRecord;
}

export function PaymentDetails({ payment }: PaymentDetailsProps) {
  const metadata = payment.metadata as any;
  const charges = metadata?.webhook_event?.data?.charges_details;
  const customer = metadata?.webhook_event?.data?.customer_details;
  const paymentInfo = metadata?.webhook_event?.data?.payment;

  return (
    <div className="px-4 py-3 bg-gray-50 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer Details */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Customer Details</h4>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-600">Name:</span> {customer?.customer_name}</p>
            <p><span className="text-gray-600">Email:</span> {customer?.customer_email}</p>
            <p><span className="text-gray-600">Phone:</span> {customer?.customer_phone}</p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Payment Information</h4>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-600">Order ID:</span> {payment.order_id}</p>
            <p><span className="text-gray-600">Bank Reference:</span> {payment.bank_reference}</p>
            <p><span className="text-gray-600">Transaction ID:</span> {payment.transaction_id}</p>
          </div>
        </div>

        {/* Charges Breakdown */}
        {charges && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Charges Breakdown</h4>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Service Tax:</span> {formatCurrency(charges.service_tax)}</p>
              <p><span className="text-gray-600">Service Charge:</span> {formatCurrency(charges.service_charge)}</p>
              <p><span className="text-gray-600">Settlement Amount:</span> {formatCurrency(charges.settlement_amount)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
