import { Rules } from "@/app/events/debate/components/accordian"
import { Debate_registarion } from "@/app/events/debate/components/registration";
import { Krona_One } from 'next/font/google'
import Image from "next/image";

import { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Spectrum x War of Words',
  description: "Tech event for first year students",  
  openGraph: {
    title: 'Spectrum x War of Words',
    description: "Tech event for first year students",  
    url: "https://spectrumpccoe25.tech",
    siteName: "spectrumpccoe25.tech",
    images: [
      {
        url: "https://i.postimg.cc/qqD2Q47L/3.png",
        width: 548,
        height: 253,
        alt: 'Image',
      },
    ],
  }, 
}

const krona = Krona_One({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: '400',
});

export default function Home() {
  return (
    <main className="min-h-screen" style={{
      background: "radial-gradient(at left top, rgb(91, 192, 222), rgb(51, 142, 218))",
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="relative rounded-2xl bg-white/10 backdrop-blur-lg p-8 mb-12">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
            <div className="w-full md:w-1/2">
              <div className={`${krona.className} space-y-4`}>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#ece9e0]">
                  War of Words &apos;25
                </h1>
                <h2 className="text-xl md:text-2xl text-white/90">
                  brought to you by AS&H, PCCOE
                </h2>
                <p className="text-lg text-white/80 font-light max-w-xl mt-6">
                Is climate change more of a political issue than a scientific one?
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <Image 
                src="https://i.postimg.cc/qqD2Q47L/3.png" 
                alt="Event Image" 
                width={400} 
                height={400} 
                className="rounded-lg" 
                draggable={false}
              />
            </div>
          </div>
        </div>

        <div className="mb-12">
          <Debate_registarion />
        </div>

        {/* Rules Section with Accordion */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
          <div className="text-white mb-8">
            <h2 className={`${krona.className} text-3xl mb-4`}>Competition Format</h2>
            <p className="text-white/80">Challenge yourself in this battle of words and ideas</p>
          </div>
          
          <Rules />
        </div>
      </div>
    </main>
  );
}