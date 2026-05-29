import React, { useEffect, useRef } from "react";
import LightRays from "../components/LightRays";
import CardNav from "../components/CardNav";
import VariableProximity from "../components/VariableProximity";
import logo from "../assets/logo.png";
import LiquidEther from "../components/LiquidEther";
import { Link } from "react-router-dom";
import ThemeToggleButton from "../components/ThemeToggleButton";

import { useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";

const StartingPage = () => {
    const containerRef = useRef(null);
    const {socket , socketId} = useSocket();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        if (!socket) return;

        console.log("SocketID : " , socketId);
    

        return () => socket.off("receiveMessage");
    }, [socket, socketId]);

   

    const content =
        "HexaHub is a collaborative IDE\nbuilt for real-time coding,\nsharing, and teamwork.";
    return (
        <div className={`relative w-full h-screen overflow-hidden ${isDark ? "bg-[#06000F]" : "bg-[#F8FAFC]"}`}>
            <div className="absolute right-4 top-4 z-30">
                <ThemeToggleButton />
            </div>

            {/* Light rays background */}
            <LightRays
                raysOrigin="top-center"
                raysColor="#bebadb"
                raysSpeed={1.5}
                lightSpread={0.8}
                rayLength={1.2}
                followMouse={true}
                mouseInfluence={0.1}
                noiseAmount={0.1}
                distortion={0.05}
                className="custom-rays"
            />
            {/* <div style={{ width: "100%", height: "100%", position: "relative" }}>
                <LiquidEther
                    colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
                    mouseForce={20}
                    cursorSize={100}
                    isViscous={false}
                    viscous={30}
                    iterationsViscous={32}
                    iterationsPoisson={32}
                    resolution={0.5}
                    isBounce={false}
                    autoDemo={true}
                    autoSpeed={0.5}
                    autoIntensity={2.2}
                    takeoverDuration={0.25}
                    autoResumeDelay={3000}
                    autoRampDuration={0.6}
                />
            </div> */}

            {/* Transparent navbar */}
            <CardNav theme={theme} logo={logo} logoAlt="Company Logo" />

            <div className="absolute inset-0 flex items-center justify-center">
                <div ref={containerRef} className="text-center px-6">
                    <VariableProximity
                        label={content}
                        fromFontVariationSettings="'wght' 400, 'opsz' 9"
                        toFontVariationSettings="'wght' 1000, 'opsz' 40"
                        containerRef={containerRef}
                        radius={150}
                        falloff="linear"
                        style={{ fontSize: "58px" }}
                        className={`${isDark ? "text-white" : "text-[#0F172A]"} font-semibold tracking-wide text-2xl md:text-4xl cursor-pointer`}
                    />
                    {/* Sign in / Sign up buttons */}
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <Link
                            to="/signin"
                            type="button"
                            className={`${isDark ? "bg-white hover:bg-[#cbcaca] text-black" : "bg-slate-950 hover:bg-slate-800 text-white"} cursor-pointer px-6 py-3 rounded-full font-medium shadow-sm hover:opacity-95`}
                            aria-label="Sign in"
                        >
                            Sign In
                        </Link>

                        <Link
                            to="/signup"
                            type="button"
                            className={`${isDark ? "bg-white/10 text-white border border-white/20 hover:bg-white/20" : "bg-white text-slate-950 border border-slate-300 hover:bg-slate-100"} cursor-pointer px-6 py-3 rounded-full font-medium backdrop-blur-sm`}
                            aria-label="Sign up"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StartingPage;
