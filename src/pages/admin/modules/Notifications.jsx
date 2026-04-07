import React, { useState, useEffect } from "react";
import AdminLayout from "../../../layouts/AdminLayout";
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
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../config";
import toast from "react-hot-toast";

const getNotificationConfig = (type) => {
  switch (type) {
    case 'success':
      return { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50" };
    case 'alert':
      return { icon: ShieldAlert, color: "text-rose-500 bg-rose-50" };
    case 'warning':
      return { icon: Zap, color: "text-amber-500 bg-amber-50" };
    case 'message':
    default:
      return { icon: Bell, color: "text-teal-600 bg-teal-50" };
  }
};

const Notifications = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/notifications`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
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
        toast.success('Notification archived');
      }
    } catch (err) {
      toast.error('Failed to archive');
    }
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
        toast.success('Notification deleted');
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        toast.success('All marked as read');
      }
    } catch (err) {
      toast.error('Operation failed');
    }
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
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}s ago`;
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
    <AdminLayout title="Intelligence Feed">
      <div className="max-w-4xl mx-auto space-y-6 animate-in pb-12">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-1.5 p-1 bg-gray-50 border border-gray-100 rounded-xl w-fit">
            {["All", "Unread", "Archived"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? "bg-[#042f2e] text-white" : "text-gray-400 hover:text-[#042f2e]"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={handleMarkAllRead}
            className="text-[9px] font-black text-gray-400 hover:text-teal-600 uppercase tracking-widest transition-colors"
          >
            Clear Unread
          </button>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Bell size={24} className="text-gray-300" />
              </div>
              <h3 className="text-sm font-black text-[#042f2e] uppercase tracking-widest mb-1">No transmissions detected</h3>
              <p className="text-xs text-gray-400 font-bold tracking-tight">Your intelligence feed is currently clear.</p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const config = getNotificationConfig(n.type);
              const Icon = config.icon;
              return (
                <div
                  key={n._id}
                  onClick={() => handleMarkRead(n._id, n.unread)}
                  className={`p-4 sm:p-5 flex items-start gap-4 transition-all group cursor-pointer relative ${n.unread ? "bg-white hover:bg-gray-50/50" : "bg-gray-50/30 hover:bg-gray-50/80"}`}
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
                          className={`text-sm tracking-tight transition-colors ${n.unread ? "font-black text-[#042f2e]" : "font-bold text-gray-600"}`}
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
                      <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-1 group-hover:line-clamp-none transition-all">
                      {n.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.archived && (
                      <button
                        onClick={(e) => handleArchive(e, n._id)}
                        className="p-1.5 text-gray-300 hover:text-teal-600 rounded-lg transition-all"
                      >
                        <Inbox size={16} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, n._id)}
                      className="p-1.5 text-gray-300 hover:text-rose-500 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Notifications;
