import React, { useState } from "react";
import { Send, Calendar, FileText } from "lucide-react";

const ApplyLeaveForm = ({ onSubmit, stats }) => {
  const [formData, setFormData] = useState({
    type: "Annual Leave",
    from: "",
    to: "",
    reason: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.from || !formData.to || !formData.reason) return;
    
    setIsSubmitting(true);
    
    // Calculate days
    const start = new Date(formData.from);
    const end = new Date(formData.to);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const success = await onSubmit({ ...formData, days: diffDays });
    if (success) {
      setFormData({ type: "Annual Leave", from: "", to: "", reason: "" });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm relative overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
           <Calendar size={20} />
        </div>
        <div>
           <h4 className="text-[14px] font-bold text-[#042f2e] tracking-tight">Request Time Off</h4>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Submit leave application</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div className="space-y-1.5">
           <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Leave Category</label>
           <select 
             value={formData.type}
             onChange={(e) => setFormData({...formData, type: e.target.value})}
             className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] font-bold text-[#042f2e] focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500/30 outline-none transition-all cursor-pointer"
           >
              <option value="Annual Leave">Annual Leave (Available: {stats?.balance ?? '--'})</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Comp Off">Comp Off</option>
           </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Starts On</label>
              <input 
                type="date" 
                required
                value={formData.from}
                onChange={(e) => setFormData({...formData, from: e.target.value})}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-4 py-2 text-[12px] font-bold text-slate-700 outline-none focus:border-teal-500/30 transition-all" 
              />
           </div>
           <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Ends On</label>
              <input 
                type="date" 
                required
                value={formData.to}
                onChange={(e) => setFormData({...formData, to: e.target.value})}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-4 py-2 text-[12px] font-bold text-slate-700 outline-none focus:border-teal-500/30 transition-all" 
              />
           </div>
        </div>

        <div className="space-y-1.5">
           <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Internal Note</label>
           <textarea 
             rows="4" 
             required
             value={formData.reason}
             onChange={(e) => setFormData({...formData, reason: e.target.value})}
             placeholder="State your reason clearly..."
             className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-4 py-3 text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500/30 transition-all placeholder:text-slate-300"
           />
        </div>

        <div className="mt-auto pt-4">
           <button 
             disabled={isSubmitting}
             className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#042f2e] hover:bg-slate-900 text-white rounded-lg shadow-xl shadow-teal-900/10 transition-all font-bold text-[12px] uppercase tracking-widest active:scale-95 group disabled:opacity-50"
           >
              <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              {isSubmitting ? 'Transmitting...' : 'Submit Application'}
           </button>
        </div>
      </form>
    </div>
  );
};

export default ApplyLeaveForm;
