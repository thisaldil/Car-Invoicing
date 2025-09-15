import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginForm = ({
  action = "https://car-invoicing.vercel.app/user/login",
  onSuccess,
  buttonText = "Sign in", // <-- support custom button text
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      if (onSuccess) onSuccess(data);
    } catch (error) {
      setErr(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        type="email"
        className="w-full rounded-md border px-3 py-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <input
        type="password"
        className="w-full rounded-md border px-3 py-2"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />
      {err && <div className="text-red-500 text-sm">{err}</div>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {busy
          ? buttonText === "Sign in"
            ? "Signing in..."
            : "Registering..."
          : buttonText}
      </button>
    </form>
  );
};

export default LoginForm;
