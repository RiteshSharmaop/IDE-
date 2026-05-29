import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "../lib/api";

const PaymentSuccess = () => {
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
      return <p className="mt-4">Verifying payment, please wait...</p>;
    }

    if (status === "success") {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-left shadow-sm">
            <p className="font-semibold text-green-800">Payment successful!</p>
            <p className="mt-2 text-sm text-green-700">{message}</p>
            <p className="mt-3 text-xs text-green-600">
              Redirecting to your code IDE in {redirectSeconds} second{redirectSeconds === 1 ? "" : "s"}...
            </p>
          </div>
          <Link
            to={redirectPath}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-white font-semibold hover:bg-indigo-700"
          >
            Go to Code IDE now
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-red-600">{message}</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-slate-800 px-5 py-3 text-white font-semibold hover:bg-slate-900"
        >
          Go back to homepage
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-lg w-full bg-white shadow-xl rounded-3xl border border-slate-200 p-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Payment Success</h1>
        <p className="mt-3 text-slate-600">Your payment is being verified with the backend.</p>
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentSuccess;
