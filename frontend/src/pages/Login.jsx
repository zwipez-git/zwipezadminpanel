import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL;
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleLogin = async () => {
  setError("");

  const emailTrim = email.trim();
  const passwordTrim = password.trim();

  if (!emailTrim || !passwordTrim) {
    setError("All fields are required.");
    return;
  }

  try {
    setLoading(true); 

    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailTrim, password: passwordTrim }),
    });

    const data = await res.json();

    if (res.ok) {
      if (!data.user.role) {
        setError("Role not assigned yet. Wait for admin to assign.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/admin");
    } else {
      setError(data.error || "Invalid credentials");
    }
  } catch (err) {
    console.error(err);
    setError("Server error. Please try again later.");
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
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-[#00713E] flex items-center justify-center gap-2">
          Login
        </h1>

        {error && <p className="text-red-600 text-sm text-center mb-3">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded mb-4 focus:ring-2 focus:ring-[#00713E] text-sm sm:text-base"
        />

        <div className="relative mb-4">
          <input
            type={showPwd ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded focus:ring-2 focus:ring-[#00713E] text-sm sm:text-base"
          />
          <span
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-3 text-gray-500 cursor-pointer"
          >
            {showPwd ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
  onClick={handleLogin}
  disabled={loading}
  className="w-full bg-[#00713E] hover:bg-[#00713E]/90 text-white py-2 rounded-lg font-semibold mb-3 disabled:opacity-50"
>
  {loading ? "Logging in..." : "Login"}
</button>


        {/* <p className="text-center mt-4 text-sm sm:text-base text-gray-700">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#00713E] hover:underline font-semibold">
            Sign Up
          </Link>
        </p> */}
      </div>
    </div>
  );
}
