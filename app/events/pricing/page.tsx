import { createClient } from "@/app/utils/supabase/server";
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Users, Info, Tag, Wallet, Shield, Banknote, CreditCard } from 'lucide-react';
import { Breadcrumbs } from "@/app/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: 'Event Pricing | Spectrum 2025',
  description: 'Pricing information for Spectrum PCCOE events',
};

export const revalidate = 60; // Match the revalidation time with events page

interface Event {
  id: string;
  name: string;
  description: string | null;
  event_type: string;
  min_team_size: number;
  max_team_size: number;
  event_start: string;
  event_end: string;
  max_registrations: number | null;
  is_active: boolean;
  img_url: string | null;
  whatsapp_url: string | null;
}

export default async function PricingPage() {
  const supabase = await createClient();
  
  try {
    // Use a more efficient query - select only needed fields to reduce payload size
    const { data: events, error } = await supabase
      .from("events")
      .select(`
        id,
        name,
        min_team_size,
        max_team_size
      `)
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    // Group events by type
    const soloEvents = events?.filter(event => event.min_team_size === 1 && event.max_team_size === 1) || [];
    const teamEvents = events?.filter(event => event.max_team_size > 1) || [];
    
    return (
      <main className="min-h-screen bg-[#EBE9E0] overflow-auto">
        <div className="w-full max-w-screen-xl mx-auto p-4 sm:px-6 lg:p-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Events', href: '/dashboard/events' },
              { label: 'Pricing' },
            ]}
            className="mb-6"
          />
          
          <div className="space-y-8">
            {/* Header Section - Matching dashboard style with integrated CTA */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden relative border border-gray-100">
              {/* Dots for ticket effect */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-r-full"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full"></div>
              
              <div className="px-5 sm:px-8 lg:px-10 py-6 sm:py-8">
                <div className="flex flex-col lg:flex-row items-start gap-6">
                  <div className="flex-grow">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="p-3 bg-[#EBE9E0]/40 backdrop-blur-sm rounded-xl shrink-0">
                        <Wallet className="w-6 h-6 text-primary/70" />
                      </div>
                      
                      <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                          Event Pricing
                        </h1>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">
                          Transparent pricing for all Spectrum 2025 events
                        </p>
                      </div>
                    </div>
                    
                    <p className="mt-4 text-sm text-gray-600 max-w-2xl">
                      PCCOE students participate for free, while external participants pay ₹100 per team member. Secure your spot today!
                    </p>
                  </div>
                  
                  <div className="w-full lg:w-auto flex justify-center lg:justify-end mt-4 lg:mt-0">
                    <Link href="/dashboard/events">
                      <Button className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 inline-flex items-center gap-2 px-5 py-2 h-auto">
                        Browse All Events <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pricing Explanation - Made more compact and mobile-friendly */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-4 py-4 border-b border-gray-200 bg-[#EBE9E0]/40">
                <h2 className="text-lg font-medium text-gray-900">How Our Pricing Works</h2>
                <p className="mt-1 text-sm text-gray-500">Simple, transparent pricing for all participants</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex flex-row items-center gap-3">
                  <div className="p-2.5 bg-green-100 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-green-800">PCCOE Students</h3>
                      <Badge className="bg-green-100 text-green-800 border-0">FREE</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-bold text-green-700">₹0.00</span>
                      <span className="text-xs text-green-700">(INR)</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-row items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-blue-800">External Participants</h3>
                      <Badge className="bg-blue-100 text-blue-800 border-0">Per Member</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-bold text-blue-700">₹100.00</span>
                      <span className="text-xs text-blue-700">(INR)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 p-4 bg-[#EBE9E0]/20">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-600">
                    All payments processed via CashFree Payments gateway in Indian Rupees (INR). Team leaders handle payments for all members.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Individual Events Pricing */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary/70" />
                Individual Event Pricing
              </h2>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-4 py-4 border-b border-gray-200 bg-[#EBE9E0]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Solo Events</h3>
                    <p className="mt-1 text-sm text-gray-500">Events with individual participation</p>
                  </div>
                  <Badge variant="outline" className="mt-2 sm:mt-0 text-xs px-2.5 py-0.5 border-blue-200 bg-blue-50 text-blue-800">
                    ₹100 per External Student
                  </Badge>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#EBE9E0]/20">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team Size
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PCCOE Student
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          External Student (INR)
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {soloEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-[#EBE9E0]/10">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{event.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">Individual</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">₹0</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">₹100.00</div>
                            <div className="text-xs text-gray-500">Indian Rupees</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link 
                              href={`/dashboard/events/${event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                              className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
                            >
                              Register <ChevronRight className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-4 bg-[#EBE9E0]/20 border-t border-gray-200 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-gray-500" />
                    Pricing Note: All prices shown are in Indian Rupees (INR)
                  </div>
                </div>
              </div>
            </div>
            
            {/* Team Events Pricing */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary/70" />
                Team Event Pricing
              </h2>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-4 py-4 border-b border-gray-200 bg-[#EBE9E0]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Team Events</h3>
                    <p className="mt-1 text-sm text-gray-500">Events requiring multiple participants</p>
                  </div>
                  <Badge variant="outline" className="mt-2 sm:mt-0 text-xs px-2.5 py-0.5 border-blue-200 bg-blue-50 text-blue-800">
                    ₹100 × Team Size (INR)
                  </Badge>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#EBE9E0]/20">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team Size
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PCCOE Teams
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          External Teams (Min) - INR
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          External Teams (Max) - INR
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teamEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-[#EBE9E0]/10">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{event.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{event.min_team_size} - {event.max_team_size} members</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">₹0</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">₹{event.min_team_size * 100}.00</div>
                            <div className="text-xs text-gray-500">({event.min_team_size} × ₹100.00)</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">₹{event.max_team_size * 100}.00</div>
                            <div className="text-xs text-gray-500">({event.max_team_size} × ₹100.00)</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link 
                              href={`/dashboard/events/${event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                              className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
                            >
                              Register <ChevronRight className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-4 bg-[#EBE9E0]/20 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="text-xs text-gray-600 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-gray-500" />
                    Pricing Note: All prices shown are in Indian Rupees (INR)
                  </div>
                  <div className="text-xs bg-blue-50 px-2 py-1 rounded text-blue-700 border border-blue-100">
                    Team leader handles payment for all members
                  </div>
                </div>
              </div>
            </div>
            
            {/* FAQ Section with Accordion */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-4 py-4 border-b border-gray-200 bg-[#EBE9E0]/40">
                <h2 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h2>
                <p className="mt-1 text-sm text-gray-500">Common questions about event pricing</p>
              </div>
              
              <div className="p-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-b border-[#EBE9E0]/60">
                    <AccordionTrigger className="text-base font-medium text-gray-900 hover:no-underline hover:text-primary">
                      How do I pay for events?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600">
                      Payments can be made through our secure payment gateway using UPI, credit/debit cards, or net banking. The payment option appears during the registration process.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2" className="border-b border-[#EBE9E0]/60">
                    <AccordionTrigger className="text-base font-medium text-gray-900 hover:no-underline hover:text-primary">
                      Are there any hidden charges?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600">
                      No. The pricing is transparent with a flat fee of ₹100 per person for non-PCCOE participants. There are no additional charges.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3" className="border-b border-[#EBE9E0]/60">
                    <AccordionTrigger className="text-base font-medium text-gray-900 hover:no-underline hover:text-primary">
                      Can I get a refund if I can&apos;t attend?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600">
                      No, unfortunately we don&apos;t offer refunds once registration is confirmed. Please be sure of your participation before registering.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4" className="border-b border-[#EBE9E0]/60">
                    <AccordionTrigger className="text-base font-medium text-gray-900 hover:no-underline hover:text-primary">
                      How are team payments handled?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600">
                      For team events, the team leader is responsible for making the payment for all team members. The payment amount is calculated based on the total number of team members multiplied by ₹100 per member.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5" className="border-b-0">
                    <AccordionTrigger className="text-base font-medium text-gray-900 hover:no-underline hover:text-primary">
                      What if our team size changes after payment?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600">
                      Team size must be finalized before payment. If adding additional members after payment, you&apos;ll need to contact the event organizers for guidance.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
            
            {/* Compliance Information */}
            <div className="text-xs text-center text-gray-500 pt-2 pb-6">
              <p>This pricing information is provided in compliance with payment gateway requirements.</p>
              <p>Last updated: March 31, 2025 • <Link href="/compliance/cancelationandrefund" className="underline hover:text-gray-700">Refund Policy</Link></p>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error fetching events:", error);
    return (
      <main className="min-h-screen bg-[#EBE9E0] overflow-auto">
        <div className="w-full max-w-screen-xl mx-auto p-4 sm:px-6 lg:p-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Events', href: '/dashboard/events' },
              { label: 'Pricing' },
            ]}
            className="mb-6"
          />
          
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading pricing information...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }
}