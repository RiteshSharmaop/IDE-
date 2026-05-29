import React from "react";
import FuzzyText from "@/components/FuzzyText"; // adjust import path as needed
import ThemeToggleButton from "../components/ThemeToggleButton";
import { useTheme } from "../context/ThemeContext";

export default function NotFound() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`relative h-screen flex flex-col items-center justify-center text-center space-y-4 ${isDark ? "bg-[#171717] text-white" : "bg-[#F6F7FB] text-slate-900"}`}>
      <div className="absolute right-4 top-4 z-30">
        <ThemeToggleButton />
      </div>
      <FuzzyText
        baseIntensity={0.2}
        hoverIntensity={0.5}
        enableHover={true}
        fontSize="clamp(3rem, 12vw, 10rem)"
        color={isDark ? "#ffffff" : "#1e293b"}
      >
        404
      </FuzzyText>

      <FuzzyText
        baseIntensity={0.2}
        hoverIntensity={0.5}
        enableHover={true}
        fontSize="clamp(1.5rem, 5vw, 3rem)"
        color={isDark ? "#ffffff" : "#1e293b"}
      >
        Not Found
      </FuzzyText>
      <div className={`absolute bottom-10 right-10 font-bold underline ${isDark ? "text-white" : "text-slate-800"}`}>
        This Page is under Working
      </div>
    </div>
  );
}
