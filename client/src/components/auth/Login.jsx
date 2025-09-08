import React, { useEffect, useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import bg from "../../images/bg.png";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // read the same env you already use
  const FE_CID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // quick visibility to confirm FE client id at runtime
    console.log("FE CID:", FE_CID);
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      navigate("/dashboard");
    }
  }, [navigate, FE_CID]);

  const handleSuccess = async (response) => {
    try {
      const res = await fetch(
        "https://car-invoicing.vercel.app/auth/google/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: response.credential }),
        }
      );

      // log error text so we see why it failed (e.g., invalid_id_token)
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("Auth failed:", res.status, text);
        if (res.status === 404) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          sessionStorage.clear();
          toast.info("Account not registered. Please register first.");
          return;
        }
        toast.error("Login failed. Please try again.");
        return;
      }

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: data.user.name,
            picture: data.user.picture,
            email: data.user.email,
          })
        );
        localStorage.setItem("userId", data.userId);
        setIsAuthenticated(true);
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  // If FE client id is missing, show a clear message instead of a broken button
  if (!FE_CID) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600 font-medium">
          Google sign-in is not configured. Set REACT_APP_GOOGLE_CLIENT_ID and
          redeploy the client.
        </p>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={FE_CID}>
      <div
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="relative flex h-screen w-full overflow-hidden bg-gray-100"
      >
        <div className="hidden md:block absolute left-0 top-0 h-full w-1/2 text-white z-0">
          <div className="flex flex-col justify-center items-center h-full px-12">
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              src="/logo.png"
              alt="Logo"
              className="w-72 mb-6"
            />
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl leading-relaxed font-medium text-center max-w-lg text-gray-700"
            >
              Manage your invoices with ease. Automate, track, and send invoices
              effortlessly using AirInvoice Pro.
            </motion.p>
          </div>
        </div>

        <div className="w-full md:w-1/2 z-10 flex justify-center items-center ml-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white p-10 rounded-lg shadow-xl text-center w-full max-w-sm"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Login</h1>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.error("Google Login Failed")}
            />
            <div className="mt-6 text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-blue-500 hover:underline">
                Register here
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
