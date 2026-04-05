import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import {
  User, Shield, FileText, CreditCard, DollarSign, CheckCircle2,
  ChevronRight, ChevronLeft, Plus, Trash2, ArrowLeft,
  Eye, EyeOff, Check, AlertCircle, Zap, Clock, Calendar, Briefcase
} from 'lucide-react';

// ─── STEP DEFINITIONS ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Basic Details',   icon: User,          short: 'Basic'    },
  { id: 2, label: 'Tax & Statutory', icon: Shield,        short: 'Tax'      },
  { id: 3, label: 'Personal & ID',   icon: FileText,      short: 'Personal' },
  { id: 4, label: 'Bank Details',    icon: CreditCard,    short: 'Bank'     },
  { id: 5, label: 'Billing Setup',   icon: DollarSign,    short: 'Billing'  },
  { id: 6, label: 'Review',          icon: CheckCircle2,  short: 'Review'   },
];

// ─── REUSABLE FIELD COMPONENTS ────────────────────────────────────────────────
const Input = ({ label, required, error, hint, className = '', ...props }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {label}{required && <span className="text-rose-500 ml-1">*</span>}
    </label>
    <input
      {...props}
      className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium text-[#042f2e] bg-white
        focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all
        placeholder:text-gray-300 ${error ? 'border-rose-400 bg-rose-50/30' : 'border-gray-200'}`}
    />
    {error && <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
    {hint && !error && <p className="text-[10px] text-gray-400">{hint}</p>}
  </div>
);

const Select = ({ label, required, error, children, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {label}{required && <span className="text-rose-500 ml-1">*</span>}
    </label>
    <select
      {...props}
      className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium text-[#042f2e] bg-white
        focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all
        ${error ? 'border-rose-400 bg-rose-50/30' : 'border-gray-200'}`}
    >
      {children}
    </select>
    {error && <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
  </div>
);

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
    <div>
      <p className="text-sm font-bold text-[#042f2e]">{label}</p>
      {description && <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-all duration-300 relative shrink-0 ${checked ? 'bg-teal-500' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${checked ? 'left-7' : 'left-1'}`} />
    </button>
  </div>
);

const SectionTitle = ({ title, subtitle, badge }) => (
  <div className="mb-6 flex items-start justify-between gap-4">
    <div>
      <h3 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-lg font-bold text-[#042f2e]">{title}</h3>
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
            <div key={step.id} className="flex flex-col items-center gap-2 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${done    ? 'bg-teal-500 border-teal-500 text-white'
                : active  ? 'bg-white border-teal-500 text-teal-600 shadow-lg shadow-teal-500/20'
                :           'bg-white border-gray-200 text-gray-300'}`}>
                {done ? <Check size={16} strokeWidth={3} /> : <step.icon size={16} />}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-widest hidden lg:block
                ${active ? 'text-teal-600' : done ? 'text-teal-400' : 'text-gray-300'}`}>
                {step.label}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-widest lg:hidden
                ${active ? 'text-teal-600' : done ? 'text-teal-400' : 'text-gray-300'}`}>
                {step.short}
              </span>
            </div>
          );
        })}
      </div>
      {/* Mobile */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
            Step {current} of {total} — {STEPS[current - 1].label}
          </span>
          <span className="text-[10px] font-bold text-gray-400">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </>
  );
};

