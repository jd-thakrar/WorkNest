import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  Github,
  Chrome,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid corporate email format";
    
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Security requires at least 6 characters";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        const text = await response.text();
        data = { message: text || "Rate limit exceeded or server error." };
      }

      if (response.ok) {
        console.log("✅ LOGIN SUCCESSFUL");
        console.log("🔑 JWT TOKEN RECEIVED:", data.token);
        login(data);
        if (data.role === "admin") {
          navigate("/app/dashboard");
        } else {
          navigate("/employee/dashboard");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (role) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      // Redirect based on role for demo purposes
      if (role === "admin") {
        navigate("/app/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden mt-20">
      {/* Background Accents */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-teal-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-8">
            <img src="/logo.png" alt="WorkNest" className="h-10 mx-auto" />
          </Link>
          <h2
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-3xl font-semibold uppercase tracking-widest"
          >
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-teal font-semibold uppercase tracking-wider">
            Enter your credentials to access your dashboard
          </p>
        </div>

        <div className="bg-white py-10 px-8 rounded-[32px] border border-teal-50 shadow-[0_20px_50px_rgba(4,47,46,0.06)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl text-center">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-teal uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-teal group-focus-within:text-teal-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  className={`block w-full pl-11 pr-4 py-4 bg-gray-50/50 border rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white transition-all outline-none text-[#042f2e] font-medium placeholder:text-gray-300 ${errors.email ? 'border-rose-500 bg-rose-50/30' : 'border-gray-100'}`}
                  placeholder="name@company.com"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              {errors.email && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-top-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-bold text-teal uppercase tracking-widest">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  size="sm"
                  className="text-[10px] font-semibold text-teal-600 hover:text-teal-700 uppercase tracking-widest"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  className={`block w-full pl-11 pr-4 py-4 bg-gray-50/50 border rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white transition-all outline-none text-[#042f2e] font-medium placeholder:text-gray-300 ${errors.password ? 'border-rose-500 bg-rose-50/30' : 'border-gray-100'}`}
                  placeholder="••••••••"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              {errors.password && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-top-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary bg-[#042f2e] w-full py-4 justify-center text-base shadow-xl shadow-teal-900/10 group"
            >
              {isSubmitting ? "Architecting..." : "Sign in"}
              <ArrowRight
                size={18}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-semibold">
                <span className="px-4 bg-white text-gray-400 leading-none">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => handleSocialLogin("user")}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-[#042f2e] hover:bg-gray-50 transition-all active:scale-[0.98] shadow-sm"
              >
                <Chrome size={18} className="text-teal-600" />
                Continue with Google
              </button>
              <button
                onClick={() => handleSocialLogin("admin")}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-[#042f2e] hover:bg-gray-50 transition-all active:scale-[0.98] shadow-sm"
              >
                <Github size={18} />
                Continue with GitHub
              </button>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500 font-medium">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-teal-600 font-semibold hover:text-teal-700 transition-colors"
          >
            Start your 14-day free trial
          </Link>
        </p>

        <div className="mt-12 flex items-center justify-center gap-2 text-gray-300">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-semibold uppercase tracking-widest">
            Enterprise grade security
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
