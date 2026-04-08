import React from "react";
import { motion } from "framer-motion";

const TaskFilters = ({ activeTab, setActiveTab, counts = {} }) => {
  const tabs = [
    { label: "All", count: counts.all || 0 },
    { label: "Pending", count: counts.pending || 0 },
    { label: "In Progress", count: counts.inProgress || 0 },
    { label: "Completed", count: counts.completed || 0 },
  ];

  return (
    <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm overflow-x-auto thin-scroll whitespace-nowrap">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          onClick={() => setActiveTab(tab.label)}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest relative transition-all ${
            activeTab === tab.label ? "text-teal-700" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="relative z-10">{tab.label}</span>
          <span className={`relative z-10 px-1.5 py-0.5 rounded-md text-[9px] font-black border transition-colors ${
             activeTab === tab.label ? 'bg-white border-teal-100' : 'bg-slate-50 border-slate-100'
          }`}>
             {tab.count}
          </span>
          {activeTab === tab.label && (
            <motion.div
              layoutId="activeTaskTab"
              className="absolute inset-0 bg-teal-50 border border-teal-100/30 rounded-lg"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default TaskFilters;
