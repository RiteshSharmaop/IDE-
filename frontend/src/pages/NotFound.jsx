import React from "react";
import FuzzyText from "@/components/FuzzyText"; // adjust import path as needed

export default function NotFound() {
  return (
    <div className="h-screen bg-[#171717] flex flex-col items-center justify-center text-center space-y-4 relative">
      <FuzzyText
        baseIntensity={0.2}
        hoverIntensity={0.5}
        enableHover={true}
        fontSize="clamp(3rem, 12vw, 10rem)"
      >
        404
      </FuzzyText>

      <FuzzyText
        baseIntensity={0.2}
        hoverIntensity={0.5}
        enableHover={true}
        fontSize="clamp(1.5rem, 5vw, 3rem)"
      >
        Not Found
      </FuzzyText>
      <div className="text-white absolute bottom-10 right-10 font-bold underline">
        This Page is under Working
      </div>
    </div>
  );
}