// ─── STEP 1: BASIC DETAILS ────────────────────────────────────────────────────
const Step1 = ({ data, setData, errors }) => (
  <div>
    <SectionTitle
      title="Basic Details"
      subtitle="Core identity, contact, and role information"
      badge="Freelancer"
    />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Input label="First Name" required placeholder="e.g. Rohan" value={data.firstName} onChange={e => setData({ ...data, firstName: e.target.value })} error={errors.firstName} />
      <Input label="Middle Name" placeholder="Optional" value={data.middleName} onChange={e => setData({ ...data, middleName: e.target.value })} />
      <Input label="Last Name" required placeholder="e.g. Malhotra" value={data.lastName} onChange={e => setData({ ...data, lastName: e.target.value })} error={errors.lastName} />
      <Input label="Freelancer ID" required placeholder="Auto-generated" value={data.freelancerId} onChange={e => setData({ ...data, freelancerId: e.target.value })} hint="Auto-generated. You may override." error={errors.freelancerId} />
      <Input label="Start Date" required type="date" value={data.startDate} onChange={e => setData({ ...data, startDate: e.target.value })} error={errors.startDate} />
      <Input label="Mobile Number" required type="tel" placeholder="+91 98765 43210" value={data.mobile} onChange={e => setData({ ...data, mobile: e.target.value })} error={errors.mobile} />
      <Input label="Email Address" required type="email" placeholder="rohan@studio.io" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} error={errors.email} />
      <Input label="Set Login Password" required type="password" placeholder="••••••••" value={data.password} onChange={e => setData({ ...data, password: e.target.value })} error={errors.password} />
      <Select label="Gender" required value={data.gender} onChange={e => setData({ ...data, gender: e.target.value })} error={errors.gender}>
        <option value="">Select gender...</option>
        <option>Male</option>
        <option>Female</option>
        <option>Non-binary</option>
        <option>Prefer not to say</option>
      </Select>
      <Select label="Work Location" required value={data.location} onChange={e => setData({ ...data, location: e.target.value })} error={errors.location}>
        <option value="">Select location...</option>
        <option>Remote</option>
        <option>Office</option>
        <option>Hybrid</option>
      </Select>
      <Input label="Skill / Designation" required placeholder="e.g. UI/UX Designer" value={data.designation} onChange={e => setData({ ...data, designation: e.target.value })} error={errors.designation} />
      <Select label="Department / Project" required value={data.department} onChange={e => setData({ ...data, department: e.target.value })} error={errors.department}>
        <option value="">Select department or project...</option>
        <option>Engineering</option>
        <option>Design</option>
        <option>Product</option>
        <option>Marketing</option>
        <option>Content</option>
        <option>Special Project</option>
      </Select>
    </div>
  </div>
);

