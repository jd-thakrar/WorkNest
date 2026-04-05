import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Building2,
  CheckCircle2,
  Briefcase,
  Users,
  Phone,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    jobTitle: "",
    teamSize: "",
    phone: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        login(data);
        navigate("/app/dashboard"); // Redirect to admin dash by default or based on role
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden mt-20">
      {/* Background Accents */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-teal-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-8">
            <img src="/logo.png" alt="WorkNest" className="h-10 mx-auto" />
          </Link>
          <h2
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-3xl font-extrabold text-[#042f2e] tracking-tight"
          >
            Design your professional hive
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Join 4,000+ companies architecting a smarter workplace.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 items-start">
          <div className="bg-white py-10 px-8 rounded-[32px] border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl text-center">
                {error}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Row 1: Name & Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600 transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white transition-all outline-none text-[#042f2e] font-medium placeholder:text-gray-300"
                      placeholder="Jane Cooper"
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Company Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600 transition-colors">
                      <Building2 size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white transition-all outline-none text-[#042f2e] font-medium placeholder:text-gray-300"
                      placeholder="Acme Corp"
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Job Title & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Job Title
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600 transition-colors">
                      <Briefcase size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white transition-all outline-none text-[#042f2e] font-medium placeholder:text-gray-300"
                      placeholder="VP Operations"
                      onChange={(e) =>
                        setFormData({ ...formData, jobTitle: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600 transition-colors">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      required
                      className="block w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white transition-all outline-none text-[#042f2e] font-medium placeholder:text-gray-300"
                      placeholder="+91 00000 00000"
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Email & Team Size */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Work Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      className="block w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white transition-all outline-none text-[#042f2e] font-medium placeholder:text-gray-300"
                      placeholder="jane@company.com"
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Team Size
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600 transition-colors">
                      <Users size={18} />
                    </div>
                    <select
                      required
                      className="block w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white transition-all outline-none text-[#042f2e] font-medium appearance-none cursor-pointer"
                      onChange={(e) =>
                        setFormData({ ...formData, teamSize: e.target.value })
                      }
                    >
                      <option value="">Size...</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="200+">200+</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Create Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 focus:bg-white transition-all outline-none text-[#042f2e] font-medium placeholder:text-gray-300"
                    placeholder="••••••••"
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-medium ml-1">
                  Must be at least 12 characters with symbols
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-4 justify-center text-base shadow-xl shadow-teal-900/10 group mt-4"
              >
                {isSubmitting
                  ? "Architecting hives..."
                  : "Start your 14-day free trial"}
                <ArrowRight
                  size={18}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </button>

              <p className="text-[10px] text-center text-gray-400 font-medium leading-relaxed px-6">
                By clicking "Start your free trial", you agree to our{" "}
                <Link to="/terms" className="text-teal-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-teal-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>

          {/* Value Props Sidebar */}
          <div className="hidden lg:block space-y-8 pt-8 px-4">
            {[
              {
                title: "No Credit Card",
                desc: "Unlimited access for 14 days.",
              },
              { title: "Full Access", desc: "Try every premium feature." },
              { title: "SOC-2 Secure", desc: "Enterprise data protection." },
              { title: "Smart Payroll", desc: "Automated tax calculations." },
              { title: "Real-time Tasks", desc: "Blazing fast Kanban sync." },
            ].map((v, i) => (
              <div
                key={i}
                className="space-y-2 animate-in"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="flex items-center gap-2 text-[#042f2e]">
                  <CheckCircle2 size={16} className="text-teal-500 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {v.title}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 font-medium ml-6">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500 font-medium">
          Already using WorkNest?{" "}
          <Link
            to="/login"
            className="text-teal-600 font-bold hover:text-teal-700 transition-colors"
          >
            Sign in to your account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
