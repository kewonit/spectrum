import { Rules } from "@/app/events/chem-prastuti/components/accordian"
import { Chem_prastuti_registarion } from "@/app/events/chem-prastuti/components/registration";
import { Krona_One } from 'next/font/google'
import Image from "next/image";

import { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Spectrum x Chem Prastuti',
  description: "Tech event for first year students",  
  openGraph: {
    title: 'Spectrum x Chem Prastuti',
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
        Chem Prastuti&apos;25
        </h1>
        <br/>
        <h2 className="font-jacques_francois_shadow scroll-m-20 pl-2 text-2xl font-extrabold text-gray-800 tracking-tight lg:text-5xl">
          brought to you by AS&H, PCCOE
        </h2>
      </div>
      <picture>
        <img className="mx-auto mt-4" width="500" height="450" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931668/Spectrum/shapes/HDSxk4q-min_q2zc7k.png" />
      </picture>
      <div>
      <h3 className="font-jacques_francois_shadow text-center scroll-m-20 my-4 pl-2 text-xl font-extrabold text-gray-800 tracking-tight md:text-3xl lg:text-5xl">
        A Chemistry presentation event!
      </h3>
      </div>
      <picture> 
        <img className="mx-auto my-16" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
      </picture> 
      <Chem_prastuti_registarion />
      <picture> 
        <img className="mx-auto my-16" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
      </picture> 
        <Rules /> 
    <hr/>
    <picture> 
      <img className="mx-auto my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
    </picture> 
    <div className="text-gray-700 leading-7 mb-4 p-2 lg:p-8">
        <h1>Team Formation :</h1>
        <p className="leading-7">
        1. Team can have maximum of 2 participants from FY. B.Tech. <br/>
        </p>
        <h1 className="pt-12">Presentation Rules :</h1>
        <p className="leading-7">
          1. The paper submitted will have to be presented during the event. <br/>
          2. Hard as well as soft copies of the paper are to be submitted well in advance to the coordinators before presentation on mail id: engg.chem2010@gmail.com<br/>
          3. The Teams will get 8 minutes to present their paper. And 2 minutes will be for questioning by judges.<br/>
          4. The participants will have to present their papers in MS-Power Point (ppt) format only.<br/>
          5. Violation of any rule can result in rejection of paper.<br/>
          6. Spot Entries will not accept.<br/>
          7. Directly copying from the Internet is strongly discouraged and will not be entertained. (Plagiarism up to 20% will be accepted).<br/>
          8. Decision of the judges and the event heads shall be treated as final and binding on all and cannot be contested.<br/>
          9. The organizers reserve the right to change/update the rules of the contest at any point of time and will do their best to inform to participants of the same. However, it is ultimately the responsibility of the teams to keep themselves updated
        </p>
        <h1 className="pt-12">Paper/Presentation Format Rules :</h1>
        <p className="leading-7">
        The presentation (PPT) should be in proper format.<br/>
        1. Font style for text: Times New Roman.<br/>
        2. Font size for text: 18 points.<br/>
        3. Font size for headings: 22 points bold.<br/>
        3. Font size for sub-headings: 20 points.<br/>
        4. Margin of 1 inches from all sides.
        </p>
        </div>
    </main>
  );

}