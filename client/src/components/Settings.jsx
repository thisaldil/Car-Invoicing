import React, { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Settings = () => {
  const navigate = useNavigate();

  // THEME
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");

  useEffect(() => {
    const html = document.documentElement;
    const applyTheme = (mode) => {
      if (mode === "dark") html.classList.add("dark");
      else if (mode === "light") html.classList.remove("dark");
      else {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        html.classList.toggle("dark", prefersDark);
      }
    };
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // AUTH / USER
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(storedUser);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const handleSuccess = async (response) => {
    try {
      const res = await fetch(
        "https://car-invoicing.vercel.app/auth/google/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // keep for your server's CORS/session setup
          body: JSON.stringify({ token: response.credential }),
        }
      );

      // Handle server responses (e.g., 409 if already registered)
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        if (res.status === 409) {
          toast.error("User already exists. Try logging in.");
        } else {
          toast.error(msg.message || "Registration failed. Please try again.");
        }
        return;
      }

      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: data.user.name,
            email: data.user.email,
            picture: data.user.picture,
          })
        );
        setIsAuthenticated(true);
        setUser({
          name: data.user.name,
          email: data.user.email,
          picture: data.user.picture,
        });
        toast.success("Registration successful! Welcome to CarInvoicing Pro!");
        // Stay on Settings, or navigate if you prefer:
        // navigate("/dashboard");
      }
    } catch (error) {
      console.error("Google Registration Error:", error);
      if (
        error.name === "TypeError" &&
        String(error.message || "").includes("fetch")
      ) {
        toast.error(
          "Connection error. Please check your internet and try again."
        );
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

  const handleError = (error) => {
    console.error("Google OAuth Error:", error);
    toast.error("Google authentication failed. Please try again.");
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    toast.success("Signed out.");
    // navigate("/login"); // uncomment if you want to redirect after sign-out
  };

  const themeOptions = [
    { label: "System", value: "system", icon: <Monitor className="w-6 h-6" /> },
    { label: "Light", value: "light", icon: <Sun className="w-6 h-6" /> },
    { label: "Dark", value: "dark", icon: <Moon className="w-6 h-6" /> },
  ];

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen px-4 py-8 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Profile Card */}
          {user && (
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col sm:flex-row items-center gap-6">
              <img
                src={
                  user.picture
                    ? user.picture
                        .replace("=s96-c", "")
                        .replace("http://", "https://")
                    : "https://via.placeholder.com/150"
                }
                alt={user.name}
                className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-700 shadow-md"
              />
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{user.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  he/him
                </p>
              </div>
            </div>
          )}

          {/* Add New User Button */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
            >
              Add New User
            </button>
          </div>

          {/* Account (Register / Sign-out) */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Account</h2>
            {!isAuthenticated ? (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={handleError}
                  theme="outline"
                  size="large"
                  text="signup_with"
                />
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  You are signed in with Google.
                </p>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* Theme Settings */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">
              Theme Settings
            </h2>
            <div className="flex justify-center space-x-4">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`p-3 rounded-full border-2 transition-all
                    ${
                      theme === option.value
                        ? "bg-orange-100 dark:bg-orange-900 border-orange-500 text-orange-600 dark:text-orange-400"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  title={option.label}
                >
                  {option.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Settings;
