export default function EventLoading() {
  return (
    <main className="min-h-screen bg-[#EBE9E0] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Simple breadcrumb skeleton */}
        <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />

        <div className="p-2 sm:p-4 border-4 border-dashed border-gray-300 rounded-[2rem]">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Simplified image skeleton */}
              <div className="md:w-[45%] h-[200px] bg-gray-200 animate-pulse" />

              {/* Content side */}
              <div className="md:w-[55%] p-6 space-y-6">
                {/* Event tag and title */}
                <div className="space-y-4">
                  <div className="h-5 w-24 bg-blue-100 rounded-full animate-pulse" />
                  <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                </div>

                {/* Basic info blocks */}
                <div className="space-y-4">
                  <div className="h-12 w-full bg-gray-100 rounded animate-pulse" />
                  <div className="h-12 w-full bg-gray-100 rounded animate-pulse" />
                </div>

                {/* Button area */}
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
