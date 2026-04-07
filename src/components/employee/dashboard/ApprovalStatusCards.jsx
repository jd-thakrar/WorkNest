import { ArrowUpRight, FileCheck } from "lucide-react";

const ApprovalStatusCards = ({ request }) => {
  if (!request) {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm h-full flex flex-col justify-center items-center text-center opacity-70">
        <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
           <FileCheck size={20} />
        </div>
        <h4 className="text-[11px] font-black text-[#042f2e] uppercase tracking-widest leading-none mb-1">No Active Requests</h4>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest items-center flex gap-1">Status: Up-to-date <span className="text-teal-500">✓</span></p>
      </div>
    );
  }

  const isPending = request.status === "Pending";
  const isApproved = request.status === "Approved";

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm transition-all group h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
           <h4 
             style={{ fontFamily: "'Outfit', sans-serif" }}
             className="text-lg font-bold text-[#042f2e] tracking-tight"
           >
             Requests
           </h4>
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">{request.type}</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-teal-600 border border-slate-100">
           <FileCheck size={16} />
        </div>
      </div>

      <div className="space-y-4">
        <div>
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
           <div className="flex items-center gap-2">
              <div className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border ${
                isPending ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                isApproved ? 'bg-teal-50 text-teal-600 border-teal-100' : 
                'bg-slate-50 text-slate-500 border-slate-100'
              }`}>
                {request.status}
              </div>
           </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
           <div>
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">Date</p>
              <p className="text-[11px] font-bold text-slate-700">{request.date}</p>
           </div>
           <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-100 rounded-lg text-[8px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              Details <ArrowUpRight size={10} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalStatusCards;
