import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Plus,
  Trash2,
  ArrowLeft,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Hash,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from "lucide-react";

// ─── STEP DEFINITIONS ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Basic Details", icon: User, short: "Basic" },
  { id: 2, label: "Statutory", icon: Shield, short: "Statutory" },
  { id: 3, label: "Personal & ID", icon: FileText, short: "Personal" },
  { id: 4, label: "Bank Details", icon: CreditCard, short: "Bank" },
  { id: 5, label: "Salary Setup", icon: Wallet, short: "Salary" },
  { id: 6, label: "Review", icon: CheckCircle2, short: "Review" },
];

// ─── REUSABLE FIELD COMPONENTS ────────────────────────────────────────────────
const Input = ({ label, required, error, hint, ...props }) => (
  <div className="flex flex-col gap-1.5">
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
                className={`text-[9px] font-bold uppercase tracking-widest hidden lg:block ${active ? "text-teal-600" : done ? "text-teal-400" : "text-gray-300"}`}
              >
                {step.label}
              </span>
              <span
                className={`text-[9px] font-bold uppercase tracking-widest lg:hidden ${active ? "text-teal-600" : done ? "text-teal-400" : "text-gray-300"}`}
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

// ─── STEP 1: BASIC DETAILS ────────────────────────────────────────────────────
const Step1 = ({ data, setData, errors }) => (
  <div>
    <SectionTitle
      title="Basic Details"
      subtitle="Core employee identity and contact information"
    />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Input
        label="First Name"
        required
        placeholder="e.g. Ravi"
        value={data.firstName}
        onChange={(e) => setData({ ...data, firstName: e.target.value })}
        error={errors.firstName}
      />
      <Input
        label="Middle Name"
        placeholder="e.g. Kumar (optional)"
        value={data.middleName}
        onChange={(e) => setData({ ...data, middleName: e.target.value })}
      />
      <Input
        label="Last Name"
        required
        placeholder="e.g. Sharma"
        value={data.lastName}
        onChange={(e) => setData({ ...data, lastName: e.target.value })}
        error={errors.lastName}
      />
      <Input
        label="Employee ID"
        required
        placeholder="Auto-generated"
        value={data.employeeId}
        onChange={(e) => setData({ ...data, employeeId: e.target.value })}
        hint="Auto-generated. You may override."
        error={errors.employeeId}
      />
      <Input
        label="Joining Date"
        required
        type="date"
        value={data.joiningDate}
        onChange={(e) => setData({ ...data, joiningDate: e.target.value })}
        error={errors.joiningDate}
      />
      <Input
        label="Mobile Number"
        required
        type="tel"
        placeholder="+91 98765 43210"
        value={data.mobile}
        onChange={(e) => setData({ ...data, mobile: e.target.value })}
        error={errors.mobile}
      />
      <Input
        label="Email Address"
        required
        type="email"
        placeholder="ravi@worknest.com"
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        error={errors.email}
      />
      <Input
        label="Set Login Password"
        required
        type="password"
        placeholder="••••••••"
        value={data.password}
        onChange={(e) => setData({ ...data, password: e.target.value })}
        error={errors.password}
      />
      <Select
        label="Gender"
        required
        value={data.gender}
        onChange={(e) => setData({ ...data, gender: e.target.value })}
        error={errors.gender}
      >
        <option value="">Select gender...</option>
        <option>Male</option>
        <option>Female</option>
        <option>Non-binary</option>
        <option>Prefer not to say</option>
      </Select>
      <Select
        label="Work Location"
        required
        value={data.location}
        onChange={(e) => setData({ ...data, location: e.target.value })}
        error={errors.location}
      >
        <option value="">Select location...</option>
        <option>Ahmedabad HQ</option>
        <option>Mumbai Office</option>
        <option>Delhi Branch</option>
        <option>Remote</option>
      </Select>
      <Input
        label="Designation"
        required
        placeholder="e.g. Senior Developer"
        value={data.designation}
        onChange={(e) => setData({ ...data, designation: e.target.value })}
        error={errors.designation}
      />
      <Select
        label="Department"
        required
        value={data.department}
        onChange={(e) => setData({ ...data, department: e.target.value })}
        error={errors.department}
      >
        <option value="">Select department...</option>
        <option>Engineering</option>
        <option>Design</option>
        <option>Product</option>
        <option>HR</option>
        <option>Management</option>
        <option>Finance</option>
        <option>Sales</option>
      </Select>
    </div>
  </div>
);

// ─── STEP 2: STATUTORY DETAILS ────────────────────────────────────────────────
const Step2 = ({ data, setData }) => {
  const basicSalary = 25000; // placeholder until step 5
  const pfCalc = {
    empDeduction: (((data.pfEmployee || 12) / 100) * basicSalary).toFixed(0),
    empContrib: (((data.pfEmployer || 12) / 100) * basicSalary).toFixed(0),
    pension: (((data.pfPension || 8.33) / 100) * basicSalary).toFixed(0),
  };

  const addDeduction = () =>
    setData({
      ...data,
      otherDeductions: [
        ...(data.otherDeductions || []),
        { label: "", amount: "" },
      ],
    });
  const removeDeduction = (i) =>
    setData({
      ...data,
      otherDeductions: data.otherDeductions.filter((_, idx) => idx !== i),
    });
  const updateDeduction = (i, field, val) => {
    const updated = [...(data.otherDeductions || [])];
    updated[i] = { ...updated[i], [field]: val };
    setData({ ...data, otherDeductions: updated });
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Compliance & Deductions"
        subtitle="Configure statutory obligations for this employee"
      />

      {/* Professional Tax */}
      <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
        <input
          type="checkbox"
          id="profTax"
          checked={!!data.profTax}
          onChange={(e) => setData({ ...data, profTax: e.target.checked })}
          className="w-4 h-4 accent-teal-600 cursor-pointer"
        />
        <label htmlFor="profTax" className="cursor-pointer">
          <p className="text-sm font-bold text-[#042f2e]">Professional Tax</p>
          <p className="text-[10px] text-gray-400">
            Applicable as per state regulations
          </p>
        </label>
      </div>

      {/* Provident Fund */}
      <div className="space-y-4">
        <Toggle
          label="Provident Fund (PF)"
          description="Enable PF contribution for this employee"
          checked={!!data.pfEnabled}
          onChange={(v) => setData({ ...data, pfEnabled: v })}
        />
        {data.pfEnabled && (
          <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Employee Share %"
                  type="number"
                  placeholder="12"
                  value={data.pfEmployee ?? 12}
                  onChange={(e) =>
                    setData({ ...data, pfEmployee: e.target.value })
                  }
                />
              </div>
              <div>
                <Input
                  label="Employer PF %"
                  type="number"
                  placeholder="12"
                  value={data.pfEmployer ?? 12}
                  onChange={(e) =>
                    setData({ ...data, pfEmployer: e.target.value })
                  }
                />
              </div>
              <div>
                <Input
                  label="Pension %"
                  type="number"
                  placeholder="8.33"
                  value={data.pfPension ?? 8.33}
                  onChange={(e) =>
                    setData({ ...data, pfPension: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-teal-100">
              {[
                {
                  label: "Emp. PF Deduction",
                  val: `₹${pfCalc.empDeduction}/mo`,
                },
                {
                  label: "Employer Contribution",
                  val: `₹${pfCalc.empContrib}/mo`,
                },
                { label: "Pension Contribution", val: `₹${pfCalc.pension}/mo` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white rounded-xl p-3 border border-teal-100 text-center"
                >
                  <p className="text-[8px] font-bold uppercase tracking-widest text-teal-400">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-[#042f2e] mt-1">
                    {item.val}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-teal-600/70 font-medium">
              Preview based on ₹25,000 basic. Final values calculated from
              salary step.
            </p>
          </div>
        )}
      </div>

      {/* TDS */}
      <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
        <input
          type="checkbox"
          id="tds"
          checked={!!data.tds}
          onChange={(e) => setData({ ...data, tds: e.target.checked })}
          className="w-4 h-4 accent-teal-600 cursor-pointer"
        />
        <label htmlFor="tds" className="cursor-pointer">
          <p className="text-sm font-bold text-[#042f2e]">TDS Applicable</p>
          <p className="text-[10px] text-gray-400">
            Tax Deducted at Source as per Income Tax rules
          </p>
        </label>
      </div>

      {/* Other Deductions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Other Statutory Deductions
          </p>
          <button
            type="button"
            onClick={addDeduction}
            className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
          >
            <Plus size={14} /> Add Row
          </button>
        </div>
        <div className="space-y-2">
          {(data.otherDeductions || []).map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Deduction label"
                value={d.label}
                onChange={(e) => updateDeduction(i, "label", e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all"
              />
              <input
                type="number"
                placeholder="Amount ₹"
                value={d.amount}
                onChange={(e) => updateDeduction(i, "amount", e.target.value)}
                className="w-32 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all"
              />
              <button
                type="button"
                onClick={() => removeDeduction(i)}
                className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {(!data.otherDeductions || data.otherDeductions.length === 0) && (
            <p className="text-xs text-gray-300 font-medium py-2">
              No custom deductions added. Click "+ Add Row" to begin.
            </p>
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
      <SectionTitle
        title="Personal & ID Details"
        subtitle="Legal identification and personal background"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Father's Name"
          required
          placeholder="e.g. Suresh Sharma"
          value={data.fatherName}
          onChange={(e) => setData({ ...data, fatherName: e.target.value })}
          error={errors.fatherName}
        />
        <Input
          label="Date of Birth"
          required
          type="date"
          value={data.dob}
          onChange={(e) => setData({ ...data, dob: e.target.value })}
          error={errors.dob}
        />
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
            Residential Address <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Full residential address..."
            value={data.address}
            onChange={(e) => setData({ ...data, address: e.target.value })}
            className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium text-[#042f2e] bg-white resize-none
              focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all
              placeholder:text-gray-300 ${errors.address ? "border-rose-400 bg-rose-50/30" : "border-gray-200"}`}
          />
          {errors.address && (
            <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1">
              <AlertCircle size={10} />
              {errors.address}
            </p>
          )}
        </div>

        {/* Aadhaar */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Aadhaar Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showAadhaar ? "text" : "password"}
              placeholder="XXXX XXXX XXXX"
              value={data.aadhaar}
              onChange={(e) => setData({ ...data, aadhaar: e.target.value })}
              className={`w-full px-4 py-3 pr-12 rounded-2xl border text-sm font-medium text-[#042f2e] bg-white
                focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all
                placeholder:text-gray-300 ${errors.aadhaar ? "border-rose-400 bg-rose-50/30" : "border-gray-200"}`}
            />
            <button
              type="button"
              onClick={() => setShowAadhaar(!showAadhaar)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500 transition-colors"
            >
              {showAadhaar ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.aadhaar && (
            <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
              <AlertCircle size={10} />
              {errors.aadhaar}
            </p>
          )}
        </div>

        <Input
          label="PAN Number"
          required
          placeholder="ABCDE1234F"
          value={data.pan}
          onChange={(e) =>
            setData({ ...data, pan: e.target.value.toUpperCase() })
          }
          hint="Auto-converts to uppercase"
          error={errors.pan}
        />

        {/* Differently Abled */}
        <div className="md:col-span-2">
          <Toggle
            label="Differently Abled"
            description="Employee qualifies for differently abled accommodations"
            checked={!!data.differentlyAbled}
            onChange={(v) => setData({ ...data, differentlyAbled: v })}
          />
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
      <SectionTitle
        title="Bank Details"
        subtitle="Salary disbursement account information"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Select
          label="Bank Name"
          required
          value={data.bankName}
          onChange={(e) => setData({ ...data, bankName: e.target.value })}
          error={errors.bankName}
        >
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
        <Input
          label="Account Holder Name"
          required
          placeholder="As per bank records"
          value={data.accountHolder}
          onChange={(e) => setData({ ...data, accountHolder: e.target.value })}
          error={errors.accountHolder}
        />
        <Input
          label="Account Number"
          required
          type="number"
          placeholder="XXXXXXXXXXXXXXXX"
          value={data.accountNumber}
          onChange={(e) => setData({ ...data, accountNumber: e.target.value })}
          error={errors.accountNumber}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            IFSC Code <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. SBIN0001234"
            value={data.ifsc}
            onChange={(e) =>
              setData({ ...data, ifsc: e.target.value.toUpperCase() })
            }
            className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium text-[#042f2e] bg-white
              focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all
              placeholder:text-gray-300 ${!ifscValid ? "border-rose-400 bg-rose-50/30" : errors.ifsc ? "border-rose-400 bg-rose-50/30" : "border-gray-200"}`}
          />
          {data.ifsc && !ifscValid && (
            <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
              <AlertCircle size={10} />
              Invalid IFSC format (e.g. SBIN0001234)
            </p>
          )}
          {data.ifsc && ifscValid && (
            <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
              <CheckCircle2 size={10} />
              Valid IFSC format
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Account Type <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-3">
            {["Savings", "Current"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setData({ ...data, accountType: type })}
                className={`flex-1 py-3 rounded-2xl border text-sm font-bold transition-all duration-200 ${data.accountType === type ? "bg-[#042f2e] text-white border-[#042f2e]" : "bg-white text-gray-400 border-gray-200 hover:border-teal-300"}`}
              >
                {type}
              </button>
            ))}
          </div>
          {errors.accountType && (
            <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
              <AlertCircle size={10} />
              {errors.accountType}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── STEP 5: SALARY SETUP ─────────────────────────────────────────────────────
const Step5 = ({ data, setData }) => {
  const ctc = parseFloat(data.ctc) || 0;
  const basic = parseFloat(data.basic) || 0;
  const hra = parseFloat(data.hra) || 0;
  const travel = parseFloat(data.travel) || 0;
  const daily = parseFloat(data.daily) || 0;
  const otherAllowancesSum = (data.otherAllowances || []).reduce(
    (s, a) => s + (parseFloat(a.amount) || 0),
    0,
  );
  const carPerq = parseFloat(data.carPerquisite) || 0;
  const otherPerqSum = (data.otherPerquisites || []).reduce(
    (s, p) => s + (parseFloat(p.amount) || 0),
    0,
  );
  const calculatedCTC =
    basic + hra + travel + daily + otherAllowancesSum + carPerq + otherPerqSum;
  const diff = ctc - calculatedCTC;

  const addAllowance = () =>
    setData({
      ...data,
      otherAllowances: [
        ...(data.otherAllowances || []),
        { label: "", amount: "" },
      ],
    });
  const removeAllowance = (i) =>
    setData({
      ...data,
      otherAllowances: data.otherAllowances.filter((_, idx) => idx !== i),
    });
  const updateAllowance = (i, field, val) => {
    const updated = [...(data.otherAllowances || [])];
    updated[i] = { ...updated[i], [field]: val };
    setData({ ...data, otherAllowances: updated });
  };

  const addPerq = () =>
    setData({
      ...data,
      otherPerquisites: [
        ...(data.otherPerquisites || []),
        { label: "", amount: "" },
      ],
    });
  const removePerq = (i) =>
    setData({
      ...data,
      otherPerquisites: data.otherPerquisites.filter((_, idx) => idx !== i),
    });
  const updatePerq = (i, field, val) => {
    const updated = [...(data.otherPerquisites || [])];
    updated[i] = { ...updated[i], [field]: val };
    setData({ ...data, otherPerquisites: updated });
  };

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Compensation Setup"
        subtitle="Define the salary structure and CTC breakdown"
      />

      {/* CTC */}
      <div className="bg-[#042f2e] rounded-[28px] p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <p className="text-[9px] font-bold uppercase tracking-widest text-teal-400 mb-2">
          Monthly CTC (Cost to Company)
        </p>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-white">₹</span>
          <input
            type="number"
            placeholder="50000"
            value={data.ctc}
            onChange={(e) => setData({ ...data, ctc: e.target.value })}
            className="bg-transparent text-3xl font-bold text-white placeholder:text-teal-800 outline-none border-b-2 border-teal-700 focus:border-teal-400 transition-all w-full"
          />
        </div>
        <p className="text-[9px] text-teal-400/70 mt-3">
          Annual: ₹{(ctc * 12).toLocaleString("en-IN")}
        </p>
      </div>

      {/* Salary Components */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Salary Components
          </p>
          {diff !== 0 && (
            <span
              className={`text-[9px] font-bold px-2 py-1 rounded-full ${diff > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}
            >
              {diff > 0
                ? `₹${diff.toLocaleString("en-IN")} Unallocated`
                : `Exceeds CTC by ₹${Math.abs(diff).toLocaleString("en-IN")}`}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Basic Salary"
            type="number"
            placeholder="e.g. 25000"
            value={data.basic}
            onChange={(e) => setData({ ...data, basic: e.target.value })}
            hint="Typically 40–50% of CTC"
          />
          <Input
            label="HRA"
            type="number"
            placeholder="e.g. 10000"
            value={data.hra}
            onChange={(e) => setData({ ...data, hra: e.target.value })}
            hint="Typically 40–50% of Basic"
          />
          <Input
            label="Travelling Allowance"
            type="number"
            placeholder="e.g. 2000"
            value={data.travel}
            onChange={(e) => setData({ ...data, travel: e.target.value })}
          />
          <Input
            label="Daily Allowance"
            type="number"
            placeholder="e.g. 1000"
            value={data.daily}
            onChange={(e) => setData({ ...data, daily: e.target.value })}
          />
        </div>

        {/* Dynamic Other Allowances */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Other Allowances
            </p>
            <div className="flex items-center gap-2">
              {ctc > 0 && diff > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      otherAllowances: [
                        ...(data.otherAllowances || []),
                        { label: "Special Allowance", amount: String(diff) },
                      ],
                    })
                  }
                  className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-all"
                >
                  + Auto-fill ₹{diff.toLocaleString("en-IN")} Remaining
                </button>
              )}
              <button
                type="button"
                onClick={addAllowance}
                className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
          {ctc > 0 && diff > 0 && (data.otherAllowances || []).length === 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50/60 border border-amber-100 rounded-2xl">
              <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
              <p className="text-[11px] font-bold text-amber-700">
                ₹{diff.toLocaleString("en-IN")} of CTC is unallocated. Click
                "Auto-fill" to add it as a Special Allowance.
              </p>
            </div>
          )}
          {(data.otherAllowances || []).map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Allowance name"
                value={a.label}
                onChange={(e) => updateAllowance(i, "label", e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-gray-300"
              />
              <input
                type="number"
                placeholder="₹ Amount"
                value={a.amount}
                onChange={(e) => updateAllowance(i, "amount", e.target.value)}
                className="w-32 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-gray-300"
              />
              <button
                type="button"
                onClick={() => removeAllowance(i)}
                className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Perquisites */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          Perquisites
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Car Perquisite"
            type="number"
            placeholder="e.g. 1500"
            value={data.carPerquisite}
            onChange={(e) =>
              setData({ ...data, carPerquisite: e.target.value })
            }
          />
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Other Perquisites
            </p>
            <button
              type="button"
              onClick={addPerq}
              className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          {(data.otherPerquisites || []).map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Perquisite name"
                value={p.label}
                onChange={(e) => updatePerq(i, "label", e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-gray-300"
              />
              <input
                type="number"
                placeholder="₹ Amount"
                value={p.amount}
                onChange={(e) => updatePerq(i, "amount", e.target.value)}
                className="w-32 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium text-[#042f2e] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-gray-300"
              />
              <button
                type="button"
                onClick={() => removePerq(i)}
                className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTC Breakdown */}
      <div className="bg-gray-50 rounded-[24px] border border-gray-100 p-5">
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          CTC Formula Breakdown
        </p>
        <div className="space-y-2 text-sm">
          {[
            ["Basic", basic],
            ["HRA", hra],
            ["Travel Allowance", travel],
            ["Daily Allowance", daily],
            ...(data.otherAllowances || []).map((a) => [
              a.label || "Allowance",
              parseFloat(a.amount) || 0,
            ]),
            ["Car Perquisite", carPerq],
            ...(data.otherPerquisites || []).map((p) => [
              p.label || "Perquisite",
              parseFloat(p.amount) || 0,
            ]),
          ].map(
            ([label, val], i) =>
              val > 0 && (
                <div
                  key={i}
                  className="flex justify-between text-gray-600 font-medium"
                >
                  <span>{label}</span>
                  <span>₹{parseFloat(val).toLocaleString("en-IN")}</span>
                </div>
              ),
          )}
          <div className="flex justify-between font-bold text-[#042f2e] border-t border-gray-200 pt-2 mt-2">
            <span>Calculated CTC</span>
            <span>₹{calculatedCTC.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── STEP 6: REVIEW ───────────────────────────────────────────────────────────
const ReviewCard = ({ title, items, onEdit }) => (
  <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm">
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

const Step6 = ({ basic, statutory, bank, salary, goToStep }) => (
  <div className="space-y-4">
    <SectionTitle
      title="Review & Confirm"
      subtitle="Verify all details before creating the employee record"
    />
    <ReviewCard
      title="Basic Details"
      onEdit={() => goToStep(1)}
      items={[
        [
          "Full Name",
          `${basic.firstName} ${basic.middleName || ""} ${basic.lastName}`,
        ],
        ["Employee ID", basic.employeeId],
        ["Email", basic.email],
        ["Mobile", basic.mobile],
        ["Joining Date", basic.joiningDate],
        ["Department", basic.department],
        ["Designation", basic.designation],
        ["Location", basic.location],
        ["Gender", basic.gender],
      ]}
    />
    <ReviewCard
      title="Statutory"
      onEdit={() => goToStep(2)}
      items={[
        ["Professional Tax", statutory.profTax ? "Enabled" : "Disabled"],
        [
          "Provident Fund",
          statutory.pfEnabled
            ? `Employee ${statutory.pfEmployee ?? 12}% / Employer ${statutory.pfEmployer ?? 12}%`
            : "Disabled",
        ],
        ["TDS", statutory.tds ? "Applicable" : "Not Applicable"],
        [
          "Other Deductions",
          (statutory.otherDeductions || []).length > 0
            ? `${statutory.otherDeductions.length} rows`
            : "None",
        ],
      ]}
    />
    <ReviewCard
      title="Salary Structure"
      onEdit={() => goToStep(5)}
      items={[
        [
          "Monthly CTC",
          `₹${parseFloat(salary.ctc || 0).toLocaleString("en-IN")}`,
        ],
        ["Basic", `₹${parseFloat(salary.basic || 0).toLocaleString("en-IN")}`],
        ["HRA", `₹${parseFloat(salary.hra || 0).toLocaleString("en-IN")}`],
        [
          "Travel Allowance",
          `₹${parseFloat(salary.travel || 0).toLocaleString("en-IN")}`,
        ],
        [
          "Daily Allowance",
          `₹${parseFloat(salary.daily || 0).toLocaleString("en-IN")}`,
        ],
      ]}
    />
    <ReviewCard
      title="Bank Details"
      onEdit={() => goToStep(4)}
      items={[
        ["Bank", bank.bankName],
        ["Account Holder", bank.accountHolder],
        [
          "Account No.",
          bank.accountNumber ? `XXXX${bank.accountNumber.slice(-4)}` : "",
        ],
        ["IFSC", bank.ifsc],
        ["Account Type", bank.accountType],
      ]}
    />
  </div>
);

// ─── VALIDATION ───────────────────────────────────────────────────────────────
const validate = (step, data) => {
  const errs = {};
  if (step === 1) {
    if (!data.basic.firstName.trim()) errs.firstName = "First name is required";
    if (!data.basic.lastName.trim()) errs.lastName = "Last name is required";
    if (!data.basic.employeeId.trim())
      errs.employeeId = "Employee ID is required";
    if (!data.basic.joiningDate) errs.joiningDate = "Joining date is required";
    if (!data.basic.mobile.trim()) errs.mobile = "Mobile number is required";
    else if (data.basic.mobile.trim().length < 10)
      errs.mobile = "Minimum 10 digits required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.basic.email) errs.email = "Email is required";
    else if (!emailRegex.test(data.basic.email))
      errs.email = "Invalid corporate email";

    if (!data.basic.password) errs.password = "Initial password required";
    else if (data.basic.password.length < 6) errs.password = "Min 6 characters";

    if (!data.basic.gender) errs.gender = "Please select gender";
    if (!data.basic.location) errs.location = "Please select location";
    if (!data.basic.designation.trim())
      errs.designation = "Designation is required";
    if (!data.basic.department) errs.department = "Please select department";
  }
  if (step === 2) {
    if (data.statutory.pfEnabled) {
      if (!data.statutory.pfEmployee || data.statutory.pfEmployee < 0)
        errs.pfEmployee = "Invalid %";
      if (!data.statutory.pfEmployer || data.statutory.pfEmployer < 0)
        errs.pfEmployer = "Invalid %";
    }
  }
  if (step === 3) {
    if (!data.personal.fatherName.trim())
      errs.fatherName = "Father's name is required";
    if (!data.personal.address.trim()) errs.address = "Address is required";
    if (!data.personal.aadhaar.trim()) errs.aadhaar = "Aadhaar is required";
    if (
      data.personal.aadhaar &&
      data.personal.aadhaar.replace(/\s/g, "").length !== 12
    )
      errs.aadhaar = "Aadhaar must be 12 digits";
    if (!data.personal.pan.trim()) errs.pan = "PAN number is required";
    if (data.personal.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]?/.test(data.personal.pan))
      errs.pan = "Invalid PAN format (ABCDE1234F)";
    if (!data.personal.dob) errs.dob = "Date of birth is required";
  }
  if (step === 4) {
    if (!data.bank.bankName) errs.bankName = "Please select bank";
    if (!data.bank.accountHolder.trim())
      errs.accountHolder = "Account holder name is required";
    if (!data.bank.accountNumber.trim())
      errs.accountNumber = "Account number is required";
    if (!data.bank.ifsc.trim()) errs.ifsc = "IFSC code is required";
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}?/.test(data.bank.ifsc))
      errs.ifsc = "Invalid IFSC format";
    if (!data.bank.accountType) errs.accountType = "Please select account type";
  }
  if (step === 5) {
    if (!data.salary.ctc || data.salary.ctc <= 0)
      errs.ctc = "Monthly CTC must be > 0";
    if (!data.salary.basic || data.salary.basic <= 0)
      errs.basic = "Basic must be > 0";
  }
  return errs;
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
import { useAuth } from "../../context/AuthContext";

const genId = () => "EMP" + String(Math.floor(1000 + Math.random() * 9000));
const INITIAL_EMP_ID = genId();

const AddEmployee = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    basic: {
      firstName: "",
      middleName: "",
      lastName: "",
      employeeId: INITIAL_EMP_ID,
      joiningDate: "",
      mobile: "",
      email: "",
      password: "",
      gender: "",
      location: "",
      designation: "",
      department: "",
    },
    statutory: {
      profTax: false,
      pfEnabled: false,
      pfEmployee: 12,
      pfEmployer: 12,
      pfPension: 8.33,
      tds: false,
      otherDeductions: [],
    },
    personal: {
      fatherName: "",
      address: "",
      aadhaar: "",
      pan: "",
      dob: "",
      differentlyAbled: false,
    },
    bank: {
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      ifsc: "",
      accountType: "",
    },
    salary: {
      ctc: "",
      basic: "",
      hra: "",
      travel: "",
      daily: "",
      otherAllowances: [],
      carPerquisite: "",
      otherPerquisites: [],
    },
  });

  const setSection = (key) => (val) =>
    setFormData((prev) => ({ ...prev, [key]: val }));

  const next = () => {
    const errs = validate(step, formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, 6));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `✅ Employee "${formData.basic.firstName} ${formData.basic.lastName}" (${formData.basic.employeeId}) has been created successfully!`,
        );
        navigate("/app/employees");
      } else {
        alert(`❌ Error: ${data.message || "Failed to create employee"}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Add Employee">
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
          Complete all 6 steps to create a fully configured employee record.
        </p>

        {/* Stepper */}
        <StepperHeader current={step} total={STEPS.length} />

        {/* Step Content + Inline Nav */}
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 min-h-[400px] flex flex-col">
          <div className="flex-1">
            {step === 1 && (
              <Step1
                data={formData.basic}
                setData={setSection("basic")}
                errors={errors}
              />
            )}
            {step === 2 && (
              <Step2
                data={formData.statutory}
                setData={setSection("statutory")}
              />
            )}
            {step === 3 && (
              <Step3
                data={formData.personal}
                setData={setSection("personal")}
                errors={errors}
              />
            )}
            {step === 4 && (
              <Step4
                data={formData.bank}
                setData={setSection("bank")}
                errors={errors}
              />
            )}
            {step === 5 && (
              <Step5 data={formData.salary} setData={setSection("salary")} />
            )}
            {step === 6 && (
              <Step6
                basic={formData.basic}
                statutory={formData.statutory}
                bank={formData.bank}
                salary={formData.salary}
                goToStep={(s) => {
                  setStep(s);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            )}
          </div>

          {/* Nav Buttons — inside card, properly centered */}
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
                {Object.keys(errors).length > 0 ? (
                  <span className="text-rose-400">
                    {Object.keys(errors).length} error(s) — fix to proceed
                  </span>
                ) : (
                  `Step ${step} of ${STEPS.length}`
                )}
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
                  onClick={submit}
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-8 py-3 bg-teal-500 text-white rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-teal-500/30 hover:bg-teal-400 transition-all ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <CheckCircle2 size={16} />
                  {isSubmitting ? "Creating..." : "Confirm & Create"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddEmployee;
