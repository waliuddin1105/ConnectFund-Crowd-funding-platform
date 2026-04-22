import React from "react";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UnauthorizedBox = ({message}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-2xl p-8 max-w-md w-full text-center border border-gray-200">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="h-14 w-14 text-red-500" />
        </div>

        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-6">
          You are not authorized to view this page. {message? message : ''}
        </p>

        <div className="flex justify-center gap-3">
          <Button
            onClick={() => navigate("/")}
            variant="default"
            className="rounded-xl px-6"
          >
            Go Home
          </Button>
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="rounded-xl px-6"
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedBox;