// ─── STEP 2: TAX & STATUTORY ──────────────────────────────────────────────────
const Step2 = ({ data, setData }) => {
  const addDeduction = () => setData({ ...data, otherDeductions: [...(data.otherDeductions || []), { label: '', amount: '' }] });
  const removeDeduction = (i) => setData({ ...data, otherDeductions: data.otherDeductions.filter((_, idx) => idx !== i) });
  const updateDeduction = (i, field, val) => {
    const updated = [...(data.otherDeductions || [])];
    updated[i] = { ...updated[i], [field]: val };
    setData({ ...data, otherDeductions: updated });
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Compliance & Tax Setup" subtitle="Configure tax and statutory obligations for this freelancer" badge="Freelancer" />

      {/* TDS — checkbox only; calculation handled by backend */}
      <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
        <input type="checkbox" id="tds" checked={!!data.tds} onChange={e => setData({ ...data, tds: e.target.checked })} className="w-4 h-4 accent-teal-600 cursor-pointer" />
        <label htmlFor="tds" className="cursor-pointer flex-1">
          <p className="text-sm font-bold text-[#042f2e]">TDS Applicable</p>
          <p className="text-[10px] text-gray-400">Tax Deducted at Source as per Income Tax Act — rate applied at invoice processing</p>
        </label>
        {data.tds && (
          <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-100 text-[9px] font-bold uppercase tracking-widest text-teal-600 shrink-0">
            Enabled
          </span>
        )}
      </div>

      {/* GST */}
      <div className="space-y-3">
        <Toggle
          label="GST Registered"
          description="Freelancer is GST registered and will invoice with GST"
          checked={!!data.gstEnabled}
          onChange={v => setData({ ...data, gstEnabled: v })}
        />
        {data.gstEnabled && (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
            <Input label="GST Number" placeholder="e.g. 22AAAAA0000A1Z5" value={data.gstNumber} onChange={e => setData({ ...data, gstNumber: e.target.value.toUpperCase() })} hint="15-character GSTIN" />
          </div>
        )}
      </div>

      {/* Other Deductions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Other Deductions</p>
          <button type="button" onClick={addDeduction} className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors">
            <Plus size={14} /> Add Row
          </button>
        </div>
        <div className="space-y-2">
          {(data.otherDeductions || []).map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <input type="text" placeholder="Deduction label" value={d.label} onChange={e => updateDeduction(i, 'label', e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-gray-300" />
              <input type="number" placeholder="Amount ₹" value={d.amount} onChange={e => updateDeduction(i, 'amount', e.target.value)}
                className="w-32 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-gray-300" />
              <button type="button" onClick={() => removeDeduction(i)} className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={14} /></button>
            </div>
          ))}
          {(!data.otherDeductions || data.otherDeductions.length === 0) && (
            <p className="text-xs text-gray-300 font-medium py-2">No deductions added. Click "+ Add Row" to begin.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── STEP 3: PERSONAL & ID ────────────────────────────────────────────────────
const Step3 = ({ data, setData, errors }) => {
  const [showAadhaar, setShowAadhaar] = useState(false);
  return (
    <div>
      <SectionTitle title="Personal & ID Details" subtitle="Legal identification and background" badge="Freelancer" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input label="Father's Name" required placeholder="e.g. Suresh Malhotra" value={data.fatherName} onChange={e => setData({ ...data, fatherName: e.target.value })} error={errors.fatherName} />
        <Input label="Date of Birth" required type="date" value={data.dob} onChange={e => setData({ ...data, dob: e.target.value })} error={errors.dob} />
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Residential Address <span className="text-rose-500">*</span></label>
          <textarea rows={3} placeholder="Full residential address..." value={data.address} onChange={e => setData({ ...data, address: e.target.value })}
            className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium text-[#042f2e] bg-white resize-none
              focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all
              placeholder:text-gray-300 ${errors.address ? 'border-rose-400 bg-rose-50/30' : 'border-gray-200'}`} />
          {errors.address && <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={10} />{errors.address}</p>}
        </div>
        {/* Aadhaar */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Aadhaar Number <span className="text-rose-500">*</span></label>
          <div className="relative">
            <input type={showAadhaar ? 'text' : 'password'} placeholder="XXXX XXXX XXXX" value={data.aadhaar} onChange={e => setData({ ...data, aadhaar: e.target.value })}
              className={`w-full px-4 py-3 pr-12 rounded-2xl border text-sm font-medium text-[#042f2e] bg-white
                focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all
                placeholder:text-gray-300 ${errors.aadhaar ? 'border-rose-400 bg-rose-50/30' : 'border-gray-200'}`} />
            <button type="button" onClick={() => setShowAadhaar(!showAadhaar)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors">
              {showAadhaar ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.aadhaar && <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.aadhaar}</p>}
        </div>
        <Input label="PAN Number" required placeholder="ABCDE1234F" value={data.pan} onChange={e => setData({ ...data, pan: e.target.value.toUpperCase() })} hint="Auto-converts to uppercase" error={errors.pan} />
        <div className="md:col-span-2">
          <Toggle label="Differently Abled" description="Freelancer qualifies for accessibility accommodations" checked={!!data.differentlyAbled} onChange={v => setData({ ...data, differentlyAbled: v })} />
        </div>
      </div>
    </div>
  );
};

// ─── STEP 4: BANK DETAILS ─────────────────────────────────────────────────────
const Step4 = ({ data, setData, errors }) => {
  const ifscValid = !data.ifsc || /^[A-Z]{4}0[A-Z0-9]{6}?/.test(data.ifsc);
  return (
    <div>
      <SectionTitle title="Bank Details" subtitle="Payment disbursement account" badge="Freelancer" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Select label="Bank Name" required value={data.bankName} onChange={e => setData({ ...data, bankName: e.target.value })} error={errors.bankName}>
          <option value="">Select bank...</option>
          <option>State Bank of India</option>
          <option>HDFC Bank</option>
          <option>ICICI Bank</option>
          <option>Axis Bank</option>
          <option>Kotak Mahindra Bank</option>
          <option>Bank of Baroda</option>
          <option>Punjab National Bank</option>
          <option>Other</option>
        </Select>
        <Input label="Account Holder Name" required placeholder="As per bank records" value={data.accountHolder} onChange={e => setData({ ...data, accountHolder: e.target.value })} error={errors.accountHolder} />
        <Input label="Account Number" required type="number" placeholder="XXXXXXXXXXXXXXXX" value={data.accountNumber} onChange={e => setData({ ...data, accountNumber: e.target.value })} error={errors.accountNumber} />
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">IFSC Code <span className="text-rose-500">*</span></label>
          <input type="text" placeholder="e.g. SBIN0001234" value={data.ifsc} onChange={e => setData({ ...data, ifsc: e.target.value.toUpperCase() })}
            className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium text-[#042f2e] bg-white
              focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-gray-300
              ${!ifscValid ? 'border-rose-400 bg-rose-50/30' : errors.ifsc ? 'border-rose-400' : 'border-gray-200'}`} />
          {data.ifsc && !ifscValid && <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1"><AlertCircle size={10} />Invalid IFSC format</p>}
          {data.ifsc && ifscValid && <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 size={10} />Valid IFSC format</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Account Type <span className="text-rose-500">*</span></label>
          <div className="flex gap-3">
            {['Savings', 'Current'].map(type => (
              <button key={type} type="button" onClick={() => setData({ ...data, accountType: type })}
                className={`flex-1 py-3 rounded-2xl border text-sm font-bold transition-all duration-200
                  ${data.accountType === type ? 'bg-[#042f2e] text-white border-[#042f2e]' : 'bg-white text-gray-400 border-gray-200 hover:border-teal-300'}`}>
                {type}
              </button>
            ))}
          </div>
          {errors.accountType && <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1"><AlertCircle size={10} />{errors.accountType}</p>}
        </div>
      </div>
    </div>
  );
};

// ─── STEP 5: BILLING SETUP ────────────────────────────────────────────────────
const PAYMENT_TYPES = [
  { key: 'monthly',  label: 'Monthly',       rateLabel: 'Monthly Rate',  icon: Calendar,  desc: 'Fixed monthly retainer' },
  { key: 'hourly',   label: 'Hourly',         rateLabel: 'Hourly Rate',   icon: Clock,     desc: 'Per hour billed' },
  { key: 'daily',    label: 'Daily',          rateLabel: 'Daily Rate',    icon: Zap,       desc: 'Per day billed' },
  { key: 'project',  label: 'Project Based',  rateLabel: 'Project Fee',   icon: Briefcase, desc: 'Fixed project fee' },
];

const Step5 = ({ data, setData }) => {
  const selectedType = PAYMENT_TYPES.find(t => t.key === data.paymentType) || PAYMENT_TYPES[0];
  const rate = parseFloat(data.rate) || 0;

  const payPreview = () => {
    switch (data.paymentType) {
      case 'hourly':  return `₹${(rate * (parseFloat(data.hoursWorked) || 0)).toLocaleString('en-IN')} (${data.hoursWorked || 0} hrs)`;
      case 'daily':   return `₹${(rate * (parseFloat(data.daysWorked) || 0)).toLocaleString('en-IN')} (${data.daysWorked || 0} days)`;
      case 'project': return `₹${rate.toLocaleString('en-IN')} (fixed)`;
      default:        return `₹${rate.toLocaleString('en-IN')}/month`;
    }
  };

  return (
    <div className="space-y-8">
      <SectionTitle title="Engagement & Payment Model" subtitle="Define how this freelancer is billed and paid" badge="Freelancer" />

      {/* Payment Type Selection */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Payment Model</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PAYMENT_TYPES.map(type => {
            const active = data.paymentType === type.key;
            return (
              <button
                key={type.key}
                type="button"
                onClick={() => setData({ ...data, paymentType: type.key })}
                className={`flex flex-col items-center gap-2 p-4 rounded-[24px] border-2 transition-all duration-200 text-center
                  ${active ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-100 bg-gray-50/50 text-gray-400 hover:border-teal-200 hover:bg-teal-50/30'}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${active ? 'bg-teal-500 text-white' : 'bg-white border border-gray-100'}`}>
                  <type.icon size={18} />
                </div>
                <span className={`text-xs font-bold ${active ? 'text-teal-700' : 'text-gray-500'}`}>{type.label}</span>
                <span className={`text-[9px] font-medium ${active ? 'text-teal-500' : 'text-gray-400'}`}>{type.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rate Input */}
      <div className="bg-[#042f2e] rounded-[28px] p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <p className="text-[9px] font-bold uppercase tracking-widest text-teal-300 mb-2">{selectedType.rateLabel}</p>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-white">₹</span>
          <input
            type="number"
            placeholder="Enter rate..."
            value={data.rate}
            onChange={e => setData({ ...data, rate: e.target.value })}
            className="bg-transparent text-3xl font-bold text-white placeholder:text-teal-900 outline-none border-b-2 border-teal-800 focus:border-teal-400 transition-all w-full"
          />
        </div>
        <p className="text-[9px] text-teal-300/70 mt-3">
          {data.paymentType === 'monthly' && `Annual: ₹${(rate * 12).toLocaleString('en-IN')}`}
          {data.paymentType === 'hourly'  && `8-hr day: ₹${(rate * 8).toLocaleString('en-IN')} | 20-day month: ₹${(rate * 8 * 20).toLocaleString('en-IN')}`}
          {data.paymentType === 'daily'   && `20-day month: ₹${(rate * 20).toLocaleString('en-IN')}`}
          {data.paymentType === 'project' && 'One-time fixed project fee'}
        </p>
      </div>

      {/* Variable Inputs for Hourly / Daily */}
      {(data.paymentType === 'hourly' || data.paymentType === 'daily') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.paymentType === 'hourly' && (
            <Input label="Hours Worked (this cycle)" type="number" placeholder="e.g. 80" value={data.hoursWorked} onChange={e => setData({ ...data, hoursWorked: e.target.value })} hint="Used for payout preview" />
          )}
          {data.paymentType === 'daily' && (
            <Input label="Days Worked (this cycle)" type="number" placeholder="e.g. 20" value={data.daysWorked} onChange={e => setData({ ...data, daysWorked: e.target.value })} hint="Used for payout preview" />
          )}
        </div>
      )}

      {/* Currency & Cycle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Currency" value={data.currency} onChange={e => setData({ ...data, currency: e.target.value })}>
          <option value="INR">INR — Indian Rupee (₹)</option>
          <option value="USD">USD — US Dollar (?)</option>
          <option value="EUR">EUR — Euro (€)</option>
          <option value="GBP">GBP — Pound Sterling (£)</option>
        </Select>
        <Select label="Payment Cycle" value={data.paymentCycle} onChange={e => setData({ ...data, paymentCycle: e.target.value })}>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="on-delivery">On Delivery</option>
          <option value="milestone">Milestone Based</option>
        </Select>
      </div>

      {/* Pay Preview */}
      {rate > 0 && (
        <div className="bg-teal-50/60 border border-teal-100 rounded-[24px] p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center shrink-0">
            <DollarSign size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-teal-400">Estimated Payout</p>
            <p className="text-xl font-bold text-teal-700 mt-0.5">{payPreview()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── STEP 6: REVIEW ───────────────────────────────────────────────────────────
const ReviewCard = ({ title, items, onEdit, accent = 'teal' }) => (
  <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm">
    <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-b border-gray-100">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</p>
      <button type="button" onClick={onEdit} className={`text-[10px] font-bold uppercase tracking-widest text-${accent}-600 hover:text-${accent}-700 transition-colors`}>Edit</button>
    </div>
    <div className="px-6 py-4 grid grid-cols-2 gap-3">
      {items.filter(([, v]) => v).map(([label, val], i) => (
        <div key={i}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300">{label}</p>
          <p className="text-sm font-bold text-[#042f2e] mt-0.5 break-all">{String(val)}</p>
        </div>
      ))}
    </div>
  </div>
);

const Step6 = ({ basic, tax, bank, billing, goToStep }) => (
  <div className="space-y-4">
    <SectionTitle title="Review & Confirm" subtitle="Verify all details before creating the freelancer profile" badge="Freelancer" />
    <ReviewCard
      title="Basic Details"
      onEdit={() => goToStep(1)}
      items={[
        ['Full Name', `${basic.firstName} ${basic.middleName || ''} ${basic.lastName}`],
        ['Freelancer ID', basic.freelancerId],
        ['Email', basic.email],
        ['Mobile', basic.mobile],
        ['Start Date', basic.startDate],
        ['Designation', basic.designation],
        ['Department', basic.department],
        ['Location', basic.location],
        ['Gender', basic.gender],
      ]}
    />
    <ReviewCard
      title="Tax Details"
      onEdit={() => goToStep(2)}
      items={[
        ['TDS', tax.tds ? `${tax.tdsPercent || '?'}% applicable` : 'Not applicable'],
        ['GST', tax.gstEnabled ? `Registered — ${tax.gstNumber || 'No. pending'}` : 'Not registered'],
        ['Other Deductions', (tax.otherDeductions || []).length > 0 ? `${tax.otherDeductions.length} item(s)` : 'None'],
      ]}
    />
    <ReviewCard
      title="Billing Structure"
      onEdit={() => goToStep(5)}
      items={[
        ['Payment Model', billing.paymentType || 'Monthly'],
        ['Rate', `₹${parseFloat(billing.rate || 0).toLocaleString('en-IN')}`],
        ['Currency', billing.currency || 'INR'],
        ['Payment Cycle', billing.paymentCycle || 'Monthly'],
      ]}
    />
    <ReviewCard
      title="Bank Details"
      onEdit={() => goToStep(4)}
      items={[
        ['Bank', bank.bankName],
        ['Account Holder', bank.accountHolder],
        ['Account No.', bank.accountNumber ? `XXXX${bank.accountNumber.slice(-4)}` : ''],
        ['IFSC', bank.ifsc],
        ['Account Type', bank.accountType],
      ]}
    />
  </div>
);

// ─── VALIDATION ───────────────────────────────────────────────────────────────
const validate = (step, data) => {
  const errs = {};
  if (step === 1) {
    if (!data.basic.firstName.trim()) errs.firstName = 'First name is required';
    if (!data.basic.lastName.trim()) errs.lastName = 'Last name is required';
    if (!data.basic.freelancerId.trim()) errs.freelancerId = 'Freelancer ID is required';
    if (!data.basic.startDate) errs.startDate = 'Start date is required';
    if (!data.basic.mobile.trim()) errs.mobile = 'Mobile number is required';
    if (!data.basic.email.includes('@')) errs.email = 'Valid email required';
    if (!data.basic.gender) errs.gender = 'Please select gender';
    if (!data.basic.location) errs.location = 'Please select work location';
    if (!data.basic.designation.trim()) errs.designation = 'Skill / Designation is required';
    if (!data.basic.department) errs.department = 'Please select department or project';
  }
  if (step === 3) {
    if (!data.personal.fatherName.trim()) errs.fatherName = "Father's name is required";
    if (!data.personal.address.trim()) errs.address = 'Address is required';
    if (!data.personal.aadhaar.trim()) errs.aadhaar = 'Aadhaar is required';
    if (data.personal.aadhaar && data.personal.aadhaar.replace(/\s/g, '').length !== 12) errs.aadhaar = 'Aadhaar must be 12 digits';
    if (!data.personal.pan.trim()) errs.pan = 'PAN number is required';
    if (data.personal.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]?/.test(data.personal.pan)) errs.pan = 'Invalid PAN format (ABCDE1234F)';
    if (!data.personal.dob) errs.dob = 'Date of birth is required';
  }
  if (step === 4) {
    if (!data.bank.bankName) errs.bankName = 'Please select bank';
    if (!data.bank.accountHolder.trim()) errs.accountHolder = 'Account holder name is required';
    if (!data.bank.accountNumber.trim()) errs.accountNumber = 'Account number is required';
    if (!data.bank.ifsc.trim()) errs.ifsc = 'IFSC code is required';
    if (!data.bank.accountType) errs.accountType = 'Please select account type';
  }
  return errs;
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
import { useAuth } from '../../context/AuthContext';

const genFLId = () => 'FRL' + String(Math.floor(1000 + Math.random() * 9000));
const INITIAL_FL_ID = genFLId();

const AddFreelancer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    basic:    { firstName: '', middleName: '', lastName: '', freelancerId: INITIAL_FL_ID, startDate: '', mobile: '', email: '', password: '', gender: '', location: '', designation: '', department: '', type: 'Freelancer' },
    tax:      { tds: false, tdsPercent: '', gstEnabled: false, gstNumber: '', otherDeductions: [] },
    personal: { fatherName: '', address: '', aadhaar: '', pan: '', dob: '', differentlyAbled: false },
    bank:     { bankName: '', accountHolder: '', accountNumber: '', ifsc: '', accountType: '' },
    billing:  { paymentType: 'monthly', rate: '', hoursWorked: '', daysWorked: '', currency: 'INR', paymentCycle: 'monthly' },
  });

  const setSection = (key) => (val) => setFormData(prev => ({ ...prev, [key]: val }));

  const next = () => {
    const errs = validate(step, formData);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(s => Math.min(s + 1, 6));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prev = () => { setErrors({}); setStep(s => Math.max(s - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Freelancer "${formData.basic.firstName} ${formData.basic.lastName}" has been onboarded successfully!`);
        navigate('/app/employees');
      } else {
        alert(`❌ Error: ${data.message || 'Failed to onboard freelancer'}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Add Freelancer">
      <div className="max-w-4xl mx-auto space-y-6 pb-10">

        {/* Back */}
        <button onClick={() => navigate('/app/employees')} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-teal-600 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Employees
        </button>

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif" }} className="text-2xl font-bold text-[#042f2e] tracking-tight">
              Freelancer Onboarding
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-1">Complete 6 steps to create a fully configured freelancer profile.</p>
          </div>
          <span className="px-4 py-2 rounded-[20px] bg-teal-50 border border-teal-100 text-[10px] font-bold uppercase tracking-widest text-teal-600">
            Contract Track
          </span>
        </div>

        {/* Stepper */}
        <StepperHeader current={step} total={STEPS.length} />

        {/* Form Card */}
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 min-h-[400px] flex flex-col">
          <div className="flex-1">
            {step === 1 && <Step1 data={formData.basic} setData={setSection('basic')} errors={errors} />}
            {step === 2 && <Step2 data={formData.tax} setData={setSection('tax')} />}
            {step === 3 && <Step3 data={formData.personal} setData={setSection('personal')} errors={errors} />}
            {step === 4 && <Step4 data={formData.bank} setData={setSection('bank')} errors={errors} />}
            {step === 5 && <Step5 data={formData.billing} setData={setSection('billing')} />}
            {step === 6 && <Step6 basic={formData.basic} tax={formData.tax} bank={formData.bank} billing={formData.billing} goToStep={(s) => { setStep(s); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
          </div>

          {/* Nav Buttons — inside card */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
            <div>
              {step > 1 && (
                <button onClick={prev} className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">
                  <ChevronLeft size={16} /> Previous
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300 hidden sm:inline">
                {Object.keys(errors).length > 0
                  ? <span className="text-rose-400">{Object.keys(errors).length} error(s) — fix to proceed</span>
                  : `Step ${step} of ${STEPS.length}`}
              </span>
              {step < 6 ? (
                <button onClick={next} className="flex items-center gap-2 px-8 py-3 bg-[#042f2e] text-white rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-teal-900/20 hover:bg-teal-900 transition-all">
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-8 py-3 bg-teal-600 text-white rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-teal-500/30 hover:bg-teal-500 transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <CheckCircle2 size={16} />
                  {isSubmitting ? 'Onboarding...' : 'Confirm & Create'}
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
