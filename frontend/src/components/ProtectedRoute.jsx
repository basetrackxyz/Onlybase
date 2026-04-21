import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, checked } = useAuth();
  const location = useLocation();

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-black flex items-center justify-center text-black dark:text-white">
        <div className="text-sm text-gray-500 dark:text-zinc-500">Loading…</div>
      </div>
    );
  }

  if (!user || user === false) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
