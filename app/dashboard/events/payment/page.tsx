import { createClient } from "@/app/utils/supabase/server";
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { PaymentRow } from "./components/PaymentRow";
import { PaymentRecord } from "@/app/types/payment";

export default async function PaymentsPage() {
  const supabase = await createClient();
  
  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const headersList = await headers();
  const url = new URL(headersList.get('x-url') || '', process.env.NEXT_PUBLIC_APP_URL);
  const orderId = url.searchParams.get('order_id');
  
  if (orderId) {
    const verifyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify?order_id=${orderId}`,
      { cache: 'no-store' }
    );
    
    if (verifyResponse.ok) {
      redirect('/dashboard/events/registrations');
    }
  }

  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      event:events(name),
      team:teams(team_name)
    `)
    .eq('user_id', user.id)
    .order('payment_time', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false, nullsFirst: false });

  return (
    <main className="min-h-screen bg-[#EBE9E0] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Payments' },
          ]}
        />

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          Note: While payments are generally processed instantly, it may take up to 30 minutes for your payment to be reflected in your history.
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gray-100 p-6 lg:p-8 border-b border-gray-200">
            <h1 className="text-3xl font-semibold text-gray-600 tracking-tight">
              Payment History
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              View and manage your payment transactions
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <div className="p-4 sm:p-6 lg:p-8 pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-gray-50/50">
                    <TableHead></TableHead>
                    <TableHead className="font-semibold">Event</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Payment Time</TableHead>
                    <TableHead className="font-semibold">Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments?.map((payment: PaymentRecord) => (
                    <PaymentRow 
                      key={payment.id}
                      payment={payment}
                    />
                  ))}
                  {!payments?.length && (
                    <TableRow>
                      <TableCell 
                        colSpan={7} 
                        className="text-center text-gray-500 py-12"
                      >
                        No payment records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
