import React, { useState, useEffect } from "react";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { Save, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useGlobal } from "../../context/GlobalContext";
import { API_URL } from "../../config";
import toast from "react-hot-toast";

// Components
import PersonalInfo from "../../components/employee/settings/PersonalInfo";
import StatutoryInfo from "../../components/employee/settings/StatutoryInfo";
import BankDetails from "../../components/employee/settings/BankDetails";

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { refreshGlobal } = useGlobal();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  
  // High-fidelity fallback logic: 
  // If employee record is missing, populate from Auth context
  const [formData, setFormData] = useState(() => {
    const names = user?.name ? user.name.split(' ') : ['', ''];
    return {
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
      email: user?.email || '',
      avatar: user?.avatar || '',
      employeeId: 'SYNC-PENDING',
      designation: user?.role === 'admin' ? 'System Administrator' : 'Personnel'
    };
  });

  const fetchProfile = async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/employee-self/finance`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.employee) {
          setEmployee(data.employee);
          setFormData(data.employee);
        }
      }
    } catch (err) {
      console.error("Profile Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user.token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSync = async () => {
    try {
      const res = await fetch(`${API_URL}/employee-self/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const updated = await res.json();
        setEmployee(updated.employee);
        updateUser({ ...user, name: `${updated.employee.firstName} ${updated.employee.lastName}` });
        refreshGlobal();
        toast.success("Profile Synchronized!", {
          style: { borderRadius: '16px', background: '#042f2e', color: '#fff', fontSize: '11px', fontWeight: 'bold' }
        });
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error("Sync error");
    }
  };

  if (loading && !employee) {
    return (
      <EmployeeLayout title="Account & Portal Settings">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
           <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Establishing Secure Stream...</p>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout title="Personnel Record Management">
      <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in">
        
        {/* Header Summary */}
        <div className="bg-[#042f2e] rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-3xl -mr-32 -mt-32" />
           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                 <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
                   {formData.firstName} {formData.lastName}
                 </h2>
                 <div className="flex flex-wrap items-center gap-4">
                    <span className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-lg text-[10px] font-black uppercase tracking-widest border border-teal-500/30">
                      ID: {formData.employeeId}
                    </span>
                    <span className="px-3 py-1 bg-white/10 text-white/60 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                      {formData.designation}
                    </span>
                 </div>
              </div>
              <button 
                onClick={handleSync}
                className="flex items-center gap-3 px-8 py-4 bg-teal-500 text-[#042f2e] rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-white transition-all shadow-lg active:scale-95"
              >
                 <Save size={18} />
                 Sync Changes to Database
              </button>
           </div>
        </div>

        {/* Data Sections */}
        <div className="space-y-10">
           <PersonalInfo employee={formData} onChange={handleChange} />
           <StatutoryInfo employee={formData} onChange={handleChange} />
           <BankDetails employee={formData} />
        </div>

        {/* Persistence Notice */}
        <div className="bg-slate-50 border border-slate-100 p-8 rounded-[32px] flex items-start gap-5">
           <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-teal-600/20">
              <RefreshCw size={24} className="text-white" />
           </div>
           <div>
              <h4 className="text-sm font-black text-[#042f2e] uppercase tracking-widest mb-1">Administrative Synchronization</h4>
              <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-2xl">
                 Your updates are transmitted directly to the central personnel database. Statutory fields are locked to maintain payroll compliance and prevent unauthorized record modification.
              </p>
           </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default Settings;
