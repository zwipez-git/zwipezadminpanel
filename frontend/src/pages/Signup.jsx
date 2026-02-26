import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");
    setMsg("");

    const usernameTrim = username.trim();
    const emailTrim = email.trim();
    const passwordTrim = password.trim();

    if (!usernameTrim || !emailTrim || !passwordTrim) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true); 

      const res = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: usernameTrim,
          email: emailTrim,
          password: passwordTrim,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg("Signup successful! Wait for role assignment.");
        setUsername("");
        setEmail("");
        setPassword("");
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server error.");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">

      
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 sm:p-8 relative text-gray-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-[#00713E]">
          Sign Up
        </h1>

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}
        {msg && (
          <p className="text-green-600 text-sm text-center mb-3">{msg}</p>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border rounded mb-4"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded mb-4"
        />

        <div className="relative mb-4">
          <input
            type={showPwd ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded"
          />
          <span
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-3 cursor-pointer"
          >
            {showPwd ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          onClick={handleSignup}
          disabled={loading} 
          className="w-full bg-[#00713E] text-white py-2 rounded-lg font-semibold disabled:opacity-60"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
}
