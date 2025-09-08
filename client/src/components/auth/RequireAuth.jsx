// src/auth/RequireAuth.jsx
import React, { useEffect, useState } from "react";

function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      typeof payload.exp === "number" && payload.exp * 1000 > Date.now() + 30000
    );
  } catch {
    return false;
  }
}

export default function RequireAuth({ children }) {
  const [checked, setChecked] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setOk(isTokenValid(t));
    setChecked(true);
  }, []);

  if (!checked) return <div className="p-6 text-gray-600">Loading…</div>;
  if (!ok) return <Navigate to="/login" replace />;

  return children;
}
