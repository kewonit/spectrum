import { Rules } from "@/app/events/3d-modelling/components/accordian"
import { ThreeModelling } from "@/app/events/3d-modelling/components/registration";
import { Krona_One } from 'next/font/google'
import Image from "next/image";

import { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Spectrum x Model Making',
  description: "Civil Engineering model building competition",
  openGraph: {
    title: 'Spectrum x Model Making',
    description: "Civil Engineering model building competition",
    url: "https://spectrumpccoe25.tech",
    siteName: "spectrumpccoe25.tech",
    images: [
      {
        url: "https://i.postimg.cc/PxtZjPpy/8.png",
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
  "Teams must consist of exactly 3 members.",
  "All materials will be provided by the organizers.",
  "Time limit for construction is strictly enforced.",
  "Models must be built according to provided specifications.",
  "No external tools or materials are allowed.",
  "Team members must wear safety equipment provided.",
  "Decisions of the judges are final.",
  "Models will be tested for stability and strength.",
  "No modifications allowed after time limit.",
  "Teams must clean their workspace after completion.",
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
                  Model Making &apos;25
                </h1>
                <h2 className="text-xl md:text-2xl text-white/90">
                  brought to you by Civil Department, PCCOE
                </h2>
                <p className="text-lg text-white/80 font-light max-w-xl mt-6">
                  Test your engineering skills in real-world model making challenge
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <Image 
                src="https://i.postimg.cc/PxtZjPpy/8.png" 
                alt="Event Image" 
                width={400} 
                height={400} 
                className="rounded-lg" 
                draggable={false}
              />
            </div>
          </div>
        </div>

        <div className="mb-20">
          <ThreeModelling />
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-12">
          <div className="text-white mb-8">
            <h2 className={`${krona.className} text-3xl mb-4`}>Competition Format</h2>
            <p className="text-white/80">Guidelines for tower building competition</p>
          </div>
          <Rules />
        </div>

        {/* Rules Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
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
      </div>
    </main>
  );
}