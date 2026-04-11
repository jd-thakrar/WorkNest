import React, { useState, useMemo } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import KanbanBoard from "../../components/admin/KanbanBoard";
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  AlertCircle,
  Clock,
  Flag,
  Trash2,
  Edit3,
  Eye,
  ArrowUpDown,
} from "lucide-react";
import { useGlobal } from "../../context/GlobalContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_URL } from "../../config";
import toast from "react-hot-toast";

// ─── MASTER DATA ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Finance",
  "HR",
  "Operations",
  "Legal",
];

const PRIORITY_CONFIG = {
  Critical: {
    color: "rose",
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-100",
  },
  High: {
    color: "orange",
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-100",
  },
  Medium: {
    color: "amber",
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
  },
  Low: {
    color: "gray",
    bg: "bg-gray-50",
    text: "text-gray-500",
    border: "border-gray-100",
  },
};

const STATUS_CONFIG = {
  Pending: {
    bg: "bg-gray-50",
    text: "text-gray-500",
    border: "border-gray-100",
    dot: "bg-gray-400",
  },
  "In Progress": {
    bg: "bg-teal-50",
    text: "text-teal-600",
    border: "border-teal-100",
    dot: "bg-teal-500",
  },
  Completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    dot: "bg-emerald-500",
  },
};

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const c = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Low;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${c.bg} ${c.text} ${c.border}`}>
      <Flag size={9} />
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG["Pending"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
};

const AvatarStack = ({ memberIds = [], allTeams = [], max = 3 }) => {
  const allMembers = allTeams.flatMap((t) => t.members || []);
  const resolved = (memberIds || []).map((id) => allMembers.find((m) => m.id === id)).filter(Boolean);
  const visible = resolved.slice(0, max);
  const extra = resolved.length - max;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((m) => (
        <div key={m.id} title={m.name} className="w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-gray-100 shrink-0">
          <img src={m.avatar} alt={m.name} className="w-full h-full" />
        </div>
      ))}
      {extra > 0 && <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500">+{extra}</div>}
    </div>
  );
};

const TaskDetailPanel = ({ task, allTeams, onClose, onEdit, onDelete }) => {
  if (!task) return null;
  const allMembers = (allTeams || []).flatMap((t) => t.members || []);
  const resolved = (task.members || []).map((id) => allMembers.find((m) => m.id === id)).filter(Boolean);


  return (
    <div className="fixed top-16 inset-x-0 bottom-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/20 backdrop-blur-sm" />
      <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2"><PriorityBadge priority={task.priority} /><StatusBadge status={task.status} /></div>
            <h3 style={{ fontFamily: "'Outfit',sans-serif" }} className="text-lg font-bold text-[#042f2e] leading-snug">{task.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"><X size={18} /></button>
        </div>
        <div className="flex-1 p-6 space-y-6">
          <div><p className="text-[9px] font-bold uppercase tracking-widest text-gray-300 mb-1.5">Description</p><p className="text-sm font-medium text-gray-600 leading-relaxed">{task.description || "No description provided."}</p></div>
          <div className="grid grid-cols-2 gap-4">
            {[["Team", task.teamName], ["Category", task.category], ["Start Date", task.startDate], ["Due Date", task.endDate]].map(([label, val]) => (
              <div key={label}><p className="text-[9px] font-bold uppercase tracking-widest text-gray-300 mb-1">{label}</p><p className="text-sm font-bold text-[#042f2e]">{val}</p></div>
            ))}
          </div>
          <div><p className="text-[9px] font-bold uppercase tracking-widest text-gray-300 mb-3">Assigned Members ({resolved.length})</p>
            <div className="space-y-2">
              {resolved.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0"><img src={m.avatar} alt={m.name} /></div>
                  <div><p className="text-sm font-bold text-[#042f2e]">{m.name}</p><p className="text-[10px] text-gray-400 font-medium">{m.role}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex items-center gap-3">
          <button onClick={() => onEdit(task)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"><Edit3 size={15} /> Edit Task</button>
          <button onClick={() => { onDelete(task.id); onClose(); }} className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-rose-100 text-rose-500 hover:bg-rose-50 transition-all text-sm font-bold"><Trash2 size={15} /></button>
        </div>
      </div>
    </div>
  );
};

const MODAL_STEPS = [{ id: 1, label: "Info" }, { id: 2, label: "Team" }, { id: 3, label: "Members" }, { id: 4, label: "Timeline" }, { id: 5, label: "Category" }, { id: 6, label: "Review" }];

const AddTaskModal = ({ onClose, onAdd, allTeams, initialData = null, allTasks = [] }) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(initialData ? 
    { id: initialData.id, name: initialData.name, description: initialData.description, priority: initialData.priority, teamId: initialData.teamId, memberIds: initialData.members, startDate: initialData.startDate, endDate: initialData.endDate, category: initialData.category } : 
    { name: "", description: "", priority: "Medium", teamId: "", memberIds: [], startDate: "", endDate: "", category: "" }
  );

  const selectedTeam = allTeams.find((t) => t.id === form.teamId);
  const pct = Math.round(((step - 1) / (MODAL_STEPS.length - 1)) * 100);

  const validateStep = () => {
    const errs = {};
    if (step === 1 && !form.name.trim()) errs.name = "Task name is required";
    if (step === 2 && !form.teamId) errs.teamId = "Please select a team";
    if (step === 3 && form.memberIds.length === 0) errs.memberIds = "Select at least one member";
    if (step === 4) {
      if (!form.startDate) errs.startDate = "Start date is required";
      if (!form.endDate) errs.endDate = "End date is required";
      if (form.startDate && form.endDate && form.endDate < form.startDate) errs.endDate = "End date cannot be before start date";
    }
    if (step === 5 && !form.category) errs.category = "Please select a category";
    return errs;
  };

  const next = () => {
    const errs = validateStep();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({}); setStep((s) => Math.min(s + 1, 6));
  };
  const prev = () => { setErrors({}); setStep((s) => Math.max(s - 1, 1)); };

  const toggleMember = (id) => {
    setForm((f) => ({ ...f, memberIds: f.memberIds.includes(id) ? f.memberIds.filter((m) => m !== id) : [...f.memberIds, id] }));
  };

  const selectAll = () => {
    if (!selectedTeam) return;
    const all = selectedTeam.members.map((m) => m.id);
    const allSelected = all.every((id) => form.memberIds.includes(id));
    setForm((f) => ({ ...f, memberIds: allSelected ? [] : all }));
  };

  const handleSubmit = () => {
    onAdd({ ...form, id: initialData?.id, teamName: selectedTeam?.name || "", status: initialData?.status || "Pending" });
    onClose();
  };

  const overlapWarning = React.useMemo(() => {
     if (!form.startDate || !form.endDate || form.memberIds.length === 0) return 0;
     const intersecting = allTasks.filter(t => t.id !== initialData?.id && t.status !== 'Completed' && t.startDate <= form.endDate && t.endDate >= form.startDate);
     let count = 0;
     form.memberIds.forEach(mId => { if (intersecting.some(t => t.members.includes(mId))) count++; });
     return count;
  }, [allTasks, form, initialData]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="px-8 pt-8 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl font-bold text-[#042f2e] tracking-tight">{initialData ? "Edit Task" : "Add New Task"}</h2>
              <p className="text-xs text-gray-400 font-medium mt-1">Step {step} of {MODAL_STEPS.length} — {MODAL_STEPS[step - 1].label}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"><X size={20} /></button>
          </div>
          <div className="flex items-center gap-1 mb-1">{MODAL_STEPS.map((s) => (<div key={s.id} className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${s.id <= step ? "bg-teal-500" : "bg-gray-100"}`} />))}</div>
          <p className="text-right text-[9px] font-bold text-gray-300">{pct}% complete</p>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-4 space-y-4 min-h-0">
          {step === 1 && (
            <div className="space-y-4">
              <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Task Name <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="e.g. Build Payroll API Integration" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-gray-300 ${errors.name ? "border-rose-400 bg-rose-50/30" : "border-gray-200"}`} />
                {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.name}</p>}
              </div>
              <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Description</label>
                <textarea rows={3} placeholder="Describe the task scope, requirements, or context..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-[#042f2e] resize-none focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-gray-300" />
              </div>
              <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {["Critical", "High", "Medium", "Low"].map((p) => (
                    <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })} className={`py-2.5 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all ${form.priority === p ? `bg-teal-50 text-teal-600 border-teal-200` : "bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200"}`}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Select a Team</p>
              {allTeams.map((team) => (
                <button key={team.id} type="button" onClick={() => setForm({ ...form, teamId: team.id, memberIds: [] })} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${form.teamId === team.id ? "border-teal-500 bg-teal-50/50" : "border-gray-100 bg-gray-50/30 hover:border-gray-200"}`}>
                  <div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold ${form.teamId === team.id ? "bg-teal-500 text-white" : "bg-white border border-gray-200 text-gray-400"}`}>{team.name[0]}</div><div className="text-left"><p className="text-sm font-bold text-[#042f2e]">{team.name}</p><p className="text-[10px] text-gray-400 font-medium">{team.members.length} members</p></div></div>
                  {form.teamId === team.id && <Check size={16} className="text-teal-500" />}
                </button>
              ))}
              {errors.teamId && <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.teamId}</p>}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{selectedTeam?.name} Members</p><button type="button" onClick={selectAll} className="text-[9px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700 transition-colors">{selectedTeam && selectedTeam.members.every((m) => form.memberIds.includes(m.id)) ? "Deselect All" : "Select All"}</button></div>
              {selectedTeam?.members.map((member) => {
                const selected = form.memberIds.includes(member.id);
                const activeCount = allTasks.filter(t => t.id !== initialData?.id && t.status !== 'Completed' && t.members.includes(member.id)).length;
                return (
                  <button key={member.id} type="button" onClick={() => toggleMember(member.id)} className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${selected ? "border-teal-500 bg-teal-50/40" : "border-gray-100 bg-gray-50/30 hover:border-gray-200"}`}>
                    <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white shrink-0 shadow-sm"><img src={member.avatar} alt={member.name} /></div>
                    <div className="text-left flex-1">
                       <p className="text-sm font-bold text-[#042f2e]">{member.name}</p>
                       <div className="flex items-center gap-2">
                           <p className="text-[10px] text-gray-400 font-medium">{member.role}</p>
                           {activeCount > 0 && <span className="text-[8px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded flex items-center gap-1"><AlertCircle size={8}/> {activeCount} Active Tasks</span>}
                       </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? "bg-teal-500 border-teal-500" : "border-gray-300"}`}>{selected && <Check size={10} strokeWidth={3} className="text-white" />}</div>
                  </button>
                );
              })}
              {errors.memberIds && <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.memberIds}</p>}
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Start Date <span className="text-rose-500">*</span></label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all ${errors.startDate ? "border-rose-400 bg-rose-50/30" : "border-gray-200"}`} />
                {errors.startDate && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.startDate}</p>}
              </div>
              <div><label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">End / Due Date <span className="text-rose-500">*</span></label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all ${errors.endDate ? "border-rose-400 bg-rose-50/30" : "border-gray-200"}`} />
                {errors.endDate && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.endDate}</p>}
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Department / Project Tag</p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })} className={`py-3 px-4 rounded-2xl border text-sm font-bold transition-all text-left ${form.category === cat ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-100 bg-gray-50/40 text-gray-500 hover:border-gray-200"}`}>{cat}</button>
                ))}
              </div>
            </div>
          )}
          {step === 6 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-[24px] border border-gray-100 p-5 relative">
                {overlapWarning > 0 && (
                   <div className="absolute -top-3 right-5 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase flex items-center gap-1 shadow-sm border border-amber-200">
                      <AlertCircle size={10} /> {overlapWarning} Member{overlapWarning > 1 ? 's' : ''} Overlapping
                   </div>
                )}
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300 mb-4">Review Summary</p>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-[#042f2e]">{form.name}</p>
                  <p className="text-xs text-gray-500">{form.description}</p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-bold">{form.priority}</span>
                    <span className="px-2 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-bold">{selectedTeam?.name}</span>
                    <span className="px-2 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-bold">{form.category}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-between gap-4 shrink-0">
          <button onClick={prev} className={`p-2 text-gray-400 ${step === 1 ? 'invisible' : ''}`}><ChevronLeft /></button>
          <div className="flex gap-2">
             {step < 6 ? ( <button onClick={next} className="btn-primary">Next <ChevronRight size={16} /></button> ) : ( <button onClick={handleSubmit} className="btn-primary bg-teal-600!">{initialData ? "Save Changes" : "Confirm & Create"}</button> )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Tasks = () => {
  const { user } = useAuth();
  const { tasks, setTasks, teamsWithMembers, refreshGlobal } = useGlobal();
  const [view, setView] = useState("table");
  const [showModal, setShowModal] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDir, setSortDir] = useState("asc");

  React.useEffect(() => {
    if (refreshGlobal) refreshGlobal();
  }, []);

  const filtered = useMemo(() => {
    let list = tasks.filter((t) => {
      const q = search.toLowerCase();
      if (q && !t.name.toLowerCase().includes(q)) return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterTeam && t.teamId !== filterTeam) return false;
      return true;
    });
    if (sortField) {
      list = [...list].sort((a, b) => {
        const av = a[sortField] || "", bv = b[sortField] || "";
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return list;
  }, [tasks, search, filterPriority, filterStatus, filterTeam, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const handleEditInit = (t) => {
    setDetailTask(null);
    setEditingTask(t);
    setShowModal(true);
  };

  const handleAdd = async (task) => {
     try {
        const isEdit = !!task.id;
        const method = isEdit ? "PUT" : "POST";
        const url = isEdit ? `${API_URL}/tasks/${task.id}` : `${API_URL}/tasks`;

        const res = await fetch(url, {
           method,
           headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
           body: JSON.stringify({ ...task, members: task.memberIds })
        });
        if (res.ok) {
           const saved = await res.json();
           const mapped = {
              id: saved._id, name: saved.name, description: saved.description, priority: saved.priority,
              teamId: saved.teamId?._id, teamName: saved.teamId?.name, 
              members: saved.members.map(m => m._id),
              startDate: saved.startDate?.split('T')[0], endDate: saved.endDate?.split('T')[0],
              status: saved.status, category: saved.category
           };
           setTasks((prev) => isEdit ? prev.map(t => t.id === mapped.id ? mapped : t) : [mapped, ...prev]);
           
           toast.success(isEdit ? 'Strategic objectives updated' : 'New initiative launched', {
              icon: isEdit ? '📝' : '🚀',
              style: { borderRadius: '16px', background: '#042f2e', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
           });
        }
     } catch (err) { console.error(err); }
  };
  const handleDelete = async (id) => {
     try {
         const res = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${user.token}` }});
         if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== id));
     } catch(err) { console.error(err); }
  };
  const handleStatusChange = async (id, newStatus) => {
     try {
         const res = await fetch(`${API_URL}/tasks/${id}`, { 
           method: "PUT", 
           headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
           body: JSON.stringify({ status: newStatus })
         });
         if (res.ok) setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
     } catch(err) { console.error(err); }
  };

  return (
    <AdminLayout title="Tasks">
      <div className="space-y-5 animate-in">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-2.5 rounded-2xl flex-1 max-w-sm shadow-sm transition-all focus-within:border-teal-400">
            <Search size={16} className="text-gray-400 shrink-0" /><input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm font-medium text-[#042f2e] w-full" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="appearance-none bg-white border border-gray-100 text-xs font-bold text-gray-500 px-3 py-2 rounded-xl"><option value="">Priority</option><option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="appearance-none bg-white border border-gray-100 text-xs font-bold text-gray-500 px-3 py-2 rounded-xl"><option value="">Status</option><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option></select>
            <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)} className="appearance-none bg-white border border-gray-100 text-xs font-bold text-gray-500 px-3 py-2 rounded-xl"><option value="">All Teams</option>{teamsWithMembers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
          </div>
          <div className="flex items-center gap-2 lg:ml-auto">
            <div className="flex items-center gap-1 p-1 bg-gray-100/50 border border-gray-100 rounded-2xl">
              <button onClick={() => setView("table")} className={`p-2 rounded-xl ${view === "table" ? "bg-[#042f2e] text-white" : "text-gray-400"}`}><List size={17} /></button>
              <button onClick={() => setView("kanban")} className={`p-2 rounded-xl ${view === "kanban" ? "bg-[#042f2e] text-white" : "text-gray-400"}`}><LayoutGrid size={17} /></button>
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary py-2.5! px-5! text-sm!"><Plus size={16} /> Add Task</button>
          </div>
        </div>
        {view === "table" && (
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto thin-scroll">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/60 border-b border-gray-100">
                    <th onClick={() => handleSort("name")} className="px-5 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400 cursor-pointer">Task Name <ArrowUpDown size={11} className={`ml-1 inline ${sortField === 'name' ? "text-teal-500" : "text-gray-300"}`} /></th>
                    <th className="px-5 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Team</th>
                    <th className="px-5 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Members</th>
                    <th className="px-5 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Priority</th>
                    <th className="px-5 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Due</th>
                    <th className="px-5 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                    <th className="px-5 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((task) => (
                    <tr key={task.id} className="hover:bg-teal-50/20 transition-colors cursor-pointer group" onClick={() => setDetailTask(task)}>
                      <td className="px-5 py-4"><p className="text-sm font-bold text-[#042f2e]">{task.name}</p><p className="text-[10px] text-gray-400">{task.category}</p></td>
                      <td className="px-5 py-4 text-sm font-bold text-gray-500">{task.teamName}</td>
                      <td className="px-5 py-4"><AvatarStack memberIds={task.members} allTeams={teamsWithMembers} /></td>
                      <td className="px-5 py-4"><PriorityBadge priority={task.priority} /></td>
                      <td className="px-5 py-4 text-xs font-bold text-gray-500">{task.endDate}</td>
                      <td className="px-5 py-4"><StatusBadge status={task.status} /></td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setDetailTask(task)} className="p-1.5 text-gray-300 hover:text-teal-600"><Eye size={14} /></button>
                          <button onClick={() => handleDelete(task.id)} className="p-1.5 text-gray-300 hover:text-rose-500"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {view === "kanban" && (
          <KanbanBoard tasks={filtered} allTeams={teamsWithMembers} onStatusChange={handleStatusChange} onTaskClick={setDetailTask} onAddTask={() => setShowModal(true)} />
        )}
      </div>
      {showModal && <AddTaskModal onClose={() => { setShowModal(false); setEditingTask(null); }} onAdd={handleAdd} allTeams={teamsWithMembers} initialData={editingTask} allTasks={tasks} />}
      {detailTask && (
        <TaskDetailPanel task={detailTask} allTeams={teamsWithMembers} onClose={() => setDetailTask(null)} onEdit={handleEditInit} onDelete={handleDelete} />
      )}
    </AdminLayout>
  );
};

export default Tasks;
