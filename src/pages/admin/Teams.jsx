import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Network,
  Plus,
  Search,
  Users,
  X,
  AlertCircle,
  Trash2,
  Edit3,
  Shield,
  Loader2,
  Calendar,
  LayoutDashboard,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";
import toast from "react-hot-toast";

// ─── HELPER: AVATAR STACK ─────────────────────────────────────────────────────
const AvatarStack = ({ members = [], max = 4, className = "" }) => {
  const visible = members.slice(0, max);
  const extra = members.length - max;
  return (
    <div className={`flex items-center -space-x-2 ${className}`}>
      {visible.map((m) => {
        const id = m._id || m;
        const name = m.firstName ? `${m.firstName} ${m.lastName}` : "Member";
        return (
          <div
            key={id}
            title={name}
            className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100 shrink-0"
          >
            <img 
              src={`https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`} 
              alt={name} 
              className="w-full h-full object-cover" 
            />
          </div>
        );
      })}
      {extra > 0 && (
        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[9px] font-bold text-gray-500 shadow-sm">
          +{extra}
        </div>
      )}
    </div>
  );
};

// ─── MODAL: TEAM DETAILS VIEW ─────────────────────────────────────────────────
const TeamDetailsModal = ({ team, onClose }) => {
  if (!team) return null;
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-end p-0 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white h-full w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-32 w-full relative ${team.color?.split(' ')[0] || 'bg-teal-50'} opacity-80 overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-[#042f2e] backdrop-blur-md rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-10 -mt-12 relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-white shadow-xl border border-gray-100 flex items-center justify-center mb-6 overflow-hidden">
            <Network size={40} className={team.color?.split(' ')[1] || 'text-teal-600'} />
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-3xl font-bold text-[#042f2e] tracking-tight">{team.name} Team</h2>
          <div className="flex items-center gap-4 mt-3">
             <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg border ${team.color}`}>
                Active
             </span>
             <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                <Calendar size={12} /> Established {new Date(team.createdAt).toLocaleDateString()}
             </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pt-10 space-y-10 custom-scrollbar pb-20">
          <div className="grid grid-cols-2 gap-4">
             <div className="p-5 bg-gray-50 rounded-[32px] border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Total Capacity</p>
                <div className="flex items-end gap-2">
                   <p className="text-3xl font-bold text-[#042f2e]">{team.members?.length || 0}</p>
                   <p className="text-[10px] font-bold text-teal-600 mb-1.5 uppercase tracking-widest">Personnel</p>
                </div>
             </div>
             <div className="p-5 bg-gray-50 rounded-[32px] border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Active Projects</p>
                <div className="flex items-end gap-2">
                   <p className="text-3xl font-bold text-[#042f2e]">{team.projects}</p>
                   <p className="text-[10px] font-bold text-amber-600 mb-1.5 uppercase tracking-widest">Tracked</p>
                </div>
             </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-5">Commander-in-Chief</label>
            {team.lead ? (
               <div className="flex items-center gap-5 p-6 bg-[#042f2e] text-white rounded-[32px] shadow-lg shadow-teal-900/20 group cursor-default">
                  <div className="relative">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${team.lead.firstName}+${team.lead.lastName}&background=random`} 
                      className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-inner"
                      alt="Lead" 
                    />
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-amber-400 border-4 border-[#042f2e] rounded-full flex items-center justify-center text-[#042f2e]">
                      <Shield size={12} className="fill-current" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-bold tracking-tight">{team.lead.firstName} {team.lead.lastName}</p>
                    <p className="text-[10px] text-teal-300 font-bold uppercase tracking-widest mt-0.5">{team.lead.designation}</p>
                  </div>
                  <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                    <ArrowRight size={18} />
                  </button>
               </div>
            ) : (
               <p className="text-sm text-gray-400 italic">No Lead Assigned</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-5">
               <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Team Roster</label>
               <span className="text-[10px] font-bold text-[#042f2e] bg-gray-100 px-3 py-1 rounded-full">{team.members?.length || 0} Members</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
               {team.members?.map((member) => (
                  <div key={member._id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-teal-200 hover:shadow-sm transition-all group">
                     <div className="flex items-center gap-4">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=random`} 
                          className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 group-hover:scale-105 transition-transform"
                          alt={member.firstName} 
                        />
                        <div>
                           <p className="text-sm font-bold text-[#042f2e]">{member.firstName} {member.lastName}</p>
                           <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{member.designation}</p>
                        </div>
                     </div>
                     <button className="p-2 text-gray-300 hover:text-teal-600 transition-colors">
                        <ArrowRight size={14} />
                     </button>
                  </div>
               ))}
            </div>
          </div>

          <div className="bg-teal-50/50 rounded-[40px] border border-teal-100/50 p-8">
             <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="text-teal-600" size={20} />
                <h4 className="text-sm font-bold text-[#042f2e] uppercase tracking-widest">Weekly Velocity</h4>
             </div>
             <div className="w-full h-2.5 bg-white/50 rounded-full overflow-hidden border border-teal-100/30">
                <div 
                  className="h-full bg-teal-500 rounded-full" 
                  style={{ width: '65%' }} 
                />
             </div>
             <div className="flex items-center justify-between mt-4">
                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Progressive Target</p>
                <p className="text-[10px] font-bold text-[#042f2e] uppercase tracking-widest">{(team.members?.length || 0) * 5} Units</p>
             </div>
          </div>
        </div>

        <div className="px-10 py-8 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
           <button 
             onClick={onClose}
             className="flex items-center gap-2 text-sm font-bold text-[#042f2e] hover:text-teal-700 transition-colors uppercase tracking-widest"
           >
              <LayoutDashboard size={16} /> Back to Overview
           </button>
           <button className="px-8 py-3 bg-[#042f2e] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-teal-900/10 hover:shadow-xl transition-all">
              Manage Assignments
           </button>
        </div>
      </div>
    </div>
  );
};

// ─── MODAL: ADD/EDIT TEAM ────────────────────────────────────────────────────────
const AddTeamModal = ({ onClose, onAdd, allEmployees, teamToEdit }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({ 
    name: teamToEdit?.name || "", 
    lead: teamToEdit?.lead?._id || teamToEdit?.lead || "", 
    members: teamToEdit?.members?.map(m => m._id || m) || [] 
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMember = (id) => {
    setForm((prev) => {
      const isSelected = prev.members.includes(id);
      let newMembers = isSelected
        ? prev.members.filter((m) => m !== id)
        : [...prev.members, id];
      const newLead = isSelected && prev.lead === id ? "" : prev.lead;
      return { ...prev, members: newMembers, lead: newLead };
    });
  };

  const handleSave = async () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Team name is required";
    if (!form.lead) errs.lead = "Please select a team lead";
    if (form.members.length === 0) errs.members = "Select at least one member";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const url = teamToEdit ? `${API_URL}/teams/${teamToEdit._id}` : `${API_URL}/teams`;
      const method = teamToEdit ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (response.ok) {
        onAdd(data);
        
        toast.success(teamToEdit ? 'Team configuration updated' : 'New unit activated', {
          icon: teamToEdit ? '⚙️' : '🏘️',
          style: { borderRadius: '16px', background: '#042f2e', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
        });

        onClose();
      } else {
        alert(data.message || "Failed to save team");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving team");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolvedMembers = form.members
    .map((id) => allEmployees.find((m) => m._id === id))
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="px-8 pt-8 pb-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl font-bold text-[#042f2e] tracking-tight">{teamToEdit ? "Edit Team" : "Create New Team"}</h2>
            <p className="text-xs text-gray-400 font-medium mt-1">{teamToEdit ? `Modifying settings for ${teamToEdit.name}` : "Organize your workforce into functional groups."}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all"><X size={20} /></button>
        </div>

        <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Team Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Frontend Titans"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full px-4 py-3.5 rounded-2xl border text-sm font-medium text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all ${errors.name ? "border-rose-400 bg-rose-50/30" : "border-gray-200"}`}
            />
            {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-1.5 flex items-center gap-1"><AlertCircle size={10} /> {errors.name}</p>}
          </div>

          <div className="bg-gray-50/50 rounded-3xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Edit Members <span className="text-rose-500">*</span></label>
              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">{form.members.length} Selected</span>
            </div>
            <div className="max-h-48 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
              {allEmployees.map((emp) => {
                const isSelected = form.members.includes(emp._id);
                return (
                  <button
                    key={emp._id}
                    onClick={() => toggleMember(emp._id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${isSelected ? "border-teal-500 bg-teal-50/40" : "border-transparent hover:border-gray-200 hover:bg-white"}`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <img src={`https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=random`} alt={emp.firstName} className="w-8 h-8 rounded-full bg-white border border-gray-100" />
                      <div>
                        <p className="text-sm font-bold text-[#042f2e]">{emp.firstName} {emp.lastName}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{emp.designation}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "bg-teal-500 border-teal-500" : "border-gray-300 bg-white"}`}>
                      {isSelected && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white"><path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {form.members.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-4">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Reassign Team Lead <span className="text-rose-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {resolvedMembers.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => setForm({ ...form, lead: m._id })}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${form.lead === m._id ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white hover:border-amber-200"}`}
                  >
                    <img src={`https://ui-avatars.com/api/?name=${m.firstName}+${m.lastName}&background=random`} alt={m.firstName} className="w-8 h-8 rounded-full border border-gray-100 bg-white" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#042f2e] truncate">{m.firstName} {m.lastName}</p>
                      <p className="text-[9px] text-gray-500 font-medium truncate">{m.designation}</p>
                    </div>
                    {form.lead === m._id && <Shield size={14} className="text-amber-500 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-between gap-4 shrink-0 bg-gray-50/50">
          <button onClick={onClose} className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">Cancel</button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 bg-[#042f2e] text-white rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-teal-900/20 hover:bg-teal-900 transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : teamToEdit ? <Edit3 size={16} /> : <Users size={16} />} 
            {isSubmitting ? "Processing..." : teamToEdit ? "Update Team" : "Create Team"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const Teams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, employeesRes] = await Promise.all([
          fetch(`${API_URL}/teams`, { headers: { "Authorization": `Bearer ${user.token}` } }),
          fetch(`${API_URL}/employees`, { headers: { "Authorization": `Bearer ${user.token}` } })
        ]);
        const teamsData = await teamsRes.json();
        const employeesData = await employeesRes.json();
        
        if (teamsRes.ok) setTeams(teamsData);
        if (employeesRes.ok) setAllEmployees(employeesData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddOrUpdate = (updatedTeam) => {
    if (teamToEdit) {
       setTeams(teams.map(t => t._id === updatedTeam._id ? updatedTeam : t));
    } else {
       setTeams([...teams, updatedTeam]);
    }
    setShowModal(false);
    setTeamToEdit(null);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      const res = await fetch(`${API_URL}/teams/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (res.ok) {
        setTeams(teams.filter(t => t._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Teams">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Assembling Teams...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Teams">
      <div className="space-y-6 animate-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-2.5 rounded-2xl flex-1 max-w-sm shadow-sm focus-within:ring-4 focus-within:ring-teal-500/5 focus-within:border-teal-400 transition-all">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-[#042f2e] w-full placeholder:text-gray-300"
            />
          </div>

          <button 
            onClick={() => {
              setTeamToEdit(null);
              setShowModal(true);
            }} 
            className="btn-primary py-2.5! px-6! text-sm!"
          >
            <Plus size={16} /> Create Team
          </button>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="bg-white rounded-[40px] border border-gray-100 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Network size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-[#042f2e] mb-1">No Teams Found</h3>
            <p className="text-sm text-gray-400">Manage your workforce effectively by creating teams.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTeams.map((team) => {
              const lead = team.lead;
              return (
                <div 
                  key={team._id} 
                  onClick={() => setSelectedTeam(team)}
                  className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all group flex flex-col cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className={`inline-block px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-lg border mb-3 ${team.color}`}>
                        {team.members?.length || 0} Members
                      </span>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-xl font-bold text-[#042f2e] group-hover:text-teal-700 transition-colors">
                        {team.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" 
                        onClick={(e) => {
                           e.stopPropagation();
                           setTeamToEdit(team);
                           setShowModal(true);
                        }}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" 
                        onClick={(e) => handleDelete(e, team._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-5">
                    {lead && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                        <div className="relative shrink-0">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${lead.firstName}+${lead.lastName}&background=random`} 
                            alt={lead.firstName} 
                            className="w-10 h-10 rounded-full border-2 border-white bg-white shadow-sm" 
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-100 border-2 border-white rounded-full flex items-center justify-center text-amber-500">
                            <Shield size={10} className="fill-current" />
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-amber-500 mb-0.5">Team Lead</p>
                          <p className="text-sm font-bold text-[#042f2e]">{lead.firstName} {lead.lastName}</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100/50 text-left">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-teal-600 mb-1">Projects</p>
                        <p className="text-xl font-bold text-[#042f2e]">{team.projects}</p>
                      </div>
                      <div className="p-3 bg-gray-50/50 rounded-2xl border border-gray-100 text-left">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Velocity</p>
                        <p className="text-xl font-bold text-[#042f2e]">{(team.members?.length || 0) * 5}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Roster</p>
                    <AvatarStack members={team.members} max={5} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <AddTeamModal
          allEmployees={allEmployees}
          teamToEdit={teamToEdit}
          onClose={() => {
            setShowModal(false);
            setTeamToEdit(null);
          }}
          onAdd={handleAddOrUpdate}
        />
      )}

      {selectedTeam && (
        <TeamDetailsModal 
          team={selectedTeam} 
          onClose={() => setSelectedTeam(null)} 
        />
      )}
    </AdminLayout>
  );
};

export default Teams;
