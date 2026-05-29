import React from "react";
import { XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ParticleBackground from "../Layout/ParticleBackground";


const PaymentCancel = () => {

  
  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white relative overflow-hidden">
      <ParticleBackground/>

      <div className="relative z-10 bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 p-10 rounded-2xl shadow-xl text-center max-w-md w-full">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Payment Cancelled
        </h1>
        <p className="text-gray-300 mb-6">
          Your payment was not completed. You can try again to unlock Multi-LLM Pro.
        </p>
        <Link
          to="/payment"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-xl font-medium transition-all"
        >
          Try Again
        </Link>
          <Link
            to="/chat"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-xl font-medium transition-all"
          >
            Home
            </Link>
      </div>
    </div>
  );
};

export default PaymentCancel;
