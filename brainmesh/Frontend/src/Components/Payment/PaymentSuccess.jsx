import React from "react";
import { CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ParticleBackground from "../Layout/ParticleBackground";
import axios from "axios";

const PaymentSuccess = ({ setPaymentDone }) => {
  const navigate = useNavigate();
  const handleSucces = async () => {
    try {
      const token = localStorage.getItem("token");
      // Verify payment on backend
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}api/payment/verify-payment`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setPaymentDone(true);
        localStorage.setItem("paymentStatus", "paid"); // Store payment status
        navigate("/chat");
      } else {
        console.error("Payment verification failed");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
    }
  };
  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white relative overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 p-10 rounded-2xl shadow-xl text-center max-w-md w-full">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Payment Successful 🎉
        </h1>
        <p className="text-gray-300 mb-6">
          Thank you for subscribing! Your Multi-LLM Pro access is now active.
        </p>
        <button
          onClick={handleSucces}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-xl font-medium transition-all"
        >
          Go to Chat
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
