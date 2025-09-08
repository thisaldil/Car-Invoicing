import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const LoginGoogle = ({
  clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID, // CRA env (frontend)
  endpoint = "https://car-invoicing.vercel.app/auth/google/token", // backend login
  onSuccess, // optional callback(data)
}) => {
  const handleSuccess = async (response) => {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      const text = await res.text();
      if (!res.ok) {
        console.error("Google auth failed:", res.status, text);
        return;
      }

      const data = JSON.parse(text || "{}");
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.userId) localStorage.setItem("userId", data.userId);
      }
      if (onSuccess) onSuccess(data);
      else window.location.href = "/dashboard";
    } catch (e) {
      console.error("Google Login Error:", e);
    }
  };

  if (!clientId) {
    return (
      <p className="text-sm text-red-600">
        Google sign-in is not configured. Set REACT_APP_GOOGLE_CLIENT_ID and
        rebuild.
      </p>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.error("Google Login Failed")}
      />
    </GoogleOAuthProvider>
  );
};

export default LoginGoogle;
