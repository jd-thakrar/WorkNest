import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {
  User,
  Shield,
  FileText,
  CreditCard,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Zap,
  Clock,
  Calendar,
  Briefcase,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";

// ─── STEP DEFINITIONS ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Basic Details", icon: User, short: "Basic" },
  { id: 2, label: "Tax & Statutory", icon: Shield, short: "Tax" },
  { id: 3, label: "Personal & ID", icon: FileText, short: "Personal" },
  { id: 4, label: "Bank Details", icon: CreditCard, short: "Bank" },
  { id: 5, label: "Billing Setup", icon: DollarSign, short: "Billing" },
  { id: 6, label: "Review", icon: CheckCircle2, short: "Review" },
];

// ─── REUSABLE FIELD COMPONENTS ────────────────────────────────────────────────
const Input = ({ label, required, error, hint, className = "", ...props }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {label}
      {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
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
  <div className="flex flex-col gap-1.5">
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
  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
    <div>
      <p className="text-sm font-bold text-[#042f2e]">{label}</p>
      {description && (
        <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-all duration-300 relative shrink-0 ${checked ? "bg-teal-500" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${checked ? "left-7" : "left-1"}`}
      />
    </button>
  </div>
);

const SectionTitle = ({ title, subtitle, badge }) => (
  <div className="mb-6 flex items-start justify-between gap-4">
    <div>
      <h3
        style={{ fontFamily: "'Outfit', sans-serif" }}
        className="text-lg font-bold text-[#042f2e]"
      >
        {title}
      </h3>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
    {badge && (
      <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-teal-50 text-teal-600 border border-teal-100 whitespace-nowrap">
        {badge}
      </span>
    )}
  </div>
);

// ─── STEPPER HEADER ───────────────────────────────────────────────────────────
const StepperHeader = ({ current, total }) => {
  const pct = Math.round(((current - 1) / (total - 1)) * 100);
  return (
    <>
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
                className={`text-[9px] font-bold uppercase tracking-widest hidden lg:block
                ${active ? "text-teal-600" : done ? "text-teal-400" : "text-gray-300"}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ─── STEP COMPONENTS ──────────────────────────────────────────────────────────
const Step1 = ({ data, setData, errors }) => (
  <div>
    <SectionTitle title="Basic Details" subtitle="Core identity and role info" badge="Freelancer" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Input label="First Name" required value={data.firstName} onChange={e => setData({...data, firstName: e.target.value})} error={errors.firstName} />
      <Input label="Middle Name" value={data.middleName} onChange={e => setData({...data, middleName: e.target.value})} />
      <Input label="Last Name" required value={data.lastName} onChange={e => setData({...data, lastName: e.target.value})} error={errors.lastName} />
      <Input label="Freelancer ID" required value={data.freelancerId} onChange={e => setData({...data, freelancerId: e.target.value})} error={errors.freelancerId} />
      <Input label="Start Date" required type="date" value={data.startDate} onChange={e => setData({...data, startDate: e.target.value})} error={errors.startDate} />
      <Input label="Mobile" required value={data.mobile} onChange={e => setData({...data, mobile: e.target.value})} error={errors.mobile} />
      <Input label="Email" required type="email" value={data.email} onChange={e => setData({...data, email: e.target.value})} error={errors.email} />
      <Input label="Login Password" required type="password" value={data.password} onChange={e => setData({...data, password: e.target.value})} error={errors.password} />
      <Select label="Gender" required value={data.gender} onChange={e => setData({...data, gender: e.target.value})} error={errors.gender}>
         <option value="">Select...</option><option>Male</option><option>Female</option><option>Non-binary</option>
      </Select>
      <Select label="Location" required value={data.location} onChange={e => setData({...data, location: e.target.value})} error={errors.location}>
         <option value="">Select...</option><option>Remote</option><option>Office</option><option>Hybrid</option>
      </Select>
      <Input label="Designation" required value={data.designation} onChange={e => setData({...data, designation: e.target.value})} error={errors.designation} />
      <Select label="Department" required value={data.department} onChange={e => setData({...data, department: e.target.value})} error={errors.department}>
         <option value="">Select...</option><option>Engineering</option><option>Product</option><option>Design</option><option>Marketing</option>
      </Select>
    </div>
  </div>
);

const Step2 = ({ data, setData }) => (
  <div className="space-y-6">
    <SectionTitle title="Compliance & Tax" subtitle="Configure statutory setup" badge="Freelancer" />
    <Toggle label="TDS Applicable" description="Enable TDS deduction from invoices" checked={data.tds} onChange={v => setData({...data, tds: v})} />
    <Toggle label="GST Registered" description="Freelancer provides GST invoice" checked={data.gstEnabled} onChange={v => setData({...data, gstEnabled: v})} />
    {data.gstEnabled && <Input label="GST Number" value={data.gstNumber} onChange={e => setData({...data, gstNumber: e.target.value.toUpperCase()})} />}
  </div>
);

const Step3 = ({ data, setData, errors }) => (
  <div>
    <SectionTitle title="Personal & ID" subtitle="Legal identification records" badge="Freelancer" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Input label="Father's Name" required value={data.fatherName} onChange={e => setData({...data, fatherName: e.target.value})} error={errors.fatherName} />
      <Input label="Date of Birth" required type="date" value={data.dob} onChange={e => setData({...data, dob: e.target.value})} error={errors.dob} />
      <Input label="Aadhaar Number" required value={data.aadhaar} onChange={e => setData({...data, aadhaar: e.target.value})} error={errors.aadhaar} />
      <Input label="PAN Number" required value={data.pan} onChange={e => setData({...data, pan: e.target.value.toUpperCase()})} error={errors.pan} />
    </div>
    <div className="mt-5"><Input label="Residential Address" required value={data.address} onChange={e => setData({...data, address: e.target.value})} error={errors.address} /></div>
  </div>
);

const Step4 = ({ data, setData, errors }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    <SectionTitle title="Bank Routing" subtitle="Salary disbursement account" badge="Freelancer" />
    <Select label="Bank Name" required value={data.bankName} onChange={e => setData({...data, bankName: e.target.value})} error={errors.bankName}>
       <option value="">Select...</option><option>HDFC Bank</option><option>SBI</option><option>ICICI Bank</option>
    </Select>
    <Input label="Account Holder" required value={data.accountHolder} onChange={e => setData({...data, accountHolder: e.target.value})} error={errors.accountHolder} />
    <Input label="Account Number" required value={data.accountNumber} onChange={e => setData({...data, accountNumber: e.target.value})} error={errors.accountNumber} />
    <Input label="IFSC Code" required value={data.ifsc} onChange={e => setData({...data, ifsc: e.target.value.toUpperCase()})} error={errors.ifsc} />
  </div>
);

const PAYMENT_TYPES = [
  { key: "monthly", label: "Monthly", icon: Calendar, desc: "Retainer" },
  { key: "hourly", label: "Hourly", icon: Clock, desc: "Per Hour" },
  { key: "daily", label: "Daily", icon: Zap, desc: "Per Day" },
  { key: "project", label: "Project", icon: Briefcase, desc: "Fixed Fee" },
];

const Step5 = ({ data, setData }) => {
  const selected = PAYMENT_TYPES.find(t => t.key === (data.paymentType || 'monthly'));
  return (
    <div className="space-y-8">
      <SectionTitle title="Billing & Rate" subtitle="Identify the engagement model" badge="Freelancer" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
         {PAYMENT_TYPES.map(t => (
            <button key={t.key} onClick={() => setData({...data, paymentType: t.key})} className={`p-4 rounded-3xl border-2 transition-all ${data.paymentType === t.key ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-50 bg-gray-50/50 text-gray-400"}`}>
               <div className={`w-10 h-10 rounded-2xl mx-auto flex items-center justify-center mb-2 ${data.paymentType === t.key ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30" : "bg-white"}`}><t.icon size={18} /></div>
               <p className="text-xs font-bold text-center">{t.label}</p>
            </button>
         ))}
      </div>
      <div className="bg-purple-950 rounded-[40px] p-10 text-white relative shadow-2xl shadow-purple-950/20 overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full -mr-20 -mt-20" />
         <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-300/50 mb-4">Effective Billing Rate</p>
         <div className="flex items-center gap-6 border-b border-purple-800 pb-6 focus-within:border-purple-500 transition-all">
            <span className="text-6xl font-light text-purple-800">₹</span>
            <input type="number" value={data.rate} onChange={e => setData({...data, rate: e.target.value})} className="bg-transparent text-7xl font-bold outline-none w-full placeholder:text-purple-900" placeholder="0,000" />
         </div>
         <p className="text-[10px] text-purple-400 font-medium mt-6">Payout Frequency: <b className="text-white uppercase tracking-widest ml-1">{data.paymentType || 'Monthly'}</b></p>
      </div>
    </div>
  );
};

const ReviewCard = ({ title, items, onEdit }) => (
  <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-4 shadow-sm group">
    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center group-hover:bg-teal-50/20 transition-all">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</span>
      <button onClick={onEdit} className="text-[10px] font-bold uppercase text-teal-600 hover:text-teal-700 transition-colors">Modify</button>
    </div>
    <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-4">
      {items.map(([l, v], i) => (
        <div key={i}>
          <p className="text-[9px] uppercase tracking-widest text-gray-300 font-bold mb-0.5">{l}</p>
          <p className="text-sm font-bold text-[#042f2e]">{v || '—'}</p>
        </div>
      ))}
    </div>
  </div>
);

const Step6 = ({ formData, goToStep }) => (
  <div className="space-y-4">
    <SectionTitle title="Contract Analysis" subtitle="Final audit before registry release" badge="Freelancer" />
    <ReviewCard title="Profile Hub" onEdit={() => goToStep(1)} items={[["Identity", `${formData.basic.firstName} ${formData.basic.lastName}`], ["ID Tag", formData.basic.freelancerId], ["Email", formData.basic.email], ["Mobile", formData.basic.mobile]]} />
    <ReviewCard title="Compliance" onEdit={() => goToStep(2)} items={[["TDS", formData.tax.tds ? "Active" : "Disabled"], ["GST", formData.tax.gstEnabled ? formData.tax.gstNumber : "None"]]} />
    <ReviewCard title="Bank Routing" onEdit={() => goToStep(4)} items={[["Carrier", formData.bank.bankName], ["Holder", formData.bank.accountHolder], ["Account", formData.bank.accountNumber], ["IFSC", formData.bank.ifsc]]} />
    <ReviewCard title="Billing Framework" onEdit={() => goToStep(5)} items={[["Model", (formData.billing.paymentType || 'Monthly').toUpperCase()], ["Rate", `₹${formData.billing.rate || 0}`]]} />
  </div>
);

// ─── VALIDATION ───────────────────────────────────────────────────────────────
const validate = (step, data) => {
  const errs = {};
  if (step === 1) {
    if (!data.basic.firstName.trim()) errs.firstName = "First name required";
    if (!data.basic.lastName.trim()) errs.lastName = "Last name required";
    if (!data.basic.freelancerId.trim()) errs.freelancerId = "ID required";
    if (!data.basic.email.includes("@")) errs.email = "Valid email required";
    if (!data.basic.mobile.trim()) errs.mobile = "Mobile required";
    if (!data.basic.startDate) errs.startDate = "Start date required";
  }
  return errs;
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const AddFreelancer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    basic: { firstName: "", middleName: "", lastName: "", freelancerId: `FL-${Date.now().toString().slice(-4)}`, startDate: "", email: "", mobile: "", password: "", gender: "", location: "Remote", designation: "", department: "Engineering", type: "Freelancer" },
    tax: { tds: false, gstEnabled: false, gstNumber: "", otherDeductions: [] },
    personal: { fatherName: "", dob: "", address: "", aadhaar: "", pan: "" },
    bank: { bankName: "", accountHolder: "", accountNumber: "", ifsc: "", accountType: "Savings" },
    billing: { paymentType: "monthly", rate: "", currency: "INR" }
  });

  const setSection = (key) => (val) => setFormData(prev => ({ ...prev, [key]: val }));

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert("✅ Freelancer Onboarded Successfully!");
        navigate("/app/employees");
      } else {
        const d = await response.json();
        alert(`❌ Error: ${d.message || "Failed to onboard"}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server connectivity error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const next = () => {
    const errs = validate(step, formData);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(s => Math.min(s + 1, 6));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => {
    setErrors({});
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AdminLayout title="Freelancer Hub">
      <div className="max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in">
        <button onClick={() => navigate("/app/employees")} className="flex items-center gap-2 text-gray-400 hover:text-teal-600 transition-all group font-bold">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase tracking-widest">Back to Registry</span>
        </button>

        <div className="flex items-center justify-between">
           <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-3xl font-bold text-[#042f2e]">Add Freelancer</h2>
              <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">Onboarding Channel: External Contractor</p>
           </div>
           <span className="px-4 py-2 bg-purple-50 text-purple-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-purple-100 shadow-sm">Contract Registry</span>
        </div>

        <StepperHeader current={step} total={STEPS.length} />

        <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl p-10 min-h-[500px] flex flex-col">
           <div className="flex-1">
              {step === 1 && <Step1 data={formData.basic} setData={setSection('basic')} errors={errors} />}
              {step === 2 && <Step2 data={formData.tax} setData={setSection('tax')} />}
              {step === 3 && <Step3 data={formData.personal} setData={setSection('personal')} errors={errors} />}
              {step === 4 && <Step4 data={formData.bank} setData={setSection('bank')} errors={errors} />}
              {step === 5 && <Step5 data={formData.billing} setData={setSection('billing')} />}
              {step === 6 && <Step6 formData={formData} goToStep={setStep} />}
           </div>

           <div className="mt-12 pt-10 border-t border-gray-100 flex items-center justify-between">
              <button onClick={() => navigate(-1)} className="text-[10px] font-bold text-gray-400 hover:text-rose-500 uppercase tracking-widest transition-colors">Discard release</button>
              <div className="flex gap-4">
                 {step > 1 && <button onClick={prev} className="px-8 py-4 rounded-2xl border border-gray-200 text-xs font-bold text-gray-400 hover:bg-gray-50 transition-all">Previous</button>}
                 {step < 6 ? (
                   <button onClick={next} className="px-12 py-4 bg-[#042f2e] text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-teal-900/10 hover:bg-teal-900 transition-all">Next Segment</button>
                 ) : (
                   <button onClick={submit} disabled={isSubmitting} className="px-14 py-4 bg-teal-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition-all flex items-center gap-2">
                     {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                     {isSubmitting ? "Syncing..." : "Final Release"}
                   </button>
                 )}
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddFreelancer;
