import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import LocalFont from "next/font/local";
import Navigation from '@/components/navigation'
import Footer  from '@/components/footer'
import './globals.css'
import Script from 'next/script'
import { cn } from "@/app/libs/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const calSans = LocalFont({
  src: "../public/fonts/CalSans-SemiBold.ttf",
  variable: "--font-calsans",
});


export const metadata: Metadata = {
  metadataBase: new URL('https://www.spectrumpccoe25.tech/'),
  title: {
    default: "PCCOE Spectrum'25",
    template: "%s | spectrumpccoe25.tech",
  },
  description: "PCCOE Spectrum'25 | PCET's PIMPRI CHINCHWAD COLLEGE OF ENGINEERING, Pune | Department of Applied Sciences and Humanities presents | Tech event for first year students | Annual State Level Technical Symposium for Extra Oridinary First Year Engineering Students!",
  openGraph: {
    title: "PCCOE Spectrum'25",
    description: "PCCOE Spectrum'25 | PCET's PIMPRI CHINCHWAD COLLEGE OF ENGINEERING, Pune | Department of Applied Sciences and Humanities presents | Tech event for first year students | Annual State Level Technical Symposium for Extra Oridinary First Year Engineering Students!",
    url: "https://pccoespectrum25.tech",
    siteName: "spectrumpccoe25.tech",
    images: [
      {
        url: "https://res.cloudinary.com/dfyrk32ua/image/upload/v1738270628/Spectrum/2024/Frame_11_fkprme.webp",
        width: 1548,
        height: 715,
        alt: 'Image',
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={[inter.variable, calSans.variable].join(" ")}>
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-BN0TDQ03XE`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-BN0TDQ03XE');
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Navigation />
        <Script src='https://www.cssscript.com/demo/cat-follow-cursor-oneko/oneko.js' />
        {children}
        <Footer />
      </body>
    </html> 
  )
}