import Employee from '../models/Employee.js';
import User from '../models/User.js';

// @desc Add new employee
// @route POST /api/employees
// @access Private/Admin
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
    const employeeData = {
      ...basic,
      ...(statutory || tax),
      ...personal,
      ...bank,
      ...(salary || billing),
      employeeId,
      joiningDate, // ensure joiningDate is set correctly from startDate/joiningDate
      addedBy: req.user._id,
      user: newUser._id, // Link to the user account
    };

    const employee = await Employee.create(employeeData);

    if (employee) {
      res.status(201).json(employee);
    } else {
      res.status(400).json({ message: 'Invalid employee data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all employees
// @route GET /api/employees
// @access Private/Admin
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ addedBy: req.user._id });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
