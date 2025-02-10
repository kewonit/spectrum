import Image from "next/image"
import { Button } from "@/components/ui/button"

export function BrainDashers_registarion() {
    return (
        <div className="p-2 sm:p-4 lg:p-8 mx-auto">
            <div className="p-3 sm:p-4 border-4 border-dashed border-gray-300 rounded-[2rem]">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 relative">
                    {/* Dots for ticket effect */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-r-full"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 sm:w-4 h-6 sm:h-8 bg-[#EBE9E0] rounded-l-full"></div>

                    <div className="flex flex-col md:flex-row h-auto md:h-[400px]">
                        {/* Left side - Image */}
                        <div className="md:w-[45%] relative h-[150px] sm:h-[200px] md:h-full bg-[#EBE9E0]">
                            <Image 
                                className="object-contain object-center w-full h-full p-2 sm:p-4"
                                src="https://i.postimg.cc/xCW1v8gB/15.png" 
                                alt="product image" 
                                width={1200} 
                                height={1000} 
                                loading="lazy" 
                                draggable={false}
                            />
                        </div>
                        
                        {/* Right side - Ticket Content */}
                        <div className="md:w-[55%] p-4 sm:p-6 lg:p-8 flex flex-col justify-between bg-gradient-to-br from-white to-gray-50">
                            <div className="space-y-4 sm:space-y-8">
                                <div>
                                    <span className="inline-block px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-medium tracking-wide uppercase mb-1.5 sm:mb-3 mr-2">
                                        Limited Spots Available
                                    </span>
                                    <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-black mb-1.5 sm:mb-2">
                                        Brain Dasher &apos;25
                                    </h1>
                                    <p className="text-[11px] sm:text-sm text-gray-600 leading-relaxed">
                                        Join us for an exciting technical event featuring challenging rounds of coding, problem-solving, and innovative thinking.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-6">
                                    <div className="space-y-2 sm:space-y-4">
                                        <div className="flex items-center gap-1.5 sm:gap-3">
                                            <svg className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            <div>
                                                <p className="text-[11px] sm:text-sm font-semibold text-gray-900">Event Format</p>
                                                <p className="text-[9px] sm:text-xs text-gray-500">3 Challenging Rounds</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 sm:gap-3">
                                            <svg className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.11 0-2.08.402-2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div>
                                                <p className="text-[11px] sm:text-sm font-semibold text-gray-900">Prizes & Rewards</p>
                                                <p className="text-[9px] sm:text-xs text-gray-500">Cash Prizes, Medals, and Certificates</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Pricing section */}
                                    <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                        <div className="space-y-2 w-full">
                                            <div className="flex justify-between items-center">
                                                <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900">₹0</div>
                                                <div className="flex flex-col items-end">
                                                    <div className="text-[11px] sm:text-sm text-gray-500">PCCOEians</div>
                                                    <div className="text-[9px] sm:text-xs text-blue-600 font-medium">It&apos;s on us!</div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                {/* Updated pricing block for Non PCCOEians */}
                                                <div className="text-base sm:text-lg md:text-xl font-bold text-gray-900">₹100</div>
                                                <div className="flex flex-col items-end">
                                                    <div className="text-[11px] sm:text-sm text-gray-500">Non PCCOEians</div>
                                                    <div className="text-[9px] sm:text-xs text-blue-600 font-medium">Register Now!</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 md:mt-0">
                                <div className="border-t-2 border-dashed border-gray-300 my-3 sm:my-6 -mx-3 sm:-mx-8"></div>
                                <a href="/login" className="block w-full">
                                    <Button className="w-full py-2.5 sm:py-4 text-xs sm:text-base font-medium bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-300 rounded-lg flex items-center justify-between px-3 sm:px-6 group">
                                        <span>Register Now</span>
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}