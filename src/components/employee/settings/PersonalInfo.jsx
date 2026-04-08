import React, { useState } from "react";
import { User, Camera, ShieldCheck, Mail, Phone, Calendar, MapPin, Briefcase, Hash } from "lucide-react";

/**
 * PersonalInfo Component
 * Displays and allows editing of employee basic information, 
 * strictly reflecting the data points collected during the "Add Employee" process.
 */
const PersonalInfo = ({ employee, onChange, errors = {} }) => {
  const formData = {
    firstName: employee?.firstName || "",
    middleName: employee?.middleName || "",
    lastName: employee?.lastName || "",
    employeeId: employee?.employeeId || "NEW-EMP",
    joiningDate: employee?.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : "",
    mobile: employee?.mobile || "",
    email: employee?.email || "",
    gender: employee?.gender || "Not Specified",
    location: employee?.location || "Remote",
    designation: employee?.designation || employee?.role || "Associate",
    department: employee?.department || "General",
    type: employee?.type || "Full-time"
  };

  const fields = [
    { id: "firstName", name: "firstName", label: "First Name", icon: User, value: formData.firstName, error: errors.firstName },
    { id: "middleName", name: "middleName", label: "Middle Name", icon: User, value: formData.middleName, placeholder: "Optional" },
    { id: "lastName", name: "lastName", label: "Last Name", icon: User, value: formData.lastName, error: errors.lastName },
    { id: "employeeId", name: "employeeId", label: "Employee ID", icon: Hash, value: formData.employeeId, disabled: true },
    { id: "email", name: "email", label: "Work Email", icon: Mail, value: formData.email, disabled: true },
    { id: "mobile", name: "mobile", label: "Mobile Number", icon: Phone, value: formData.mobile, error: errors.mobile },
    { id: "gender", name: "gender", label: "Gender", icon: User, value: formData.gender },
    { id: "type", name: "type", label: "Employment Type", icon: Briefcase, value: formData.type, disabled: true },
    { id: "joiningDate", name: "joiningDate", label: "Joining Date", icon: Calendar, value: formData.joiningDate, type: "date", disabled: true },
    { id: "location", name: "location", label: "Work Location", icon: MapPin, value: formData.location, disabled: true },
    { id: "designation", name: "designation", label: "Designation", icon: Briefcase, value: formData.designation, disabled: true },
    { id: "department", name: "department", label: "Department", icon: Briefcase, value: formData.department, disabled: true },
  ];

  const displayJoinDate = employee?.joiningDate 
    ? new Date(employee.joiningDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "N/A";

  return (
    <div className="bg-white p-6 sm:p-10 rounded-xl border border-slate-200 shadow-sm overflow-hidden relative group">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#042f2e] flex items-center justify-center text-teal-400">
            <User size={20} />
          </div>
          <div>
            <h4 className="text-lg font-black text-[#042f2e] tracking-tight uppercase">Basic Identity</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Core Professional Profile</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-teal-100">
           <ShieldCheck size={12} /> Active Record
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Avatar Management */}
        <div className="flex flex-col items-center gap-6 shrink-0">
          <div className="relative group/avatar">
            <div className="w-40 h-40 rounded-xl border-4 border-slate-50 overflow-hidden shadow-2xl shadow-teal-900/10 group-hover/avatar:scale-[1.02] transition-transform duration-500 bg-slate-50">
              <img 
                src={employee?.avatar || `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=042f2e&color=fff&bold=true&size=128`} 
                alt="Profile" 
                className="w-full h-full object-cover transition-all duration-700 group-hover/avatar:scale-110" 
              />
              <div className="absolute inset-0 bg-[#042f2e]/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]">
                 <p className="text-[10px] font-black text-white uppercase tracking-widest">Replace Identity</p>
              </div>
            </div>
            <button className="absolute -bottom-3 -right-3 w-12 h-12 rounded-xl bg-[#042f2e] text-white flex items-center justify-center border-4 border-white shadow-xl hover:scale-110 active:scale-95 transition-all">
              <Camera size={20} />
            </button>
          </div>
          
          <div className="text-center space-y-1">
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Member Since</p>
             <p className="text-sm font-black text-[#042f2e]">{displayJoinDate}</p>
          </div>
        </div>

        {/* Right: Detailed Fields */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2 group/field">
              <div className="flex items-center gap-2 mb-1">
                 <field.icon size={12} className="text-slate-300 group-focus-within/field:text-teal-500 transition-colors" />
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
              </div>
              <input 
                name={field.name}
                type={field.type || "text"}
                value={field.value}
                onChange={onChange}
                disabled={field.disabled}
                placeholder={field.placeholder}
                className={`w-full px-5 py-3.5 rounded-xl border text-[13px] font-bold transition-all outline-none 
                  ${field.disabled 
                    ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                    : field.error 
                      ? "bg-rose-50/30 border-rose-500 text-rose-600 focus:ring-4 focus:ring-rose-500/5 shadow-sm"
                      : "bg-white border-slate-100 text-[#042f2e] hover:border-slate-200 focus:border-[#042f2e] focus:ring-4 focus:ring-[#042f2e]/5 focus:bg-white shadow-sm"}`} 
              />
              {field.error && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-top-1">{field.error}</p>}
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer Decoration */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors" />
    </div>
  );
};

export default PersonalInfo;
