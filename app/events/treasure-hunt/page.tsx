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

export default function Home() {
  return (
    <main className="overflow-hidden max-w-7xl mx-auto px-8 bg-[#EBE9E0]">
      <div className={korna.className}>
        <h1 className="font-jacques_francois_shadow scroll-m-20 pt-8 text-4xl md:text-7xl font-extrabold text-gray-800 tracking-tight lg:text-9xl">
        Treasure Hunt&apos;25
        </h1>
        <br/>
        <h2 className="font-jacques_francois_shadow scroll-m-20 pl-2 text-2xl font-extrabold text-gray-800 tracking-tight lg:text-5xl">
          brought to you by AS&H, PCCOE
        </h2>
      </div>
      <Image className="mx-auto mt-4" width="700" height="450" alt="image" src="https://i.imgur.com/W5W9DYW.png" />
      <div>
      <h3 className="font-jacques_francois_shadow text-center scroll-m-20 my-4 pl-2 text-xl font-extrabold text-gray-800 tracking-tight md:text-3xl lg:text-5xl">
      Each team should consist of 4 people. <br/>
      The competition will be conducted in hybrid mode.
      </h3>
      </div>
      <picture> 
        <img className="mx-auto my-16" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
      </picture> 
      <Treasurehunt_registarion />
      <picture> 
        <img className="mx-auto my-16" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
      </picture> 
        <Rules /> 
         <hr/>
        {/*  <Image className="mx-auto my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />*/} 
    <div className="text-gray-700 leading-7 mb-4 p-4 lg:p-8">
        <h1>Note :</h1>
        <p className="leading-7">
          1.	Each team should consist of 4 people.  <br/>
          2.	The competition will be conducted in hybrid mode. <br/>
          3.	The use of A.I. chatbots like ChatGPT is strictly prohibited. <br/>
          4.	Participants are not allowed to use laptops, smartwatches. <br/>
          5.	Strict monitoring of participants will be implemented, with assistance from volunteers if necessary. <br/>
          6.	Each round will have a specified time limit that participants must adhere to. <br/>
          7.	The final decision will be based on computerized results and made by the event coordinators. <br/>
          8.	The decision of the event coordinators is final and binding, not subject to contestation. <br/>
          9.	The organizers may make changes or updates to the contest rules, and participants are kindly encouraged to stay informed of the same. <br/>
          10.	Violation of any rule may result in immediate disqualification.
        </p>
        </div>
    </main>
  );

}