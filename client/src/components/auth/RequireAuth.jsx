// src/auth/RequireAuth.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function decodeJwtExp(token) {
  try {
    const part = token.split(".")[1];
    // base64url -> base64
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    const payload = JSON.parse(json);
    return typeof payload.exp === "number" ? payload.exp : null; // seconds
  } catch {
    return null;
  }
}

export default function RequireAuth({ children }) {
  const [state, setState] = useState({ checked: false, ok: false });

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found in localStorage");
      return setState({ checked: true, ok: false });
    }

    // 1) Local check: exp not expired (allow 30s skew)
    const exp = decodeJwtExp(token);
    if (exp && exp * 1000 <= Date.now() + 30_000) {
      console.log("Token expired locally");
      return setState({ checked: true, ok: false });
    }

    // 2) Server check: prove token works on API
    try {
      console.log("Checking token with server...");
      const res = await fetch("https://car-invoicing.vercel.app/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Server response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.log("Server error response:", errorText);
      }

      setState({ checked: true, ok: res.ok });
    } catch (error) {
      console.log("Network error during auth check:", error);
      setState({ checked: true, ok: false });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Listen for storage changes (when token is updated)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" && e.newValue) {
        console.log("Token updated, re-checking authentication...");
        setState({ checked: false, ok: false });
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (!state.checked) {
    return <div className="p-6 text-gray-600">Loading…</div>;
  }
  if (!state.ok) {
    // clean up stale token so we don't loop
    console.log("Authentication failed, redirecting to login");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    return <Navigate to="/login" replace />;
  }
  return children;
}
