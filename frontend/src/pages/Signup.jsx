import React from "react";
import AnimatedBackground from "../animation/AnimatedBackground";
import { SignupCard } from "../components/pagesCard/SignupCard";

const Signup = () => {
    return (
        <div className="bg-[#0A0A0A] min-h-screen flex">
            {/* Left side - animated text */}
            <div className="w-[60%] flex items-center justify-center relative overflow-hidden">
                <AnimatedBackground />
            </div>

            {/* Right side - login card */}
            <div className="w-[40%]  flex items-center justify-center">
                <SignupCard />
            </div>
        </div>
        
    );
};

export default Signup;
