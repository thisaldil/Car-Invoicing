import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const LoginGoogle = ({
  clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID,
  loginEndpoint = "https://car-invoicing.vercel.app/auth/google/token",
  registerEndpoint = "https://car-invoicing.vercel.app/auth/google/register",
  onSuccess,
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

      console.log("Login attempt status:", res.status);

      // If login fails (user not found), try to register
      if (!res.ok && res.status === 404) {
        console.log("User not found, attempting registration...");
        res = await fetch(registerEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: response.credential }),
        });
        console.log("Registration attempt status:", res.status);
      }

      const text = await res.text();
      console.log("Raw server response:", text);

      if (!res.ok) {
        console.error("Google auth failed:", res.status, text);
        return;
      }

      const data = JSON.parse(text || "{}");
      console.log("Parsed Google auth response:", data);

      // Store all the data
      if (data.token) {
        localStorage.setItem("token", data.token);
        console.log(
          "Token stored in localStorage:",
          data.token.substring(0, 20) + "..."
        );
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("User data stored:", data.user);
      }
      if (data.userId) {
        localStorage.setItem("userId", data.userId);
        console.log("UserId stored:", data.userId);
      }

      console.log("All data stored, current localStorage:", {
        token: localStorage.getItem("token") ? "present" : "missing",
        user: localStorage.getItem("user") ? "present" : "missing",
        userId: localStorage.getItem("userId") ? "present" : "missing",
      });

      console.log("Google login successful, navigating to dashboard");

      if (onSuccess) onSuccess(data);

      // Try React Router navigation first
      navigate("/dashboard", { replace: true });

      // Fallback: if navigation doesn't work, reload the page
      setTimeout(() => {
        if (window.location.pathname === "/login") {
          console.log("Navigation failed, reloading page...");
          window.location.href = "/dashboard";
        }
      }, 1000);
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
