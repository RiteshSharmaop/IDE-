import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "../lib/api";
import ThemeToggleButton from "../components/ThemeToggleButton";
import { useTheme } from "../context/ThemeContext";

const PaymentSuccess = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [redirectSeconds, setRedirectSeconds] = useState(5);
  const [redirectPath, setRedirectPath] = useState("/chat");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setStatus("error");
      setMessage("Missing payment session ID. Please return to the app and try again.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setStatus("error");
          setMessage("You need to sign in to verify your payment. Please log in and reopen this page.");
          return;
        }

        const response = await apiClient.post("/payment/verify-payment", {
          sessionId,
        });

        if (response.data?.success) {
          setStatus("success");
          const successMessage = response.data?.message || "Your payment was verified successfully.";
          setMessage(successMessage);

          const roomId = localStorage.getItem("roomId");
          const targetPath = roomId ? `/e/${roomId}` : "/chat";
          setRedirectPath(targetPath);
          localStorage.setItem(
            "paymentAlert",
            JSON.stringify({
              type: "success",
              message: successMessage,
            })
          );
        } else {
          setStatus("error");
          setMessage(response.data?.error || "Payment verification failed. Please contact support.");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setStatus("error");
        setMessage(
          err.response?.data?.error ||
            err.message ||
            "Unable to verify payment right now. Please refresh or try again later."
        );
      }
    };

    verifyPayment();
  }, [location.search]);

  useEffect(() => {
    if (status !== "success") return;

    const timer = setInterval(() => {
      setRedirectSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(redirectPath);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate, redirectPath]);

  const renderContent = () => {
    if (status === "loading") {
      return <p className={`mt-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Verifying payment, please wait...</p>;
    }

    if (status === "success") {
      return (
        <div className="space-y-4">
          <div className={`rounded-2xl border p-5 text-left shadow-sm ${
            isDark
              ? "border-emerald-400/30 bg-emerald-500/10"
              : "border-emerald-200 bg-emerald-50"
          }`}>
            <p className={`font-semibold ${isDark ? "text-emerald-200" : "text-emerald-800"}`}>Payment successful!</p>
            <p className={`mt-2 text-sm ${isDark ? "text-emerald-100/80" : "text-emerald-700"}`}>{message}</p>
            <p className={`mt-3 text-xs ${isDark ? "text-emerald-200/80" : "text-emerald-600"}`}>
              Redirecting to your code IDE in {redirectSeconds} second{redirectSeconds === 1 ? "" : "s"}...
            </p>
          </div>
          <Link
            to={redirectPath}
            className={`inline-flex items-center justify-center rounded-full px-5 py-3 font-semibold ${
              isDark
                ? "bg-indigo-400 text-slate-950 hover:bg-indigo-300"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            Go to Code IDE now
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className={isDark ? "text-red-200" : "text-red-600"}>{message}</p>
        <Link
          to="/"
          className={`inline-flex items-center justify-center rounded-full px-5 py-3 font-semibold ${
            isDark
              ? "bg-slate-200 text-slate-950 hover:bg-white"
              : "bg-slate-800 text-white hover:bg-slate-900"
          }`}
        >
          Go back to homepage
        </Link>
      </div>
    );
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center px-4 py-12 ${isDark ? "bg-[#020617]" : "bg-slate-50"}`}>
      <div className="absolute right-4 top-4 z-30">
        <ThemeToggleButton />
      </div>
      <div className={`max-w-lg w-full shadow-xl rounded-3xl border p-8 text-center ${
        isDark
          ? "bg-[#0F172A] border-slate-700 text-white"
          : "bg-white border-slate-200 text-slate-900"
      }`}>
        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Payment Success</h1>
        <p className={`mt-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Your payment is being verified with the backend.</p>
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentSuccess;
