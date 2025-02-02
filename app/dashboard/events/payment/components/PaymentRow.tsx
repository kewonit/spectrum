'use client';

import { useState } from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatDate } from "@/app/lib/utils";
import { PaymentRecord } from "@/app/types/payment";

// Move getStatusColor into the client component
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'paid':
    case 'success': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

function PaymentDetails({ payment }: { payment: PaymentRecord }) {
  return (
    <div className="p-4 space-y-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-500">Payment Details</h4>
          <div className="space-y-2 mt-2">
            <p><span className="font-medium">CF Payment ID:</span> {payment.cf_payment_id}</p>
            <p><span className="font-medium">Currency:</span> {payment.payment_currency}</p>
            <p><span className="font-medium">Payment Group:</span> {payment.payment_group}</p>
            <p><span className="font-medium">Bank Reference:</span> {payment.bank_reference}</p>
          </div>
        </div>

        {payment.payment_gateway_details && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500">Gateway Info</h4>
            <div className="space-y-2 mt-2">
              <p><span className="font-medium">Gateway:</span> {payment.payment_gateway_details?.gateway_name}</p>
              <p><span className="font-medium">Gateway Order ID:</span> {payment.payment_gateway_details?.gateway_order_id}</p>
              <p><span className="font-medium">Gateway Payment ID:</span> {payment.payment_gateway_details?.gateway_payment_id}</p>
            </div>
          </div>
        )}

        {payment.error_details && (
          <div>
            <h4 className="text-sm font-semibold text-red-500">Error Details</h4>
            <div className="space-y-2 mt-2">
              <p><span className="font-medium">Code:</span> {payment.error_details.error_code}</p>
              <p><span className="font-medium">Reason:</span> {payment.error_details.error_reason}</p>
              <p><span className="font-medium">Description:</span> {payment.error_details.error_description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PaymentRow({ payment }: { payment: PaymentRecord }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <TableRow className="group">
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell className="font-medium">
          {payment.event?.name}
        </TableCell>
        <TableCell>
          {payment.team ? (
            <span title={payment.team.team_name}>Team Payment</span>
          ) : (
            "Individual"
          )}
        </TableCell>
        <TableCell>
          {payment.payment_currency} {payment.amount.toFixed(2)}
        </TableCell>
        <TableCell>
          <Badge 
            variant="secondary"
            className={getStatusColor(payment.status)}
          >
            {payment.status}
          </Badge>
        </TableCell>
        <TableCell>
          {formatDate(payment.payment_time)}
        </TableCell>
        <TableCell>
          {payment.payment_group}
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={7}>
            <PaymentDetails payment={payment} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
