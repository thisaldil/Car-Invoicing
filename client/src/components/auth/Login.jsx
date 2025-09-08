import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import bg from "../../images/bg.png";
import LoginForm from "../../components/auth/LoginForm";
import LoginGoogle from "../../components/auth/GoogleLogin";

const Login = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="relative flex h-screen w-full overflow-hidden bg-gray-100"
    >
      {/* Left Panel */}
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

      {/* Right Panel */}
      <div className="w-full md:w-1/2 z-10 flex justify-center items-center ml-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-10 rounded-lg shadow-xl text-center w-full max-w-sm"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Login</h1>

          {/* Email/Password Login */}
          <LoginForm
            action="https://car-invoicing.vercel.app/user/login" // change if your endpoint differs
            onSuccess={(data) => console.log("Email login success:", data)}
          />

          <div className="text-gray-400 text-sm my-4">
            or sign in with Google
          </div>

          {/* Google Login */}
          <div className="flex justify-center mb-4">
            <LoginGoogle
              onSuccess={(data) => console.log("Google login success:", data)}
            />
          </div>

          <div className="mt-6 text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Register here
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
