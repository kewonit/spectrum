import { Bottle_rocket_registarion } from "@/app/events/bottle-rocket/components/registration"
import { Krona_One } from 'next/font/google'
import Image from "next/image";

import { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Spectrum x Water Rocket',
  description: "Tech event for first year students",  
  openGraph: {
    title: 'Spectrum x Water Rocket',
    description: "Tech event for first year students",  
    url: "https://spectrumpccoe25.tech",
    siteName: "spectrumpccoe25.tech",
    images: [
      {
        url: "https://i.postimg.cc/Wzs7zpZf/s.webp",
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

const ruleList = [
  "Group size - minimum 1 and maximum 4.",
  "One group - One Rocket",
  "Maximum Attempts Allowed - Three (3)",
  "Competitors bring their own rockets, launchers and team.",
  "No limit for Bottle Size.",
  "Bottle Material - Plastic",
  "Landing point - First point of impact on ground",
  "Rocket should land within the designated landing",
  "All energy given to the rocket must only come from the water and air pressure combination. No other source of energy is allowed. You can only compress air manually, with a foot or bicycle pump.",
  "No external metal parts are allowed on the rocket, but are allowed on the launch mechanism.",
  "You are only allowed to use plastic bottles specifically designed for holding pressure, or that have been pressure tested (for example carbonated drink bottles).",
  "Your launch apparatus must be secure and must be able to robustly control the rocket's flight direction.",
  "No glass or sharp objects to be used in/on the rocket.",
  "Do not use glass bottles or plastic bottles designed for still water.",
  "For safety's sake any fast falling rockets must land in the landing zone or you will get no points for that round. If soft-landing rockets (e.g. rockets with parachutes) land outside the landing zone their time will be counted for the longest time in the air award.",
  "The competitor who achieves the highest Total score out of 100, will be declared the winner of the Launch Competition."
];

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
                  Water Rocket &apos;25
                </h1>
                <h2 className="text-xl md:text-2xl text-white/90">
                  brought to you by AS&H, PCCOE
                </h2>
                <p className="text-lg text-white/80 font-light max-w-xl mt-6">
                  Experience the thrill of engineering as you design and launch rockets powered by water and air pressure! Compete for precision, distance, and innovation.
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <Image 
                src="https://i.postimg.cc/Wzs7zpZf/s.webp" 
                alt="Event Image" 
                width={300} 
                height={300} 
                className="rounded-lg" 
                draggable={false}
              />
            </div>
          </div>
        </div>

        <div className="mb-20">
          <Bottle_rocket_registarion />
        </div>

        {/* Competition Field Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-12">
          <h2 className={`${krona.className} text-3xl text-white mb-6`}>Competition Field</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
              <h3 className={`${krona.className} text-xl text-white mb-4`}>Launch Area Layout</h3>
              <Image 
                src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705991583/Spectrum/global/AF35KS7-min_qn2qrn.png"
                alt="Launch Area Layout"
                width={400}
                height={300}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
              <h3 className={`${krona.className} text-xl text-white mb-4`}>Scoring Formula</h3>
              <Image 
                src="https://i.postimg.cc/4xcJ5YZ3/image-8.png"
                alt="Scoring Formula"
                width={400}
                height={300}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Rules Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-12">
          <h3 className={`${krona.className} text-2xl text-white mb-6`}>Event Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ruleList.map((rule, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <span className="text-white/90 font-bold">{idx + 1}.</span>
                <p className="text-white/80">{rule}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center w-full">
          <Image 
            src="https://i.postimg.cc/9M5b3YQ2/s-1.webp" 
            alt="Event Image" 
            width={500} 
            height={500} 
            className="rounded-lg" 
            draggable={false}
          />
        </div>
      </div>
    </main>
  );
}