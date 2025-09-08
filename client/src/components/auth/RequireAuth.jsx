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

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return setState({ checked: true, ok: false });

      // 1) Local check: exp not expired (allow 30s skew)
      const exp = decodeJwtExp(token);
      if (exp && exp * 1000 <= Date.now() + 30_000) {
        return setState({ checked: true, ok: false });
      }

      // 2) Server check: prove token works on API
      try {
        const res = await fetch("https://car-invoicing.vercel.app/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setState({ checked: true, ok: res.ok });
      } catch {
        setState({ checked: true, ok: false });
      }
    })();
  }, []);

  if (!state.checked) {
    return <div className="p-6 text-gray-600">Loading…</div>;
  }
  if (!state.ok) {
    // clean up stale token so we don't loop
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    return <Navigate to="/login" replace />;
  }
  return children;
}
