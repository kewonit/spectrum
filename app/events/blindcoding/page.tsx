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

export default function Home() {
  return (
    <main className="overflow-hidden max-w-7xl mx-auto px-8 bg-[#EBE9E0]">
      <div className={korna.className}>
        <h1 className="font-jacques_francois_shadow scroll-m-20 pt-8 text-4xl md:text-7xl font-extrabold text-gray-800 tracking-tight lg:text-9xl">
        Blind Coding &apos;25
        </h1>
        <br/>
        <h2 className="font-jacques_francois_shadow scroll-m-20 pl-2 text-2xl font-extrabold text-gray-800 tracking-tight lg:text-5xl">
          brought to you by AS&H, PCCOE
        </h2>
      </div>
      <Image className="mx-auto mt-4" width="500" height="450" alt="image" src="https://i.imgur.com/d4vCa0X.png" />
      <div>
      <h3 className="font-jacques_francois_shadow text-center scroll-m-20 my-4 pl-2 text-xl font-extrabold text-gray-800 tracking-tight md:text-3xl lg:text-5xl">
        Embark on an entertaining journey that blends exploring basic and fun electronics with an enjoyable twist! <br/>
        Play real-life snake and ladders in our Circuit Safari game for an unforgettable and fun-filled experience! <br/>
      </h3>
      </div>
      <picture> 
        <img className="mx-auto my-16" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
      </picture> 
      <BlindCoding_registarion />
      <picture> 
      <img className="mx-auto my-16" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
      </picture> 
        <Rules /> 
    <hr/>
    <picture> 
      <img className="mx-auto my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
    </picture> 
    {/* <div className="text-gray-700 leading-7 mb-4 p-2 lg:p-8">
        <h1>Note :</h1>
        <p className="leading-7">
        •	Event will be team-based (Each team can have a minimum of 2 members and maximum of 3) <br/>
        •	Event will be divided into 5 rounds. <br/>
        •	Scientific Calculators are allowed for the first round of the event. <br/>
        •	Participants will have to carry their own stationary (Calculators, pens, etc). <br/>
        •	Personal computers, electronic/Blind Codingl components are not allowed for use during the event. <br/>
        •	The use of A.I. chatbots like ChatGPT is strictly prohibited. <br/>
        •	Participants are not allowed to use mobile phones, smartwatches, or any other electronic devices. <br/>
        •	Participants will be strictly monitored, and volunteers will be available to provide assistance if necessary. <br/>
        •	Each round will have a specified time limit that participants must adhere to. <br/>
        •	The final decision will be based on computerized results and made by the event coordinators. <br/>
        •	The decision of the event coordinators is final and binding, not subject to contestation. <br/>
        •	The organizers reserve the right to change or update the contest rules, and participants are responsible for staying informed. <br/>
        •	Violation of any rule may result in immediate disqualification. <br/>
        •	All the participants must return the electronic components provided to them after the event <br/>
        •	The team would be held responsible for any damage caused to Blind Codingl components due to mishandling or carelessness, and would be required to pay a fine. <br/>
        •	Spot entries will be accepted until the team registration limit is reached. <br/>
        </p>
        </div> */}
        {/* <TableInfo /> */}
    </main>
  );

}