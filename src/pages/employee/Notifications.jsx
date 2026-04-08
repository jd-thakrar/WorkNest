import React, { useState, useEffect } from "react";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Trash2,
  Inbox,
  ShieldAlert,
  Zap,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";
import toast from "react-hot-toast";

const getNotificationConfig = (type) => {
  switch (type) {
    case 'success':
      return { icon: CheckCircle2, color: "text-teal-600 bg-teal-50" };
    case 'alert':
      return { icon: ShieldAlert, color: "text-rose-500 bg-rose-50" };
    case 'warning':
      return { icon: Zap, color: "text-amber-500 bg-amber-50" };
    default:
      return { icon: Bell, color: "text-slate-500 bg-slate-50" };
  }
};

const Notifications = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Fetch Notifications Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user.token]);

  const handleArchive = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/notifications/${id}/archive`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, archived: true } : n));
        toast.success("Intelligence Archived");
      }
    } catch (err) { toast.error("Sync Failure"); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        toast.success("Record Deleted");
      }
    } catch (err) { toast.error("Sync Failure"); }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        toast.info("All Signals Cleared");
      }
    } catch (err) { toast.error("Sync Failure"); }
  };

  const handleMarkRead = async (id, unread) => {
    if (!unread) return;
    try {
      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, unread: false } : n));
      }
    } catch (err) { console.error("Mark Read Error:", err); }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "Unread") return n.unread && !n.archived;
    if (filter === "Archived") return n.archived;
    return !n.archived;
  });

  return (
    <EmployeeLayout title="Intelligence Feed">
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

        <div className="bg-white rounded-[32px] border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
               <RefreshCw className="animate-spin text-teal-600" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Signal Space...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
               <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
                  <Bell size={24} />
               </div>
               <h4 className="text-sm font-black text-[#042f2e] uppercase tracking-widest">Silent Feed</h4>
               <p className="text-xs text-slate-400 font-bold tracking-tight mt-1">No transmissions detected in this channel.</p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const config = getNotificationConfig(n.type);
              const Icon = config.icon;
              return (
                <motion.div
                  layout
                  key={n._id}
                  onClick={() => handleMarkRead(n._id, n.unread)}
                  className={`p-4 sm:p-5 flex items-start gap-4 transition-all group cursor-pointer relative ${n.unread ? "bg-white hover:bg-slate-50/50" : "bg-slate-50/30 hover:bg-slate-50/80"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-black/5 ${config.color}`}
                  >
                    <Icon size={18} />
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
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed group-hover:text-slate-600 transition-colors">
                      {n.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.archived && (
                      <button
                        onClick={(e) => handleArchive(e, n._id)}
                        className="p-1.5 text-slate-300 hover:text-teal-600 rounded-lg transition-all"
                      >
                        <Inbox size={16} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, n._id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default Notifications;
