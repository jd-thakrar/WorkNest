import React from "react";
import { Clock, Calendar, ArrowRight, Timer, Play, CheckCircle2, Circle } from "lucide-react";

const TaskCard = ({ task, viewMode, onStatusUpdate }) => {
  const isGrid = viewMode === "grid";

  const statusActions = [
    { id: 'Pending', icon: Circle, color: 'text-slate-400', bg: 'bg-slate-50', hover: 'hover:bg-slate-200' },
    { id: 'In Progress', icon: Play, color: 'text-amber-500', bg: 'bg-amber-50', hover: 'hover:bg-amber-100' },
    { id: 'Completed', icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50', hover: 'hover:bg-teal-100' }
  ];

  return (
    <div className={`bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 hover:border-teal-500/20 transition-all group overflow-hidden ${isGrid ? "p-6 flex flex-col h-full" : "p-4 px-6 flex items-center justify-between"}`}>
      <div className={isGrid ? "flex-1" : "flex items-center gap-6 flex-1"}>
        <div className="flex items-center justify-between mb-4">
          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${task.priority === "High" || task.priority === "Critical" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-teal-50 text-teal-600 border-teal-100"}`}>
            {task.priority}
          </div>
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">
             {task.status}
          </div>
        </div>

        <div className={isGrid ? "" : "flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4"}>
          <div>
            <h4 className="text-[14px] font-bold text-[#042f2e] mb-2 group-hover:text-teal-700 transition-colors leading-tight">
              {task.title}
            </h4>
            <p className="text-[11px] text-slate-400 mb-3 line-clamp-1 italic">{task.description || "No description provided."}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <Calendar size={12} strokeWidth={2.5} /> {task.due}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-teal-600 font-bold uppercase tracking-widest">
                <Timer size={12} strokeWidth={2.5} /> {task.time}
              </div>
            </div>
          </div>

          {!isGrid && (
             <div className="flex items-center gap-2">
                {statusActions.map(action => (
                   <button 
                     key={action.id}
                     onClick={() => onStatusUpdate(task.id, action.id)}
                     className={`p-2 rounded-lg transition-all ${task.status === action.id ? `${action.bg} ${action.color} ring-1 ring-inset ring-current` : `text-slate-300 ${action.hover}`} `}
                     title={action.id}
                   >
                     <action.icon size={16} fill={task.status === action.id && action.id === 'In Progress' ? 'currentColor' : 'none'} />
                   </button>
                ))}
             </div>
          )}
        </div>
      </div>

      {isGrid && (
        <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
           <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Set Status</div>
           <div className="flex items-center gap-2">
              {statusActions.map(action => (
                 <button 
                   key={action.id}
                   onClick={() => onStatusUpdate(task.id, action.id)}
                   className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      task.status === action.id 
                      ? `${action.bg} ${action.color} ring-1 ring-inset ring-current shadow-sm` 
                      : `text-slate-300 ${action.hover}`
                   }`}
                 >
                   <action.icon size={12} fill={task.status === action.id && action.id === 'In Progress' ? 'currentColor' : 'none'} />
                   {task.status === action.id && action.id}
                 </button>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
