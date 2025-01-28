"use client";

import React, { useEffect } from "react";
import "@/styles/cube-animation.css"
import Link from "next/link";

const spectrumText = `<p>PCET's <span>PIMPRI</span> CHINCHWAD COLLEGE OF ENGINEERING, Pune |&nbsp&nbsp&nbsp|
Department of <span>Applied Sciences</span> and Humanities presents 
|&nbsp&nbsp&nbsp|<span>Spectrum' 25</span> |&nbsp&nbsp&nbsp| Annual State Level Technical Symposium 
for Extra <span>Ordinary</span>&nbsp| First Year Engineering Students!&nbsp|</p>`;

export default function Hero() {
  useEffect(() => {
    const insertTextContent = () => {
      const textDivs = document.querySelectorAll(".text");
      textDivs.forEach((div) => {
        div.innerHTML = spectrumText;
      });
    };

    const contentDiv = document.querySelector(".content");
    const adjustContentSize = () => {
      const viewportWidth = window.innerWidth;
      const baseWidth = 1000;
      // Adjust scale factor calculation for better mobile display
      const scaleFactor = viewportWidth < baseWidth 
        ? Math.max((viewportWidth / baseWidth) * 0.95, 0.5) // Minimum scale of 0.5
        : 1;
      if (contentDiv) {
        (contentDiv as HTMLElement).style.transform = `scale(${scaleFactor})`;
      }
    };

    insertTextContent();
    adjustContentSize();
    window.addEventListener("resize", adjustContentSize);
    return () => window.removeEventListener("resize", adjustContentSize);
  }, []);

  return (
    <div className="hero-container">  {/* Add this wrapper class */}
      <div className="container">
        <div className="content">
          <div className="container-full">
            <div className="animated hue"></div>
            <img className="backgroundImage" 
                 src="https://drive.google.com/thumbnail?id=1_ZMV_LcmUXLsRokuz6WXGyN9zVCGfAHp&sz=w1920" 
                 alt="" />
            <img className="logoImage" 
                 src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705913782/Spectrum/Homepage/HKZuMdo_w2bis3.png" 
                 alt="Spectrum Logo" />
            <div className="container">
              <div className="cube">
                <div className="face top"></div>
                <div className="face bottom"></div>
                <div className="face left text"></div>
                <div className="face right text"></div>
                <div className="face front"></div>
                <div className="face back text"></div>
              </div>
            </div>
            <div className="container-reflect">
              <div className="cube">
                <div className="face top"></div>
                <div className="face bottom"></div>
                <div className="face left text"></div>
                <div className="face right text"></div>
                <div className="face front"></div>
                <div className="face back text"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}