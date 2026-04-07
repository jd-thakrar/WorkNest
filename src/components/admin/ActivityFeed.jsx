import React from "react";
import { UserPlus, CheckCircle2, Layout, Wallet, CalendarDays, ArrowRight } from "lucide-react";
import { useGlobal } from "../../context/GlobalContext.jsx";

const ActivityFeed = () => {
  const { tasks, attendance, financials } = useGlobal();

  // Generate activities dynamically based on exact database records
  const activities = React.useMemo(() => {
     const acts = [];
     
     // Highest priority tasks pending
     const pending = tasks.filter(t => t.status !== 'Completed').sort((a,b) => new Date(a.endDate) - new Date(b.endDate)).slice(0,2);
     pending.forEach(t => {
        acts.push({ type: 'task', text: `Priority Shift: "${t.name}" added to ${t.status}`, time: 'Recent', icon: Layout, color: 'text-amber-600', bg: 'bg-amber-50', ts: new Date(t.endDate) });
     });

     // Completed tasks
     const completed = tasks.filter(t => t.status === 'Completed').slice(-2);
     completed.forEach(t => {
        acts.push({ type: 'task', text: `Task Complete: "${t.name}" has been finished`, time: 'Recent', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', ts: new Date(t.startDate) });
     });

     // Check ins today
     const today = new Date().toISOString().split('T')[0];
     const atts = attendance.filter(a => a.date === today && a.checkIn).slice(-2);
     atts.forEach(a => {
        acts.push({ type: 'employee', text: `Entry Log: Clocked in at ${a.checkIn}`, time: 'Today', icon: UserPlus, color: 'text-teal-600', bg: 'bg-teal-50', ts: new Date() });
     });

     // Payroll
     const disbursed = Object.keys(financials).length;
     if (disbursed > 0) {
        acts.push({ type: 'payroll', text: `Payroll Sync: Generating batches for ${disbursed} accounts`, time: 'System', icon: Wallet, color: 'text-[#042f2e]', bg: 'bg-gray-100', ts: new Date() });
     }

     if(acts.length === 0) {
       acts.push({ type: 'system', text: 'System standing by...', time: 'Now', icon: CalendarDays, color: 'text-gray-400', bg: 'bg-gray-50', ts: new Date() });
     }

     return acts;
  }, [tasks, attendance, financials]);

  return (
    <div className="space-y-6">
      {activities.map((act, i) => (
        <div key={i} className="flex items-start gap-4 group cursor-pointer">
          <div className={`w-10 h-10 rounded-xl ${act.bg} flex items-center justify-center shrink-0 border border-black/5 group-hover:scale-110 transition-transform`}>
            <act.icon size={18} className={act.color} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#042f2e] leading-snug group-hover:text-teal-600 transition-colors">{act.text}</p>
            <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest mt-1">{act.time}</p>
          </div>
          <ArrowRight size={14} className="text-gray-200 group-hover:text-teal-500 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
        </div>
      ))}
      <button className="w-full py-4 mt-4 border-t border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-teal-600 transition-colors">
        View All Operational Logs
      </button>
    </div>
  );
};

export default ActivityFeed;
