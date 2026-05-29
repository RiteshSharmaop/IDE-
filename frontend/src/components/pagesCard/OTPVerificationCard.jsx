import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useRoom } from "../../context/RoomContext";
import { useTheme } from "../../context/ThemeContext";

export function OTPVerificationCard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { signin } = useAuth();
  const { setRoomId } = useRoom();
  const inputRefs = useRef([]);

  // Get email from location state or localStorage
  useEffect(() => {
    const state = location.state;
    if (state?.email) {
      setEmail(state.email);
    } else {
      const storedEmail = localStorage.getItem("signupEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        navigate("/signup");
      }
    }
  }, [location, navigate]);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOTPChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d{1,6}$/.test(paste)) {
      setError("Please paste a valid OTP (numbers only)");
      return;
    }
    const newOtp = paste.split("").concat(Array(6 - paste.length).fill(""));
    setOtp(newOtp);
    if (paste.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.post("/auth/verify-otp", {
        email,
        otp: otpString,
      });

      if (res?.data?.success) {
        const token = res.data.data?.token;
        const user = res.data.data?.user;

        setSuccess("Email verified successfully! Redirecting...");

        if (token) {
          signin(token, user);
          localStorage.removeItem("signupEmail");

          // Create and join room
          const createdRoomId = crypto.randomUUID();
          setRoomId(createdRoomId);

          setTimeout(() => {
            navigate(`/e/${createdRoomId}`);
          }, 1500);
        }
      } else {
        setError(res?.data?.message || "OTP verification failed");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.post("/auth/resend-otp", { email });

      if (res?.data?.success) {
        setSuccess("OTP resent successfully");
        setOtp(["", "", "", "", "", ""]);
        setResendTimer(60); // 60 second timer
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(res?.data?.message || "Failed to resend OTP");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Server error");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Card className={`relative w-full max-w-lg shadow-lg z-10 border ${
      isDark
        ? "bg-[#171717] text-[#D0D0D0] border-[#3E3F3E]"
        : "bg-white text-slate-900 border-slate-200"
    }`}>
      <CardHeader>
        <CardTitle className={isDark ? "text-white text-xl font-semibold" : "text-slate-950 text-xl font-semibold"}>
          Verify Your Email
        </CardTitle>
        <CardDescription className={isDark ? "text-[#D0D0D0]" : "text-slate-600"}>
          Enter the 6-digit OTP sent to {email}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleVerifyOTP}>
          <div className="flex flex-col gap-6">
            {/* OTP Input Fields */}
            <div className="grid gap-2">
              <Label className={isDark ? "text-[#D0D0D0]" : "text-slate-700"}>Enter OTP</Label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={isDark
                      ? "w-12 h-12 text-center text-xl font-bold bg-[#212121] border border-[#3E3F3E] text-[#D0D0D0] placeholder-[#3E3F3E] focus:ring-[#D0D0D0] focus:border-[#D0D0D0]"
                      : "w-12 h-12 text-center text-xl font-bold bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-slate-500 focus:border-slate-500"
                    }
                    placeholder="-"
                  />
                ))}
              </div>
              <p className={`text-xs text-center ${isDark ? "text-[#7f8c8d]" : "text-slate-500"}`}>
                OTP is valid for 10 minutes
              </p>
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-3">
        <Button
          type="submit"
          onClick={handleVerifyOTP}
          disabled={loading || otp.join("").length !== 6}
          className={isDark
            ? "w-full cursor-pointer hover:bg-[#3E3F3E] bg-white text-black hover:text-[#D0D0D0]"
            : "w-full cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
          }
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>

        {error && <div className="text-sm text-red-400 text-center">{error}</div>}
        {success && (
          <div className="text-sm text-green-400 text-center">{success}</div>
        )}

        <Button
          type="button"
          onClick={handleResendOTP}
          disabled={resendLoading || resendTimer > 0}
          variant="outline"
          className={isDark
            ? "w-full cursor-pointer border border-[#3E3F3E] bg-[#3e3f3eaf] hover:bg-[#6260608e] text-white hover:text-white"
            : "w-full cursor-pointer border border-slate-300 bg-white hover:bg-slate-100 text-slate-900"
          }
        >
          {resendLoading ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
        </Button>

        <Button
          type="button"
          variant="link"
          onClick={() => navigate("/signup")}
          className={isDark ? "text-[#D0D0D0] cursor-pointer hover:text-white text-sm" : "text-slate-700 cursor-pointer hover:text-slate-950 text-sm"}
        >
          Back to Sign Up
        </Button>
      </CardFooter>
    </Card>
  );
}
