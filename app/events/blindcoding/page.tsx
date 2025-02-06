import { Rules } from "@/app/events/blindcoding/components/accordian"
import { BlindCoding_registarion } from "@/app/events/blindcoding/components/registration";
import { Krona_One } from 'next/font/google'
import Image from "next/image";

import { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Spectrum x Blind Coding',
  description: "Tech event for first year students",  
  openGraph: {
    title: 'Spectrum x Blind Coding',
    description: "Tech event for first year students",  
    url: "https://pccoespectrum.tech",
    siteName: "pccoespectrum.tech",
    images: [
      {
        url: "https://i.imgur.com/rmVmQ7C.png",
        width: 548,
        height: 253,
        alt: 'Image',
      },
    ],
  }, 
}

const korna = Krona_One({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: '400', 
});

const ruleList = [
  "Event will be team-based (Each team can have a minimum of 2 members and maximum of 3)",
  "Event will be divided into 5 rounds.",
  "Scientific Calculators are allowed for the first round of the event.",
  "Participants will have to carry their own stationary (Calculators, pens, etc).",
  "Personal computers, electronic/Blind Coding components are not allowed for use during the event.",
  "The use of A.I. chatbots like ChatGPT is strictly prohibited.",
  "Participants are not allowed to use mobile phones, smartwatches, or any other electronic devices.",
  "Participants will be strictly monitored, and volunteers will be available to provide assistance if necessary.",
  "Each round will have a specified time limit that participants must adhere to.",
  "The final decision will be based on computerized results and made by the event coordinators.",
  "The decision of the event coordinators is final and binding, not subject to contestation.",
  "The organizers reserve the right to change or update the contest rules, and participants are responsible for staying informed.",
  "Violation of any rule may result in immediate disqualification.",
  "All the participants must return the electronic components provided to them after the event",
  "The team would be held responsible for any damage caused to Blind Coding components due to mishandling or carelessness, and would be required to pay a fine.",
  "Spot entries will be accepted until the team registration limit is reached."
];

export default function Home() {
  return (
    <main className="overflow-hidden max-w-7xl mx-auto px-6 bg-[#EBE9E0]">
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 md:gap-8 py-6 md:py-12 px-4 md:px-8">
        <div className="w-full md:w-1/3 flex justify-center md:justify-start">
          <Image  
            width="400" 
            height="360" 
            alt="Blind Coding Event Image" 
            src="https://i.imgur.com/d4vCa0X.png" 
            loading="lazy" 
            draggable="false"
            className="w-[280px] sm:w-[320px] md:w-[400px] h-auto object-contain"
          />
        </div>
        
        <div className={`${korna.className} w-full md:w-2/3 text-left`}>
          <div className="space-y-2 md:space-y-4">
            <h1 className="font-jacques_francois_shadow scroll-m-20 text-3xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-black tracking-tight">
              Blind Coding &apos;25
            </h1>
            <h2 className="font-jacques_francois_shadow scroll-m-20 text-md sm:text-3xl md:text-3xl lg:text-4xl font-extrabold text-black tracking-tight">
              brought to you by AS&H, PCCOE
            </h2>
          </div>
        </div>
      </div>

      <div 
        className="relative my-12 aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9] w-full"
        style={{
          backgroundImage: "url('https://res.cloudinary.com/dfyrk32ua/image/upload/v1737645289/Spectrum/side-images/download_i1d7aq.webp')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundColor: '#EBE9E0',
          opacity: 0.9,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <h3 className={`${korna.className} scroll-m-20 text-xl md:text-2xl lg:text-3xl font-extrabold text-black tracking-tight text-center max-w-4xl`}>
            Embark on an entertaining journey that blends exploring basic and fun electronics with an enjoyable twist!
            Play real-life snake and ladders in our Circuit Safari game for an unforgettable and fun-filled experience!
          </h3>
        </div>
      </div>

      <picture> 
        <img className="mx-auto my-4 sm:my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" draggable="false" />
      </picture> 
      <BlindCoding_registarion />
      <picture> 
        <img className="mx-auto my-4 sm:my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" draggable="false" />
      </picture> 
      <Rules /> 
      <hr/>
      <picture> 
        <img className="mx-auto my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" draggable="false" />
      </picture> 
      <div className="text-gray-700 leading-7 mb-4 p-2 sm:p-4 md:p-6 lg:p-8">
        <h1>Rule Book :</h1>
        <ul className="space-y-1 mt-4">
          {ruleList.map((rule, idx) => (
            <li key={idx}>{idx + 1}. {rule}</li>
          ))}
        </ul>
      </div>
      <picture> 
        <img className="mx-auto my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1737645290/Spectrum/side-images/f_htarul.webp" draggable="false" />
      </picture> 
    </main>
  );
}