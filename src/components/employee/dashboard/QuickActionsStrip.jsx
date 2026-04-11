import React from "react";
import {
  Calendar,
  CheckSquare,
  Wallet,
  FileText,
  Plus,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

import { Link } from "react-router-dom";

const QuickActionsStrip = () => {
  const actions = [
    { label: "Apply Leave", icon: Calendar, to: "/employee/time-off" },

    { label: "Launch Task", icon: CheckSquare, to: "/employee/tasks" },
    { label: "My Profile", icon: Wallet, to: "/employee/settings" },
    { label: "My Payslip", icon: FileText, to: "/employee/finance" },
  ];


  return (
    <div className="overflow-x-auto pb-2 -mb-2 no-scrollbar">
      <div className="flex items-center gap-3 min-w-max">
        {actions.map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl border bg-white text-[#042f2e] border-slate-200/60 shadow-sm transition-all group whitespace-nowrap hover:y-[-2px]"
          >
            <action.icon size={16} className="text-teal-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};


export default QuickActionsStrip;
