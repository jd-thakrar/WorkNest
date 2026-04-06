import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {
  User,
  Shield,
  CreditCard,
  Wallet,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";

// ─── STEP DEFINITIONS ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Basic Details", icon: User, short: "Basic" },
  { id: 2, label: "Statutory", icon: Shield, short: "Statutory" },
  { id: 3, label: "Personal & ID", icon: FileText, short: "Personal" },
  { id: 4, label: "Bank Details", icon: CreditCard, short: "Bank" },
  { id: 5, label: "Salary Setup", icon: Wallet, short: "Salary" },
  { id: 6, label: "Review", icon: CheckCircle2, short: "Review" },
];

// ─── REUSABLE FIELD COMPONENTS (Exact match from AddEmployee) ──────────────────
const Input = ({ label, required, error, hint, suffixLabel, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <div className="flex items-center justify-between">
       <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
         {label}
         {required && <span className="text-rose-500 ml-1">*</span>}
       </label>
       {suffixLabel && <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100">{suffixLabel}</span>}
    </div>
    <input
      {...props}
      className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium text-[#042f2e] bg-white
        focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all
        placeholder:text-gray-300 ${error ? "border-rose-400 bg-rose-50/30" : "border-gray-200"}`}
    />
    {error && (
      <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
        <AlertCircle size={10} />
        {error}
      </p>
    )}
    {hint && !error && <p className="text-[10px] text-gray-400">{hint}</p>}
  </div>
);

const Select = ({ label, required, error, children, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {label}
      {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
    <select
      {...props}
      className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium text-[#042f2e] bg-white
        focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all
        ${error ? "border-rose-400 bg-rose-50/30" : "border-gray-200"}`}
    >
      {children}
    </select>
    {error && (
      <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
        <AlertCircle size={10} />
        {error}
      </p>
    )}
  </div>
);

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 mb-5">
    <div>
      <p className="text-sm font-bold text-[#042f2e]">{label}</p>
      {description && (
        <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${checked ? "bg-teal-500" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${checked ? "left-7" : "left-1"}`}
      />
    </button>
  </div>
);

const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-6">
    <h3
      style={{ fontFamily: "'Outfit', sans-serif" }}
      className="text-lg font-bold text-[#042f2e]"
    >
      {title}
    </h3>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

const ReviewCard = ({ title, items, onEdit }) => (
  <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm mb-4">
    <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-b border-gray-100">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {title}
      </p>
      <button
        type="button"
        onClick={onEdit}
        className="text-[10px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700 transition-colors"
      >
        Edit
      </button>
    </div>
    <div className="px-6 py-4 grid grid-cols-2 gap-3">
      {items
        .filter(([, v]) => v)
        .map(([label, val], i) => (
          <div key={i}>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300">
              {label}
            </p>
            <p className="text-sm font-bold text-[#042f2e] mt-0.5 break-all">
              {String(val)}
            </p>
          </div>
        ))}
    </div>
  </div>
);

// ─── STEPPER HEADER ───────────────────────────────────────────────────────────
const StepperHeader = ({ current, total }) => {
  const pct = Math.round(((current - 1) / (total - 1)) * 100);
  return (
    <>
      {/* Desktop / Tablet Stepper */}
      <div className="hidden md:flex items-center justify-between relative mb-10">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-teal-500 z-0 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
        {STEPS.map((step) => {
          const done = current > step.id;
          const active = current === step.id;
          return (
            <div
              key={step.id}
              className="flex flex-col items-center gap-2 z-10"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${
                  done
                    ? "bg-teal-500 border-teal-500 text-white"
                    : active
                      ? "bg-white border-teal-500 text-teal-600 shadow-lg shadow-teal-500/20"
                      : "bg-white border-gray-200 text-gray-300"
                }`}
              >
                {done ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <step.icon size={16} />
                )}
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-[0.2em] hidden lg:block ${active ? "text-teal-600" : done ? "text-teal-400" : "text-gray-300"}`}
              >
                {step.label}
              </span>
              <span
                className={`text-[9px] font-bold uppercase tracking-[0.2em] lg:hidden ${active ? "text-teal-600" : done ? "text-teal-400" : "text-gray-300"}`}
              >
                {step.short}
              </span>
            </div>
          );
        })}
      </div>
      {/* Mobile Progress Bar */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
            Step {current} of {total} — {STEPS[current - 1].label}
          </span>
          <span className="text-[10px] font-bold text-gray-400">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </>
  );
};


// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalRate, setOriginalRate] = useState(null);
  const [showAadhaar, setShowAadhaar] = useState(false);
  
  const [data, setData] = useState({
    firstName: "", middleName: "", lastName: "", employeeId: "", joiningDate: "",
    mobile: "", email: "", gender: "", location: "", designation: "", department: "",
    type: "Full-time",
    pfEnabled: false, pfEmployee: 12, pfEmployer: 12, pfPension: 8.33,
    profTax: false, tds: false, otherDeductions: [],
    fatherName: "", dob: "", address: "", aadhaar: "", pan: "", differentlyAbled: false,
    bankName: "", accountHolder: "", accountNumber: "", ifsc: "", accountType: "Savings",
    ctc: "", basic: "", hra: "", travel: "", daily: "", 
    billingRate: "", frequency: "Per Day", currency: "INR"
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`${API_URL}/employees`, {
           headers: { "Authorization": `Bearer ${user.token}` }
        });
        const employees = await response.json();
        const emp = employees.find(e => e._id === id);
        if (emp) {
            const b = emp.basic || {};
            const p = emp.personal || {};
            const bk = emp.bank || {};
            const s = emp.salary || {};
            const st = emp.statutory || {};
            const bl = emp.billing || {};
            const tax = emp.tax || {};

            setData({
                type: emp.type || b.type || "Full-time",
                firstName: b.firstName || emp.firstName || "",
                middleName: b.middleName || emp.middleName || "",
                lastName: b.lastName || emp.lastName || "",
                employeeId: b.employeeId || b.freelancerId || emp.employeeId || "",
                joiningDate: (b.joiningDate || b.startDate || emp.joiningDate || "").split('T')[0],
                mobile: b.mobile || emp.mobile || "",
                email: b.email || emp.email || "",
                gender: b.gender || emp.gender || "",
                location: b.location || emp.location || "",
                designation: b.designation || emp.designation || "",
                department: b.department || emp.department || "",
                
                pfEnabled: st.pfEnabled || emp.pfEnabled || false,
                pfEmployee: st.pfEmployee || emp.pfEmployee || 12,
                pfEmployer: st.pfEmployer || emp.pfEmployer || 12,
                pfPension: st.pfPension || emp.pfPension || 8.33,
                profTax: st.profTax || tax.profTax || emp.profTax || false,
                tds: st.tds || tax.tds || emp.tds || false,
                otherDeductions: st.otherDeductions || tax.otherDeductions || emp.otherDeductions || [],
                
                fatherName: p.fatherName || emp.fatherName || "",
                dob: (p.dob || emp.dob || "").split('T')[0],
                address: p.address || emp.address || "",
                aadhaar: p.aadhaar || emp.aadhaar || "",
                pan: p.pan || emp.pan || "",
                differentlyAbled: p.differentlyAbled || emp.differentlyAbled || false,
                
                bankName: bk.bankName || emp.bankName || "",
                accountHolder: bk.accountHolder || emp.accountHolder || "",
                accountNumber: bk.accountNumber || emp.accountNumber || "",
                ifsc: bk.ifsc || emp.ifsc || "",
                accountType: bk.accountType || emp.accountType || "Savings",
                
                ctc: s.ctc || emp.ctc || "",
                basic: s.basic || emp.basic || "",
                hra: s.hra || emp.hra || "",
                travel: s.travel || emp.travel || "",
                daily: s.daily || emp.daily || "",
                
                billingRate: bl.rate || s.billingRate || emp.billingRate || "",
                frequency: bl.paymentType || s.frequency || emp.frequency || "monthly",
                currency: bl.currency || s.currency || emp.currency || "INR"
            });
            setOriginalRate(emp.type === "Freelancer" || b.type === "Freelancer" ? (bl.rate || s.billingRate || emp.billingRate) : (s.ctc || emp.ctc));
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    if (user && id) fetchEmployee();
  }, [user, id]);

  const handleUpdate = async () => {
    setSaving(true);
    const payload = {
        basic: { ...data },
        personal: { ...data },
        bank: { ...data },
        salary: { ...data, billingRate: data.billingRate, frequency: data.frequency },
        statutory: { ...data },
        billing: { billingRate: data.billingRate, frequency: data.frequency, currency: data.currency }
    };
    try {
      const response = await fetch(`${API_URL}/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
        body: JSON.stringify(payload)
      });
      if (response.ok) navigate("/app/employees");
      else alert("Registry Update Failed");
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const next = () => {
    setStep((s) => Math.min(s + 1, 6));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return (
     <AdminLayout title="Edit Employee">
        <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 text-teal-500 animate-spin" /></div>
     </AdminLayout>
  );

  return (
    <AdminLayout title={`Edit ${data.type === "Freelancer" ? "Freelancer" : "Employee"}`}>
      <div className="max-w-4xl mx-auto space-y-6 pb-32">
        {/* Back Button */}
        <button
          onClick={() => navigate("/app/employees")}
          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-teal-600 transition-colors group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Employees
        </button>

        {/* Subtitle */}
        <p className="text-xs text-gray-400 font-medium -mt-4 mb-4 px-2">
          Update the configured record for {data.firstName} {data.lastName}.
        </p>

        {/* Stepper (Exact match to AddEmployee) */}
        <StepperHeader current={step} total={STEPS.length} />

        {/* Main Content Card */}
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 min-h-[400px] flex flex-col">
          <div className="flex-1">
            
            {step === 1 && (
              <div>
                <SectionTitle title="Basic Details" subtitle="Core employee identity and contact information" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <Input label="First Name" value={data.firstName} onChange={e => setData({...data, firstName: e.target.value})} />
                  <Input label="Middle Name" value={data.middleName} onChange={e => setData({...data, middleName: e.target.value})} />
                  <Input label="Last Name" value={data.lastName} onChange={e => setData({...data, lastName: e.target.value})} />
                  <Input label="Email Address" type="email" value={data.email} onChange={e => setData({...data, email: e.target.value})} />
                  <Input label="Mobile Number" value={data.mobile} onChange={e => setData({...data, mobile: e.target.value})} />
                  <Select label="Gender" value={data.gender} onChange={e => setData({...data, gender: e.target.value})}>
                      <option value="">Select gender...</option>
                      <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                  </Select>
                  <Select label="Work Location" value={data.location} onChange={e => setData({...data, location: e.target.value})}>
                      <option value="">Select location...</option>
                      <option>Ahmedabad HQ</option><option>Remote</option><option>Mumbai Office</option>
                  </Select>
                  <Select label="Department" value={data.department} onChange={e => setData({...data, department: e.target.value})}>
                      <option value="">Select department...</option>
                      <option>Engineering</option><option>Design</option><option>Product</option><option>Finance</option>
                  </Select>
                  <Input label="Designation" value={data.designation} onChange={e => setData({...data, designation: e.target.value})} />
                  <Input label="Joining Date" type="date" value={data.joiningDate} onChange={e => setData({...data, joiningDate: e.target.value})} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                 <SectionTitle title="Compliance & Deductions" subtitle="Configure statutory obligations for this employee" />
                 
                 <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <input type="checkbox" id="profTax" checked={!!data.profTax} onChange={e => setData({...data, profTax: e.target.checked})} className="w-4 h-4 accent-teal-600 cursor-pointer" />
                    <label htmlFor="profTax" className="cursor-pointer">
                      <p className="text-sm font-bold text-[#042f2e]">Professional Tax</p>
                      <p className="text-[10px] text-gray-400">Applicable as per state regulations</p>
                    </label>
                 </div>

                 <Toggle label="Provident Fund (PF)" description="Enable PF contribution for this employee" checked={!!data.pfEnabled} onChange={v => setData({...data, pfEnabled: v})} />
                 {data.pfEnabled && (
                    <div className="grid grid-cols-2 gap-4 mt-2 mb-6 p-6 bg-teal-50/50 rounded-2xl border border-teal-100">
                        <Input label="Employee Share %" value={data.pfEmployee} onChange={e => setData({...data, pfEmployee: e.target.value})} />
                        <Input label="Employer Share %" value={data.pfEmployer} onChange={e => setData({...data, pfEmployer: e.target.value})} />
                    </div>
                 )}

                 <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <input type="checkbox" id="tds" checked={!!data.tds} onChange={e => setData({...data, tds: e.target.checked})} className="w-4 h-4 accent-teal-600 cursor-pointer" />
                    <label htmlFor="tds" className="cursor-pointer">
                      <p className="text-sm font-bold text-[#042f2e]">TDS Applicable</p>
                      <p className="text-[10px] text-gray-400">Tax Deducted at Source as per Income Tax rules</p>
                    </label>
                 </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <SectionTitle title="Personal & ID Details" subtitle="Legal identification and personal background" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Father's Full Name" value={data.fatherName} onChange={e => setData({...data, fatherName: e.target.value})} />
                  <Input label="Date of Birth" type="date" value={data.dob} onChange={e => setData({...data, dob: e.target.value})} />
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Residential Address</label>
                    <textarea value={data.address} onChange={e => setData({...data, address: e.target.value})} rows={3} className="w-full px-4 py-3 rounded-2xl border text-sm font-medium text-[#042f2e] bg-white resize-none focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-gray-300 border-gray-200" />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Aadhaar Number</label>
                    <div className="relative">
                      <input type={showAadhaar ? "text" : "password"} value={data.aadhaar} onChange={e => setData({...data, aadhaar: e.target.value})} className="w-full px-4 py-3 pr-12 rounded-2xl border text-sm font-medium text-[#042f2e] bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-gray-300 border-gray-200" />
                      <button type="button" onClick={() => setShowAadhaar(!showAadhaar)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors">
                        {showAadhaar ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <Input label="PAN Number" value={data.pan} onChange={e => setData({...data, pan: e.target.value.toUpperCase()})} />
                  
                  <div className="md:col-span-2">
                    <Toggle label="Differently Abled" description="Employee qualifies for differently abled accommodations" checked={!!data.differentlyAbled} onChange={v => setData({...data, differentlyAbled: v})} />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <SectionTitle title="Bank Details" subtitle="Salary disbursement account information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Select label="Bank Name" value={data.bankName} onChange={e => setData({...data, bankName: e.target.value})}>
                      <option value="">Select bank...</option>
                      <option value="State Bank of India">State Bank of India</option>
                      <option value="SBI">SBI</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                  </Select>
                  <Input label="Account Holder Name" value={data.accountHolder} onChange={e => setData({...data, accountHolder: e.target.value})} />
                  <Input label="Account Number" type="number" value={data.accountNumber} onChange={e => setData({...data, accountNumber: e.target.value})} />
                  <Input label="IFSC Code" value={data.ifsc} onChange={e => setData({...data, ifsc: e.target.value.toUpperCase()})} />
                  
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Account Type</label>
                    <div className="flex gap-3 max-w-sm">
                      {["Savings", "Current"].map((type) => (
                        <button key={type} type="button" onClick={() => setData({ ...data, accountType: type })} className={`flex-1 py-3 rounded-2xl border text-sm font-bold transition-all duration-200 ${data.accountType === type ? "bg-[#042f2e] text-white border-[#042f2e]" : "bg-white text-gray-400 border-gray-200 hover:border-teal-300"}`}>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-8">
                 <SectionTitle title="Compensation Setup" subtitle="Define the salary structure and CTC breakdown" />
                 
                 <div className="bg-[#042f2e] rounded-[28px] p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    <div className="flex justify-between items-center mb-2">
                       <p className="text-[9px] font-bold uppercase tracking-widest text-teal-400">Monthly Target (Previous: ₹{originalRate || 0})</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-2xl font-bold text-white">₹</span>
                       <input 
                         type="number" 
                         value={data.type === "Freelancer" ? data.billingRate : data.ctc} 
                         onChange={e => setData({...data, [data.type === "Freelancer" ? 'billingRate' : 'ctc']: e.target.value})} 
                         className="bg-transparent text-3xl font-bold text-white placeholder:text-teal-800 outline-none border-b-2 border-teal-700 focus:border-teal-400 transition-all w-full" 
                         placeholder="0" 
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input 
                      label={data.type === "Freelancer" ? "Effective Rate" : "Basic Component"} 
                      value={data.type === "Freelancer" ? data.billingRate : data.basic} 
                      onChange={e => setData({...data, [data.type === "Freelancer" ? 'billingRate' : 'basic']: e.target.value})} 
                    />
                    <Select label="Payout Frequency" value={data.frequency} onChange={e => setData({...data, frequency: e.target.value})}>
                        <option value="monthly">Monthly</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="project">Per Project</option>
                        
                        {/* Legacy Full-time format compat: */}
                        <option value="Per Month">Per Month</option>
                        <option value="Per Hour">Per Hour</option>
                        <option value="Per Day">Per Day</option>
                    </Select>
                 </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                 <SectionTitle title="Review & Confirm" subtitle="Verify all updated details before committing the record" />
                 
                 <ReviewCard title="Basic Details" onEdit={() => setStep(1)} items={[
                    ["Full Name", `${data.firstName} ${data.lastName}`],
                    ["Email", data.email],
                    ["Department", data.department],
                    ["Designation", data.designation],
                 ]} />

                 <ReviewCard title="Statutory" onEdit={() => setStep(2)} items={[
                    ["Professional Tax", data.profTax ? "Enabled" : "Disabled"],
                    ["TDS", data.tds ? "Applicable" : "Not Applicable"],
                    ["Provident Fund", data.pfEnabled ? "Enabled" : "Disabled"],
                 ]} />

                 <ReviewCard title="Financial Contract" onEdit={() => setStep(5)} items={[
                    ["Target Rate", `₹${data.type === 'Full-time' ? data.ctc : data.billingRate}`],
                    ["Cycle", data.frequency],
                 ]} />

                 <ReviewCard title="Bank Details" onEdit={() => setStep(4)} items={[
                    ["Bank Name", data.bankName],
                    ["Account No", data.accountNumber],
                    ["IFSC Code", data.ifsc],
                 ]} />
              </div>
            )}
          </div>

          {/* Nav Buttons (Exact match to AddEmployee) */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
            <div>
              {step > 1 && (
                <button
                  onClick={prev}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300 hidden sm:inline">
                  Step {step} of {STEPS.length}
              </span>
              {step < 6 ? (
                <button
                  onClick={next}
                  className="flex items-center gap-2 px-8 py-3 bg-[#042f2e] text-white rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-teal-900/20 hover:bg-teal-900 transition-all"
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className={`flex items-center gap-2 px-8 py-3 bg-teal-500 text-white rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-teal-500/30 hover:bg-teal-400 transition-all ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <CheckCircle2 size={16} />
                  {saving ? "Updating..." : "Confirm Update"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditEmployee;
