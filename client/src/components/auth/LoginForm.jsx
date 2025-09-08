import React, { useState } from "react";

const LoginForm = ({
  action = "https://car-invoicing.vercel.app/user/login", // change if your endpoint differs
  onSuccess, // optional callback(userData)
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!email || !password) {
      setErr("Email and password are required");
      return;
    }
    try {
      setBusy(true);
      const res = await fetch(action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      if (!res.ok) {
        setErr(text || "Login failed");
        return;
      }

      const data = JSON.parse(text || "{}");
      // Adjust the keys below to your API response shape
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.id || data.userId) {
          localStorage.setItem("userId", data.user.id || data.userId);
        }
      }
      if (onSuccess) onSuccess(data);
      // Default navigation if no onSuccess provided
      window.location.href = "/dashboard";
    } catch (e) {
      setErr("Network error");
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="text-left">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div className="text-left">
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          autoComplete="current-password"
        />
      </div>

      {err ? <p className="text-sm text-red-600">{err}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
};

export default LoginForm;
