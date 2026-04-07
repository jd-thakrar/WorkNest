import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';

export const getPayroll = async (req, res) => {
  try {
    const records = await Payroll.find({ company: req.user.company })
      .populate('empId', 'firstName lastName type dept designation accountHolder accountNumber bankName ifsc');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const processPayroll = async (req, res) => {
  try {
    const { month } = req.body;
    // VERY BASIC GENERATOR for the demo:
    // It looks at all active full-time employees and generates a base paycheck.
    const employees = await Employee.find({ company: req.user.company, type: 'Full-time' });
    
    for (let emp of employees) {
       const basic = Number(emp.salary || emp.basicSalary || emp.basic || 25000);
       const hra = Number(emp.hra || 10000);
       const otherArrSum = Array.isArray(emp.otherAllowances) ? emp.otherAllowances.reduce((sum, item) => sum + Number(item.amount || 0), 0) : 0;
       const other = Number((emp.travel || 0) + (emp.daily || 0)) + otherArrSum;
       const gross = basic + hra + other;
       
       const pfPercentage = Number(emp.pfEmployee || 0);
       const pfValue = emp.pfEnabled ? (basic * (pfPercentage / 100)) : 0;
       const ptValue = emp.profTax ? 200 : 0;
       
       let tds = 0;
       if (emp.tds) {
           const annualTaxable = (gross * 12) - (pfValue * 12) - 50000;
           if (annualTaxable > 1500000) tds = annualTaxable * 0.25 / 12;
           else if (annualTaxable > 1000000) tds = annualTaxable * 0.20 / 12;
           else if (annualTaxable > 700000) tds = annualTaxable * 0.10 / 12;
           else tds = annualTaxable * 0.05 / 12;
           if (tds < 0) tds = 0;
       }

       const otherDeductionsSum = Array.isArray(emp.otherDeductions) ? emp.otherDeductions.reduce((sum, item) => sum + Number(item.amount || 0), 0) : 0;
       
       const deduct = pfValue + ptValue + tds + otherDeductionsSum;
       const net = gross - deduct;

       await Payroll.findOneAndUpdate(
         { empId: emp._id, month, company: req.user.company },
         { empId: emp._id, month, basic, hra, allowances: other, gross, deductions: deduct, net, company: req.user.company },
         { upsert: true, new: true }
       );
    }
    
    // Freelancers too
    const freelancers = await Employee.find({ company: req.user.company, type: 'Freelancer' });
    for (let emp of freelancers) {
       const rate = Number(emp.billingRate || emp.rate || emp.salary || emp.basic || 15000);
       
       let tds = 0;
       if (emp.tds) {
           tds = rate * 0.10; // Flat 10% TDS for freelancers
       }
       
       const otherDeductionsSum = Array.isArray(emp.otherDeductions) ? emp.otherDeductions.reduce((sum, item) => sum + Number(item.amount || 0), 0) : 0;
       const deduct = tds + otherDeductionsSum;
       const net = rate - deduct;

       await Payroll.findOneAndUpdate(
         { empId: emp._id, month, company: req.user.company },
         { empId: emp._id, month, basic: rate, hra: 0, allowances: 0, gross: rate, deductions: deduct, net, company: req.user.company },
         { upsert: true, new: true }
       );
    }

    const records = await Payroll.find({ month, company: req.user.company })
      .populate('empId', 'firstName lastName type dept designation accountHolder accountNumber bankName ifsc');
    res.json(records);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const markPaid = async (req, res) => {
  try {
    const record = await Payroll.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company },
      { status: 'Paid' },
      { new: true }
    ).populate('empId', 'firstName lastName');

    if (record) {
      await Notification.create({
        type: 'success',
        title: 'Salary Disbursed',
        desc: `Salary payment for ${record.empId.firstName} ${record.empId.lastName} (Cycle: ${record.month}) has been successfully processed.`,
        userId: req.user._id
      });
    }

    res.json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
