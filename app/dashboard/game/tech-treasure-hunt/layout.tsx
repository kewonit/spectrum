import React from 'react';
import Image from 'next/image';

export default function TechTreasureHuntLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative isolate">
      {/* Full-screen background image with blur effect */}
      <div className="fixed inset-0 -z-10">
        <Image 
          src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1741030793/Spectrum/nadjib-br-51Ms-0PbCHo-unsplash_1_lthxrr.webp"
          alt="Tech Treasure Hunt Background" 
          fill
          priority
          draggable={false}
          className="object-cover w-full h-full brightness-[0.85] blur-[2px]"
          sizes="100vw"
          quality={85}
        />
        {/* Overlay to ensure content readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20"></div>
      </div>

      {/* Content area */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
