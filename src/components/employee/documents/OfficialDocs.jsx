import { FileText, ShieldAlert, BadgeCheck, Download, Clock, ShieldCheck as Shield } from "lucide-react";
import { generateDocumentPDF } from "../../../utils/pdfGenerator";

const OfficialDocs = ({ employeeName, company, joiningDate }) => {
  const formattedJoinDate = joiningDate 
    ? new Date(joiningDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : "Jan 02, 2026";

  const docs = [
    { 
       title: "Offer Letter", 
       type: "PDF Document", 
       size: "1.2 MB", 
       status: "Finalized",
       date: formattedJoinDate,
       icon: <FileText size={22} />,
       color: "blue"
    },
    { 
       title: "Employment Contract", 
       type: "Legal Agreement", 
       size: "2.4 MB", 
       status: "Bound",
       date: formattedJoinDate,
       icon: <Shield size={22} />,
       color: "teal"
    },
    { 
       title: "Organization Policy", 
       type: "Governance", 
       size: "0.8 MB", 
       status: "Active",
       date: "Mar 12, 2026", // Policies are usually independent of individual join dates
       icon: <BadgeCheck size={22} />,
       color: "indigo"
    },
  ];

  const getColorClasses = (color) => {
     const variants = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        teal: "bg-teal-50 text-teal-600 border-teal-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100"
     };
     return variants[color] || variants.blue;
  };

  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-200/60 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#042f2e] flex items-center justify-center text-teal-400 shadow-lg shadow-teal-900/20">
               <ShieldAlert size={22} />
            </div>
            <div>
               <h4 className="text-lg font-black text-[#042f2e] tracking-tight uppercase">
                  Central Repository
               </h4>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                  Secure access to your official assets
               </p>
            </div>
         </div>
         <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
            <Clock size={14} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Auto-Synced</span>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {docs.map((doc, i) => (
          <div
            key={i}
            onClick={() => generateDocumentPDF(doc.title, employeeName || "Personnel", company, joiningDate)}
            className="group p-6 rounded-[32px] bg-slate-50/50 border border-slate-100 flex flex-col justify-between hover:bg-white hover:border-teal-200 hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-500 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
               <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg">
                  <Download size={14} />
               </div>
            </div>

            <div>
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${getColorClasses(doc.color)}`}>
                  {doc.icon}
               </div>
               
               <h5 className="text-[13px] font-black text-[#042f2e] uppercase tracking-tight mb-1 group-hover:text-teal-600 transition-colors">
                  {doc.title}
               </h5>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">
                  {doc.type} • {doc.size}
               </p>

               <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                     {doc.status}
                  </span>
               </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100/50 flex items-center justify-between">
               <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">
                  Added: {doc.date}
               </span>
               <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                  <Download size={12} />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfficialDocs;
