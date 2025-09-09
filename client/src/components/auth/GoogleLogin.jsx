import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const LoginGoogle = ({
  clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID, // CRA env (frontend)
  loginEndpoint = "https://car-invoicing.vercel.app/auth/google/token", // backend login
  registerEndpoint = "https://car-invoicing.vercel.app/auth/google/register", // backend register
  onSuccess, // optional callback(data)
}) => {
  const navigate = useNavigate();

  const handleSuccess = async (response) => {
    try {
      console.log("Google OAuth response received");

      // First try to login (existing user)
      let res = await fetch(loginEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      // If login fails (user not found), try to register
      if (!res.ok && res.status === 404) {
        console.log("User not found, attempting registration...");
        res = await fetch(registerEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: response.credential }),
        });
      }

      const text = await res.text();
      if (!res.ok) {
        console.error("Google auth failed:", res.status, text);
        return;
      }

      const data = JSON.parse(text || "{}");
      console.log("Google auth response:", data);

      if (data.token) {
        localStorage.setItem("token", data.token);
        console.log("Token stored in localStorage");
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.userId) localStorage.setItem("userId", data.userId);
      }

      console.log("Google login successful, navigating to dashboard");

      if (onSuccess) onSuccess(data);
      else navigate("/dashboard", { replace: true });
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
