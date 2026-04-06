import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Team from '../models/Team.js';

// @desc    Get all employees for the authenticated admin
// @route   GET /api/employees
// @access  Private/Admin
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ company: req.user.company });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new employee
// @route   POST /api/employees
// @access  Private/Admin
export const addEmployee = async (req, res) => {
  try {
    const { basic, statutory, tax, personal, bank, salary, billing } = req.body;
    const email = basic.email;
    const employeeId = basic.employeeId || basic.freelancerId;
    const password = basic.password;
    const joiningDate = basic.joiningDate || basic.startDate;

    const userExists = await User.findOne({ email });
    if (email && userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const employeeIdExists = await Employee.findOne({ employeeId });
    if (employeeIdExists) {
      return res.status(400).json({ message: 'An employee with this ID already exists' });
    }

    // 1. Create the User Account for Login
    const name = `${basic.firstName} ${basic.lastName}`;
    const newUser = await User.create({
      name,
      email,
      password, // Mongoose pre-save hook will hash this
      role: 'employee',
      company: req.user.company, // Same company as the admin who added them
    });

    // 2. Create the Employee Profile
    // Smart merge: Handle original 'rate/paymentType' from AddFreelancer.jsx
    const billingData = billing ? {
      billingRate: billing.billingRate || billing.rate || "",
      frequency: billing.frequency || billing.paymentType || "Per Month",
      currency: billing.currency || "INR"
    } : {};

    const employeeData = {
      ...basic,
      ...(statutory || tax),
      ...personal,
      ...bank,
      ...(salary || billingData),
      ...billingData, // Ensure these are top-level for the model
      employeeId,
      joiningDate,
      company: req.user.company,
      addedBy: req.user._id,
      user: newUser._id,
    };

    const employee = await Employee.create(employeeData);
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, company: req.user.company });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { basic, statutory, tax, personal, bank, salary, billing } = req.body;

    // Update Employee record
    const updatedData = {
      ...basic,
      ...(statutory || tax),
      ...personal,
      ...bank,
      ...(salary || billing),
      joiningDate: basic.joiningDate || basic.startDate,
    };

    Object.assign(employee, updatedData);
    await employee.save();

    // If name changed, update the User account too
    if (basic.firstName || basic.lastName) {
      const name = `${basic.firstName || employee.firstName} ${basic.lastName || employee.lastName}`;
      await User.findByIdAndUpdate(employee.user, { name });
    }

    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, company: req.user.company });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Delete associated User account first
    if (employee.user) {
      await User.findByIdAndDelete(employee.user);
    }

    // Also remove from any teams they are in
    await Team.updateMany(
      { members: employee._id },
      { $pull: { members: employee._id } }
    );
    
    // Clear them if they are a lead
    await Team.updateMany(
      { lead: employee._id },
      { $set: { lead: null } }
    );

    await Employee.findByIdAndDelete(req.params.id);

    res.json({ message: 'Employee removed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
