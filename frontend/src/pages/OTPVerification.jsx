import React from "react";
import AnimatedBackground from "../animation/AnimatedBackground";
import { OTPVerificationCard } from "../components/pagesCard/OTPVerificationCard";

const OTPVerification = () => {
  return (
    <div className="bg-[#0A0A0A] min-h-screen flex">
      {/* Left side - animated text */}
      <div className="w-[60%] flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
      </div>

      {/* Right side - OTP verification card */}
      <div className="w-[40%] flex items-center justify-center">
        <OTPVerificationCard />
      </div>
    </div>
  );
};

export default OTPVerification;
