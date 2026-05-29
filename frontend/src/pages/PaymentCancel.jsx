import { Link } from "react-router-dom";

const PaymentCancel = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-lg w-full bg-white shadow-xl rounded-3xl border border-slate-200 p-8 text-center">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 mb-6 text-left shadow-sm">
          <p className="font-semibold text-rose-800">Payment cancelled or failed</p>
          <p className="mt-2 text-sm text-rose-700">
            Your payment was not completed. Please try again or return to the app.
          </p>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Payment Cancelled</h1>
        <p className="mt-3 text-slate-600">
          Your payment was not completed. You can try again or return to the app.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-slate-800 px-5 py-3 text-white font-semibold hover:bg-slate-900"
          >
            Go back home
          </Link>
          <Link
            to={localStorage.getItem("roomId") ? `/e/${localStorage.getItem("roomId")}` : "/chat"}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-slate-700 font-semibold hover:bg-slate-100"
          >
            Return to Code IDE
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
