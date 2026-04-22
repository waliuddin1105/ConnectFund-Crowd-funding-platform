import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center animate-fadeIn">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your generosity. Your donation has been securely
          processed.
        </p>

        <Link
          to="/donor-dashboard"
          className="inline-block bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition"
        >
          Go to Dashboard
        </Link>

        <div className="mt-4">
          <Link to="/" className="text-sm text-green-700 underline">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
