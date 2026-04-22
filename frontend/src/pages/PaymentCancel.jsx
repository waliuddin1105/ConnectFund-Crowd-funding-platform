import { XCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center animate-fadeIn">
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-red-700 mb-2">
          Payment Canceled
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment was not completed. You can try again anytime.
        </p>

        <Link
          to="/all-campaigns"
          className="inline-block bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition"
        >
          Try Again
        </Link>

        <div className="mt-4">
          <Link to="/" className="text-sm text-red-700 underline">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
