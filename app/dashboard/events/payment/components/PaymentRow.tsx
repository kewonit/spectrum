'use client';

import { useState } from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/app/utils/format";
import { PaymentRecord } from "@/app/types/payment";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PaymentDetails } from "./PaymentDetails";

interface PaymentRowProps {
  payment: PaymentRecord;
}

export function PaymentRow({ payment }: PaymentRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const metadata = payment.metadata as any;
  const paymentInfo = metadata?.webhook_event?.data?.payment;

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-gray-50" onClick={() => setIsExpanded(!isExpanded)}>
        <TableCell>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </TableCell>
        <TableCell>{payment.event?.name}</TableCell>
        <TableCell>{payment.team ? 'Team' : 'Individual'}</TableCell>
        <TableCell>{(payment.amount)}</TableCell>
        <TableCell>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            payment.status.toUpperCase() === 'SUCCESS' ? 'bg-green-100 text-green-700 border border-green-300' :
            payment.status.toUpperCase() === 'FAILED' ? 'bg-red-100 text-red-700 border border-red-300' :
            'bg-yellow-100 text-yellow-700 border border-yellow-300'
          }`}>
            {payment.status}
          </span>
        </TableCell>
        <TableCell>{payment.payment_time ? formatDate(payment.payment_time) : '-'}</TableCell>
        <TableCell>{paymentInfo?.payment_group || payment.payment_method || '-'}</TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={7} className="p-0">
            <PaymentDetails payment={payment} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
