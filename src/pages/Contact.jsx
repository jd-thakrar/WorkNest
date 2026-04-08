import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";

import { API_URL } from "../config";

/* ── Section label pill ── */
const Label = ({ children }) => (
  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-100 bg-white text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-6 shadow-sm">
    {children}
  </div>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone format (min 10 digits)";
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
    }

    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setIsSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          subject: "",
          message: "",
        });
        setErrors({});
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
         const err = await response.json();
         setErrors({ submit: err.message || "Failed to send message" });
      }
    } catch (err) {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="pt-40 pb-20 md:pt-40 md:pb-10 text-center relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 max-w-5xl">
          <h1
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-4xl md:text-6xl lg:text-[72px] font-semibold text-gray-950 mb-8 tracking-tighter leading-[0.95]"
          >
            We'd love to <br className="hidden md:block" />
            hear from you
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Whether you have a question about pricing, need a demo, or want to
            explore an enterprise integration, our team is ready.
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="mt-5  relative z-20 pb-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-0 max-w-6xl mx-auto bg-white rounded-[48px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            {/* Contact Info (Left Side) */}
            <div className="lg:w-2/5 bg-gray-50 p-12 lg:p-16 relative overflow-hidden flex flex-col border-r border-gray-100">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
              <div className="relative z-10 h-full flex flex-col">
                <h3 className="text-3xl font-semibold text-gray-950 mb-6 tracking-tight"></h3>
                <p className="text-gray-500 mb-12 font-medium">
                  Fill out the form and our team will get back to you within 24
                  hours.
                </p>

                <div className="flex flex-col gap-12 mt-4">
                  {[
                    {
                      icon: Phone,
                      label: "Call Us",
                      sub: "",
                      val: "+91 96244 49764",
                      color: "text-teal-600",
                      bg: "bg-teal-50",
                    },
                    {
                      icon: Mail,
                      label: "Chat With Sales",
                      sub: "",
                      val: "jd.thakrar05@gmail.com",
                      color: "text-teal-600",
                      bg: "bg-teal-50",
                    },
                    {
                      icon: MapPin,
                      label: "Visit Us",
                      sub: "307 Shiv Arcade",
                      val: "KKV Hall, Rajkot",
                      color: "text-teal-600",
                      bg: "bg-teal-50",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-6 group">
                      <div
                        className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} shrink-0 group-hover:scale-110 transition-all shadow-sm`}
                      >
                        <item.icon size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-950 text-sm mb-1 uppercase tracking-tight">
                          {item.label}
                        </p>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">
                          {item.sub}
                        </p>
                        <p
                          className={`text-gray-900 font-semibold tracking-tight ${item.color}`}
                        >
                          {item.val}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Immediate Location Map */}
                <div className="pt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <div className="w-full h-56 bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-inner relative group">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.785589430628!2d70.773247!3d22.286110399999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959cb896cb64089%3A0xadc997a266a1fa36!2sC%20B%20Thakrar%20%26%20Associates!5e0!3m2!1sen!2sin!4v1773579242591!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Worknest HQ Rajkot"
                      className=" hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-110"
                    ></iframe>
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-gray-900/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] text-white font-bold uppercase tracking-widest text-center">
                        Open in Maps
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form (Right Side) */}
            <div className="lg:w-3/5 p-12 lg:p-16 bg-white">
              <h3 className="text-3xl font-semibold text-gray-950 mb-10 tracking-tight">
                Send us a message
              </h3>
              {errors.submit && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-5 rounded-[24px] mb-10 flex items-center gap-4 animate-in">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="font-semibold text-[10px] uppercase tracking-widest">
                    {errors.submit}
                  </span>
                </div>
              )}
              {isSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-6 py-5 rounded-[24px] mb-10 flex items-center gap-4 animate-in">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-[10px] uppercase tracking-widest">
                    Message sent successfully — we'll be in touch soon!
                  </span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="flex flex-col gap-3">
                    <label
                      htmlFor="name"
                      className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] ml-1"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`px-6 py-5 bg-gray-50/50 border ${errors.name ? "border-red-500" : "border-gray-200"} rounded-[20px] focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-gray-950 text-sm font-medium`}
                      placeholder="Jane Doe"
                    />
                    {errors.name && (
                      <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-wider">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <label
                      htmlFor="email"
                      className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] ml-1"
                    >
                      Work Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`px-6 py-5 bg-gray-50/50 border ${errors.email ? "border-red-500" : "border-gray-200"} rounded-[20px] focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-gray-950 text-sm font-medium`}
                      placeholder="jane@company.com"
                    />
                    {errors.email && (
                      <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-wider">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="flex flex-col gap-3">
                    <label
                      htmlFor="phone"
                      className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] ml-1"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`px-6 py-5 bg-gray-50/50 border ${errors.phone ? "border-red-500" : "border-gray-200"} rounded-[20px] focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-gray-950 text-sm font-medium`}
                      placeholder="+91 00000 00000"
                    />
                    {errors.phone && (
                      <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-wider">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <label
                      htmlFor="company"
                      className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] ml-1"
                    >
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className={`px-6 py-5 bg-gray-50/50 border ${errors.company ? "border-red-500" : "border-gray-200"} rounded-[20px] focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-gray-950 text-sm font-medium`}
                      placeholder="Company Inc."
                    />
                    {errors.company && (
                      <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-wider">
                        {errors.company}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label
                    htmlFor="subject"
                    className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] ml-1"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`px-6 py-5 bg-gray-50/50 border ${errors.subject ? "border-red-500" : "border-gray-200"} rounded-[20px] focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-gray-950 text-sm font-medium`}
                    placeholder="How can we help?"
                  />
                  {errors.subject && (
                    <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-wider">
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <label
                    htmlFor="message"
                    className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] ml-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className={`px-6 py-5 bg-gray-50/50 border ${errors.message ? "border-red-500" : "border-gray-200"} rounded-[24px] focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-gray-950 text-sm font-medium resize-none`}
                    placeholder="Tell us about your team size and requirements..."
                  ></textarea>
                  {errors.message && (
                    <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-wider">
                      {errors.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-3 px-12 py-5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[10px] uppercase tracking-[0.2em] rounded-[24px] shadow-xl shadow-teal-500/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? "Transmitting..." : "Initiate Contact"}
                  {!isSubmitting && (
                    <Send
                      size={16}
                      className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                    />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Rajkot Location Map Infrastructure */}
    </div>
  );
};

export default Contact;
