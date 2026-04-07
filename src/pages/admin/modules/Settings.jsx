import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Hash, 
  Link2,
  Save,
  CheckCircle2,
  Globe,
  User as UserIcon,
  ShieldCheck,
  Briefcase,
  Users,
  Camera
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useGlobal } from '../../../context/GlobalContext';
import { API_URL } from '../../../config';
import toast from 'react-hot-toast';

const InputField = ({ label, icon: Icon, value, onChange, type = "text", disabled = false }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      {Icon && <Icon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-teal-500 transition-colors" />}
      <input 
        type={type}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-12' : 'px-5'} pr-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-sm font-bold text-[#042f2e] ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      />
    </div>
  </div>
);

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { refreshGlobal } = useGlobal();
  const [loading, setLoading] = useState(true);
  
  // Company Form State
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    pinCode: '',
    gstNo: '',
    tanNo: '',
    cinNo: '',
    udyamNo: '',
    aadhaar: '',
    cstNo: ''
  });

  // Admin Profile State
  const [adminData, setAdminData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    jobTitle: user?.jobTitle || '',
    teamSize: user?.teamSize || '',
    phone: user?.phone || ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Company Settings
        const settingsRes = await fetch(`${API_URL}/settings`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setFormData({
            ...data,
            companyName: data.companyName || user.company || '',
            email: data.email || user.email || '',
            phone: data.phone || user.phone || '',
          });
        }

        // 2. Fetch Latest Admin Profile
        const profileRes = await fetch(`${API_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setAdminData({
            name: profileData.name || '',
            email: profileData.email || '',
            company: profileData.company || '',
            jobTitle: profileData.jobTitle || '',
            teamSize: profileData.teamSize || '',
            phone: profileData.phone || ''
          });
          updateUser({ ...user, ...profileData }); // Keep context in sync
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.token]);

  const handleSaveCompany = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Company details updated successfully!');
      } else {
        toast.error('Failed to update settings');
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  const handleUpdateAdminProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify({
          ...adminData,
          company: adminData.company
        })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        updateUser(updatedUser); // Update local storage/context
        refreshGlobal(); // Trigger re-fetch of all operational data
        toast.success('Admin profile synchronized successfully!');
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  const handleAdminChange = (name) => (e) => {
    setAdminData(prev => ({ ...prev, [name]: e.target.value }));
  };

  const handleChange = (name) => (e) => {
    setFormData(prev => ({ ...prev, [name]: e.target.value }));
  };

  if (loading) return null;

  return (
    <AdminLayout title="System Configuration">
      <div className="max-w-4xl mx-auto space-y-8 animate-in pb-20">
        
        {/* Administrator Profile Section */}
        <div className="bg-white rounded-[40px] border border-gray-100 p-8 lg:p-12 shadow-sm space-y-12 shrink-0 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-3xl -mr-32 -mt-32 pointer-events-none" />
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-b border-gray-50 pb-8 relative z-10">
              <div className="flex items-center gap-8">
                 <div className="relative group/avatar">
                    <div className="w-24 h-24 rounded-[32px] overflow-hidden border-4 border-white shadow-2xl ring-1 ring-[#042f2e]/10 bg-[#042f2e]/5 transition-transform group-hover/avatar:scale-105 duration-500">
                      <img 
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${(user?.name || 'Admin').replace(' ', '+')}&background=042f2e&color=fff&bold=true&size=128`} 
                        className="w-full h-full object-cover" 
                        alt="Profile" 
                      />
                    </div>
                    <label className="absolute -bottom-2 -right-2 p-2 bg-[#042f2e] text-white rounded-xl shadow-lg cursor-pointer hover:bg-teal-900 transition-all border-4 border-white">
                      <Camera size={14} />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                             const reader = new FileReader();
                             reader.onloadend = async () => {
                                const base64 = reader.result;
                                try {
                                   const res = await fetch(`${API_URL}/auth/profile`, {
                                      method: 'PUT',
                                      headers: { 
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${user.token}` 
                                      },
                                      body: JSON.stringify({ avatar: base64 })
                                   });
                                   if (res.ok) {
                                      const updated = await res.json();
                                      updateUser(updated);
                                      toast.success('Identity portrait updated!', {
                                         style: { borderRadius: '16px', background: '#042f2e', color: '#fff', fontSize: '10px', fontWeight: 'bold' }
                                      });
                                   }
                                } catch (err) { toast.error('Upload failed'); }
                             };
                             reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                       <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-3xl font-bold text-[#042f2e] tracking-tight">{adminData.name || user?.name}</h3>
                       <span className="text-[9px] font-bold text-white bg-teal-500 px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">Admin</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 focus-within:ring-0">
                       <div className="flex items-center gap-1.5">
                          <Building2 size={12} className="text-teal-600" />
                          <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{adminData.company || user?.company || "Main Entity"}</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-teal-600" />
                          <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{adminData.phone || user?.phone || "N/A"}</span>
                       </div>
                    </div>
                 </div>
              </div>
              <button 
                onClick={handleUpdateAdminProfile}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-[#042f2e] text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-teal-900/10 hover:bg-teal-900 transition-all w-full sm:w-auto"
              >
                 <Save size={16} />
                 Sync Profile
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <InputField label="Admin Full Name" icon={UserIcon} value={adminData.name} onChange={handleAdminChange("name")} />
              <InputField label="Direct Email" icon={Mail} value={adminData.email} onChange={handleAdminChange("email")} type="email" />
              <InputField label="Personal Mobile" icon={Phone} value={adminData.phone} onChange={handleAdminChange("phone")} type="tel" />
              <InputField label="Job Title" icon={Briefcase} value={adminData.jobTitle} onChange={handleAdminChange("jobTitle")} />
              <InputField label="Current Organization" icon={Building2} value={adminData.company} onChange={handleAdminChange("company")} />
              
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Team Capacity</label>
                 <div className="relative group">
                    <Users size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-teal-500 transition-colors" />
                    <select 
                      value={adminData.teamSize}
                      onChange={handleAdminChange("teamSize")}
                      className="w-full pl-12 pr-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-sm font-bold text-[#042f2e] appearance-none"
                    >
                       <option value="">Select Capacity</option>
                       <option value="1-10">1-10 Members</option>
                       <option value="11-50">11-50 Members</option>
                       <option value="51-200">51-200 Members</option>
                       <option value="201-500">201-500 Members</option>
                       <option value="500+">500+ Members</option>
                    </select>
                 </div>
              </div>
           </div>
        </div>

        {/* Company Registration Section */}
        <div className="bg-white rounded-[40px] border border-gray-100 p-8 lg:p-12 shadow-sm space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-50 pb-8">
             <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl font-bold text-[#042f2e] tracking-tight">Main Entity Profile</h3>
                <p className="text-sm text-gray-400 font-medium tracking-tight">Manage legal registration and identification details.</p>
             </div>
             <button 
              onClick={handleSaveCompany}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-[#042f2e] text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-teal-900/10 hover:bg-teal-900 transition-all w-full sm:w-auto"
             >
                <Save size={16} />
                Update Profile
             </button>
          </div>

          <div className="space-y-10">
              <div className="grid grid-cols-1 gap-6">
                 <InputField label="Entity Full Legal Name" icon={Building2} value={formData.companyName} name="companyName" onChange={handleChange("companyName")} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Company Email" icon={Mail} value={formData.email} name="email" type="email" onChange={handleChange("email")} />
                    <InputField label="Mobile Number" icon={Phone} value={formData.phone} name="phone" type="tel" onChange={handleChange("phone")} />
                 </div>
                 <InputField label="Website URL" icon={Link2} value={formData.website} name="website" type="url" onChange={handleChange("website")} />
              </div>

              <div className="pt-10 border-t border-gray-50 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Registered Office Address</label>
                    <div className="relative">
                        <MapPin size={18} className="absolute left-5 top-5 text-gray-300" />
                        <textarea 
                          rows={2}
                          value={formData.address || ''}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-sm font-bold text-[#042f2e] resize-none"
                        />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="City" icon={Globe} value={formData.city} name="city" onChange={handleChange("city")} />
                    <InputField label="Pin Code" icon={Hash} value={formData.pinCode} name="pinCode" onChange={handleChange("pinCode")} />
                 </div>
              </div>

              <div className="pt-10 border-t border-gray-50">
                 <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-6 px-1">Legal Compliance & IDs</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    <InputField label="GST Number" icon={Hash} value={formData.gstNo} name="gstNo" onChange={handleChange("gstNo")} />
                    <InputField label="TAN Number" icon={Hash} value={formData.tanNo} name="tanNo" onChange={handleChange("tanNo")} />
                    <InputField label="CIN Number" icon={Hash} value={formData.cinNo} name="cinNo" onChange={handleChange("cinNo")} />
                    <InputField label="Udyam Registration No." icon={Hash} value={formData.udyamNo} name="udyamNo" onChange={handleChange("udyamNo")} />
                    <InputField label="Aadhaar / Individual PAN" icon={Hash} value={formData.aadhaar} name="aadhaar" onChange={handleChange("aadhaar")} />
                    <InputField label="CST Number" icon={Hash} value={formData.cstNo} name="cstNo" onChange={handleChange("cstNo")} />
                 </div>
              </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-6 rounded-[28px] flex items-start gap-4">
             <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                <CheckCircle2 size={24} className="text-white" />
             </div>
             <div>
                <h4 className="text-sm font-bold text-amber-900 mb-1">Administrative Audit</h4>
                <p className="text-xs text-amber-800/60 font-medium leading-relaxed">Changes to legal registration will be logged in the system audit trail for compliance verification.</p>
             </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
