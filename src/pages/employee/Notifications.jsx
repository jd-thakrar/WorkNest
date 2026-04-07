import React, { useState } from "react";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Clock,
  Trash2,
  Inbox,
  ShieldAlert,
  RefreshCw,
  Zap,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

const NOTIFICATIONS_DATA = [
  {
    id: 1,
    type: "success",
    title: "Payroll Direct Deposit",
    desc: "Your salary for February 2026 has been successfully credited to your HDFC Bank account.",
    time: "2 mins ago",
    unread: true,
    icon: RefreshCw,
    color: "text-teal-600 bg-teal-50",
  },
  {
    id: 2,
    type: "alert",
    title: "Security Alert",
    desc: "New login detected from Chrome on Windows (IP 192.168.1.45). If this was not you, secure your account.",
    time: "14 mins ago",
    unread: true,
    icon: ShieldAlert,
    color: "text-rose-500 bg-rose-50",
  },
  {
    id: 3,
    type: "success",
    title: "Leave Request Approved",
    desc: "Your annual vacation request (Mar 24 - Mar 28) has been approved by your manager.",
    time: "1 hour ago",
    unread: false,
    icon: CheckCircle2,
    color: "text-emerald-500 bg-emerald-50",
  },
  {
    id: 4,
    type: "warning",
    title: "Tax Declaration Required",
    desc: "Please submit your Form 16 / Tax Declaration for FY 2026 before March 15 to avoid deduction.",
    time: "3 hours ago",
    unread: false,
    icon: Zap,
    color: "text-amber-500 bg-amber-50",
  },
  {
    id: 5,
    type: "message",
    title: "Shift Assigned",
    desc: "You have been assigned the Morning Shift (09:00 AM - 06:00 PM) for next week.",
    time: "5 hours ago",
    unread: false,
    icon: Clock,
    color: "text-slate-500 bg-slate-50",
  },
  {
    id: 6,
    type: "alert",
    title: "Form 12B Missing",
    desc: "Your Form 12B details are incomplete. Please update your profile in the Settings panel.",
    time: "Yesterday",
    unread: false,
    icon: ShieldAlert,
    color: "text-rose-500 bg-rose-50",
  },
];

const Notifications = () => {
  const [filter, setFilter] = useState("All");
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);

  const handleArchive = (e, id) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, archived: true } : n));
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleMarkRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "Unread") return n.unread && !n.archived;
    if (filter === "Archived") return n.archived;
    return !n.archived;
  });

  return (
    <EmployeeLayout title="Notification Hub">
      <div className="max-w-4xl mx-auto space-y-6 animate-in pb-12">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-100 rounded-xl w-fit">
            {["All", "Unread", "Archived"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? "bg-[#042f2e] text-white" : "text-slate-400 hover:text-[#042f2e]"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={handleMarkAllRead}
            className="text-[9px] font-black text-slate-400 hover:text-teal-600 uppercase tracking-widest transition-colors"
          >
            Clear Unread
          </button>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id)}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-all group cursor-pointer relative ${n.unread ? "bg-white hover:bg-slate-50/50" : "bg-slate-50/30 hover:bg-slate-50/80"}`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-black/5 ${n.color}`}
              >
                <n.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm tracking-tight transition-colors ${n.unread ? "font-black text-[#042f2e]" : "font-bold text-slate-600"}`}
                    >
                      {n.title}
                    </h4>
                    <AnimatePresence>
                      {n.unread && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="w-2 h-2 bg-teal-500 rounded-full"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                    {n.time}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-1 group-hover:line-clamp-none transition-all">
                  {n.desc}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleArchive(e, n.id)}
                  className="p-1.5 text-slate-300 hover:text-teal-600 rounded-lg transition-all"
                  title="Archive"
                >
                  <Inbox size={16} />
                </button>
                <button
                  onClick={(e) => handleDelete(e, n.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-all"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default Notifications;
