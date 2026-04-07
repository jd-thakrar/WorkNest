import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Team from '../models/Team.js';
import Task from '../models/Task.js';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Payroll from '../models/Payroll.js';
import jwt from 'jsonwebtoken';

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc Register User
export const registerUser = async (req, res) => {
  const { name, email, company, jobTitle, teamSize, phone, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      company,
      jobTitle,
      teamSize,
      phone,
      password,
      role: 'admin', // Users signing up are admins by default
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        jobTitle: user.jobTitle,
        teamSize: user.teamSize,
        phone: user.phone,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc Update Profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const oldCompany = user.company;
      const newCompany = req.body.company;

      if (newCompany && newCompany !== oldCompany) {
        // 1. Update all Employee profiles associated with the admin
        await Employee.updateMany(
          { company: oldCompany, addedBy: user._id },
          { company: newCompany }
        );

        // 2. Update all User accounts associated with the old company name
        // (Typically these are employees belonging to the same entity)
        await User.updateMany(
          { company: oldCompany, role: 'employee' },
          { company: newCompany }
        );

        // 3. Update all secondary operational data
        await Team.updateMany({ company: oldCompany }, { company: newCompany });
        await Task.updateMany({ company: oldCompany }, { company: newCompany });
        await Attendance.updateMany({ company: oldCompany }, { company: newCompany });
        await LeaveRequest.updateMany({ company: oldCompany }, { company: newCompany });
        await Payroll.updateMany({ company: oldCompany }, { company: newCompany });

        user.company = newCompany;
      }

      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.jobTitle = req.body.jobTitle || user.jobTitle;
      user.teamSize = req.body.teamSize || user.teamSize;
      user.phone = req.body.phone || user.phone;
      user.avatar = req.body.avatar || user.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        company: updatedUser.company,
        jobTitle: updatedUser.jobTitle,
        teamSize: updatedUser.teamSize,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        jobTitle: user.jobTitle,
        teamSize: user.teamSize,
        phone: user.phone,
        avatar: user.avatar,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
