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
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Payments' },
          ]}
          className="mb-4"
        />

        <div className="bg-white rounded-xl shadow p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment History</h1>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Time</TableHead>
                  <TableHead>Method</TableHead>
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
                      className="text-center text-muted-foreground py-8"
                    >
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </main>
  );
}
