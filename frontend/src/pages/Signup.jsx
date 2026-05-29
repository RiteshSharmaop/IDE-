import React from "react";
import AnimatedBackground from "../animation/AnimatedBackground";
import { SignupCard } from "../components/pagesCard/SignupCard";
import ThemeToggleButton from "../components/ThemeToggleButton";
import { useTheme } from "../context/ThemeContext";

const Signup = () => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className={`relative min-h-screen flex ${isDark ? "bg-[#0A0A0A] text-[#F5F5F5]" : "bg-[#F6F7FB] text-[#1F2937]"}`}>
            <div className="absolute right-4 top-4 z-20">
                <ThemeToggleButton />
            </div>

            {/* Left side - animated text */}
            <div className="w-[60%] flex items-center justify-center relative overflow-hidden">
                <AnimatedBackground theme={theme} />
            </div>

            {/* Right side - login card */}
            <div className="w-[40%] flex items-center justify-center">
                <div className={`rounded-3xl p-2 ${isDark ? "bg-[#0F0F0F]/70 border border-[#3E3F3E]" : "bg-white/90 border border-slate-200"}`}>
                    <SignupCard />
                </div>
            </div>
        </div>
        
    );
};

export default Signup;
