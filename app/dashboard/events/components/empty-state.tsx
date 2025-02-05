import { Breadcrumbs } from "@/app/components/breadcrumbs";

export function EmptyState() {
  return (
    <main className="min-h-screen bg-[#EBE9E0] p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Events' },
          ]}
          className="mb-6"
        />
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-2">No Active Events</h3>
          <p className="text-gray-600">Check back later for upcoming events!</p>
        </div>
      </div>
    </main>
  );
}
