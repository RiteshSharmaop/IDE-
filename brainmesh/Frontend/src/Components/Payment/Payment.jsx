import React from "react";
import { Crown, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ParticleBackground from "../Layout/ParticleBackground";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

const stripePromise = loadStripe(import.meta.env.VITE_PUBLISHABLE_KEY);

const Payment = ({ setPaymentDone }) => {
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        console.error("Stripe failed to load");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const res = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }api/payment/create-checkout-session`,
        {}, // Empty object as payload since we don't need to send data
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      
      if (res.data.success) {
        const { url } = res.data;
        if (url) {
          window.location.href = url; // Redirect to Stripe
        } else {
          console.error("No checkout URL received from server");
        }
      } else {
        console.error("Payment session creation failed:", res.data);
      }



    } catch (error) {
      console.error("Payment error:", error);
      if (error.response?.status === 401) {
        // Handle unauthorized - maybe redirect to login
        console.error("Authentication failed. Please log in again.");
        // Optionally redirect to login
        // navigate('/login');
      } else {
        // Handle other errors
        console.error(
          "Failed to create payment session:",
          error.response?.data || error.message
        );
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white relative overflow-hidden">
      {/* Background Gradient Glow */}
      <ParticleBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-600/20 blur-3xl opacity-30" />

      {/* Payment Card */}
      <div className="relative z-10 bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <Crown className="text-yellow-400 w-12 h-12 mb-2" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Upgrade to Pro
          </h1>
          <p className="text-gray-400 text-center mt-2">
            Unlock{" "}
            <span className="text-purple-400 font-semibold">Multi-LLM</span> and
            premium features for just
          </p>
        </div>

        {/* Price Box */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-center shadow-lg mb-6">
          <p className="text-4xl font-extrabold">₹99</p>
          <p className="text-sm text-gray-200 mt-1">One-time subscription</p>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-6">
          {[
            "Life Time Access",
            "Access Multi-LLM mode",
            "Priority response speed",
            "Early access to new models",
          ].map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-gray-300">
              <CheckCircle className="text-green-400 w-5 h-5" />
              {feature}
            </li>
          ))}
        </ul>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 
                     hover:from-purple-700 hover:to-blue-700 
                     text-white font-semibold py-3 rounded-xl 
                     transition-all shadow-md cursor-pointer"
        >
          Pay ₹99 & Upgrade
        </button>

        {/* Cancel */}
        <button
          onClick={() => navigate("/")}
          className="mt-4 w-full text-gray-400 hover:text-gray-200 text-sm cursor-pointer"
        >
          Cancel & Go Back
        </button>
      </div>
    </div>
  );
};

export default Payment;
