export const calcPayrollRow = (empId, employees, financials, activeCycle) => {
  const emp = employees.find(e => e.id === empId || e._id === empId);
  if (!emp) return null;

  const currentDynamicMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const cycle = activeCycle || currentDynamicMonth;
  
  const f = financials.find(fin => 
    (fin.id === empId || fin.empId === empId || fin.empId?._id === empId) && 
    fin.month === cycle
  );
  
  const isDraft = !f;
  
  // Base components with deep aliasing
  const basic = f?.basic !== undefined ? f.basic : (emp.basic || emp.baseSalary || 0);
  const hra = f?.hra !== undefined ? f.hra : (emp.type === 'Freelancer' ? 0 : (emp.hra || emp.hraAmount || 0));
  const allowances = f?.allowances !== undefined ? f.allowances : (emp.type === 'Freelancer' ? 0 : (emp.allowances || emp.totalAllowances || 0));
  const gross = f?.gross !== undefined ? f.gross : (basic + hra + allowances);
  
  const pfPerc = Number(emp.pfEmployee || 12);
  const pfValue = (emp.type === 'Freelancer' || !emp.pfEnabled) ? 0 : Math.round(basic * pfPerc / 100);
  const ptValue = (emp.type === 'Freelancer' || !emp.profTax) ? 0 : 200;
  
  let tdsValue = 0;
  if (emp.tds) {
      // Synchronize with Backend Annual Slab Logic (Matching Ravi Mohanbhai's specific scenario)
      const annualGross = gross * 12;
      const annualPF = pfValue * 12;
      const standardDeduction = 50000;
      const annualTaxable = annualGross - annualPF - standardDeduction;
      
      if (annualTaxable > 1500000) tdsValue = (annualTaxable * 0.25) / 12;
      else if (annualTaxable > 1000000) tdsValue = (annualTaxable * 0.20) / 12;
      else if (annualTaxable > 700000) tdsValue = (annualTaxable * 0.10) / 12;
      else tdsValue = (annualTaxable * 0.05) / 12;
      
      if (tdsValue < 0) tdsValue = 0;
      tdsValue = Math.round(tdsValue);
  }
  
  const pf = pfValue;
  const pt = ptValue;
  const tds = tdsValue;
  const otherExtras = (emp.otherDeductions || []).reduce((acc, d) => acc + (d.amount || 0), 0);
  
  const draftStatutory = pf + pt + tds + otherExtras;

  const statutory = (f?.status === 'Paid' && f?.deductions !== undefined) ? f.deductions : draftStatutory;
  const loanDeduct = f?.loanDeduction || 0;
  const reimbursements = f?.reimbursements || 0;
  const lwpDeduct = f?.lop || 0;
  
  const totalDeductions = statutory + loanDeduct + lwpDeduct;
  const net = f?.net !== undefined ? f.net : (gross + reimbursements - totalDeductions);

  return {
    id: empId,
    emp,
    financials: f || {},
    basic,
    hra,
    allowances,
    gross,
    reimbursements,
    statutory, 
    pf,
    pt,
    tds,
    loan: loanDeduct,
    lwpDeduct,
    totalDeductions,
    net,
    status: isDraft ? 'Draft' : (f.status === 'Paid' ? 'Paid' : 'Calculated'),
    month: cycle
  };
};
