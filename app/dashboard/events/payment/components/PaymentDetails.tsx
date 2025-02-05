import { PaymentRecord } from "@/app/types/payment";
import { formatCurrency, formatDate } from "@/app/utils/format";

interface PaymentDetailsProps {
  payment: PaymentRecord;
}

export function PaymentDetails({ payment }: PaymentDetailsProps) {
  const webhookData = payment.metadata?.webhook_event?.data;
  const orderDetails = webhookData?.order;
  const paymentInfo = webhookData?.payment;
  const customerDetails = webhookData?.customer_details;
  const chargesDetails = webhookData?.charges_details;

  return (
    <div className="bg-gray-50/80 p-6 border-t border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
            Transaction Details
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Order ID:</dt>
              <dd className="text-sm text-gray-900">{payment.order_id}</dd>
            </div>
            {paymentInfo?.cf_payment_id && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Payment ID:</dt>
                <dd className="text-sm text-gray-900">{paymentInfo.cf_payment_id}</dd>
              </div>
            )}
            {paymentInfo?.bank_reference && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Bank Reference:</dt>
                <dd className="text-sm text-gray-900">{paymentInfo.bank_reference}</dd>
              </div>
            )}
            {paymentInfo?.payment_method?.upi?.upi_id && (
              <div>
                <dt className="text-sm font-medium text-gray-500">UPI ID:</dt>
                <dd className="text-sm text-gray-900">{paymentInfo.payment_method.upi.upi_id}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-green-500 rounded-full"></span>
            Payment Details
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Amount:</dt>
              <dd className="text-sm text-gray-900">
                {formatCurrency(payment.amount)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status:</dt>
              <dd className="text-sm text-gray-900">{payment.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Payment Time:</dt>
              <dd className="text-sm text-gray-900">
                {payment.payment_time ? formatDate(payment.payment_time) : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Payment Method:</dt>
              <dd className="text-sm text-gray-900">{paymentInfo?.payment_group || '-'}</dd>
            </div>
          </dl>
        </div>

        {customerDetails && (
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
              Customer Details
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name:</dt>
                <dd className="text-sm text-gray-900">{customerDetails.customer_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email:</dt>
                <dd className="text-sm text-gray-900">{customerDetails.customer_email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone:</dt>
                <dd className="text-sm text-gray-900">{customerDetails.customer_phone}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
