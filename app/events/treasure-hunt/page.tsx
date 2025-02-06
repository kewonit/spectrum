import { Rules } from "@/app/events/treasure-hunt/components/accordian"
import { Treasurehunt_registarion } from "@/app/events/treasure-hunt/components/registration";
import { Krona_One } from 'next/font/google'
import Image from "next/image";

import { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Spectrum x Treasure Hunt',
  description: "Tech event for first year students",  
  openGraph: {
    title: 'Spectrum x Treasure Hunt',
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
  "1. Each team should consist of 4 people.",
  "2. The competition will be conducted in hybrid mode.",
  "3. The use of A.I. chatbots like ChatGPT is strictly prohibited.",
  "4. Participants are not allowed to use laptops, smartwatches.",
  "5. Strict monitoring of participants will be implemented, with assistance from volunteers if necessary.",
  "6. Each round will have a specified time limit that participants must adhere to.",
  "7. The final decision will be based on computerized results and made by the event coordinators.",
  "8. The decision of the event coordinators is final and binding, not subject to contestation.",
  "9. The organizers may make changes or updates to the contest rules, and participants are kindly encouraged to stay informed of the same.",
  "10. Violation of any rule may result in immediate disqualification."
];

export default function Home() {
  return (
    <main className="overflow-hidden max-w-7xl mx-auto px-6 bg-[#EBE9E0]">
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 md:gap-8 py-6 md:py-12 px-4 md:px-8">
        <div className="w-full md:w-1/3 flex justify-center md:justify-start">
          <Image  
            width="400" 
            height="360" 
            alt="Treasure Hunt Event Image" 
            src="https://i.imgur.com/W5W9DYW.png" 
            loading="lazy" 
            draggable="false"
            className="w-[280px] sm:w-[320px] md:w-[400px] h-auto object-contain"
          />
        </div>
        
        <div className={`${korna.className} w-full md:w-2/3 text-left`}>
          <div className="space-y-2 md:space-y-4">
            <h1 className="font-jacques_francois_shadow scroll-m-20 text-3xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-black tracking-tight">
              Treasure Hunt &apos;25
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
            Each team should consist of 4 people. The competition will be conducted in hybrid mode.
          </h3>
        </div>
      </div>

      <picture> 
        <img className="mx-auto my-4 sm:my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" draggable="false" />
      </picture> 
      <Treasurehunt_registarion />
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
            <li key={idx}>{rule}</li>
          ))}
        </ul>
      </div>
      <picture> 
        <img className="mx-auto my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1737645290/Spectrum/side-images/f_htarul.webp" draggable="false" />
      </picture> 
    </main>
  );
}