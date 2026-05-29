import { Link } from "react-router-dom";
import ThemeToggleButton from "../components/ThemeToggleButton";
import { useTheme } from "../context/ThemeContext";

const PaymentCancel = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
        <div className={`rounded-2xl border p-5 mb-6 text-left shadow-sm ${
          isDark
            ? "border-rose-400/30 bg-rose-500/10"
            : "border-rose-200 bg-rose-50"
        }`}>
          <p className={`font-semibold ${isDark ? "text-rose-200" : "text-rose-800"}`}>Payment cancelled or failed</p>
          <p className={`mt-2 text-sm ${isDark ? "text-rose-100/80" : "text-rose-700"}`}>
            Your payment was not completed. Please try again or return to the app.
          </p>
        </div>
        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Payment Cancelled</h1>
        <p className={`mt-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          Your payment was not completed. You can try again or return to the app.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className={`inline-flex items-center justify-center rounded-full px-5 py-3 font-semibold ${
              isDark
                ? "bg-slate-200 text-slate-950 hover:bg-white"
                : "bg-slate-800 text-white hover:bg-slate-900"
            }`}
          >
            Go back home
          </Link>
          <Link
            to={localStorage.getItem("roomId") ? `/e/${localStorage.getItem("roomId")}` : "/chat"}
            className={`inline-flex items-center justify-center rounded-full border px-5 py-3 font-semibold ${
              isDark
                ? "border-slate-600 text-slate-100 hover:bg-slate-800"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Return to Code IDE
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
