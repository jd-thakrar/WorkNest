import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import Employee from '../models/Employee.js';

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ company: req.user.company })
      .populate('teamId')
      .populate('members', 'firstName lastName location type designation dob employeeId');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      company: req.user.company,
      addedBy: req.user._id,
    });
    
    // Notify all assigned members
    if (task.members && task.members.length > 0) {
       const employees = await Employee.find({ _id: { $in: task.members } });
       for (const emp of employees) {
          if (emp.user) {
             await Notification.create({
                type: 'info',
                title: 'New Strategy Assigned',
                desc: `You have been assigned to task: "${task.name}".`,
                userId: emp.user
             });
          }
       }
    }

    const populated = await Task.findById(task._id).populate('teamId').populate('members', 'firstName lastName');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company },
      req.body,
      { new: true }
    ).populate('teamId').populate('members', 'firstName lastName');

    // Notify members of the update
    if (task.members && task.members.length > 0) {
       for (const emp of task.members) {
          if (emp.user) {
             await Notification.create({
                type: 'warning',
                title: 'Task Execution Update',
                desc: `Strategic objectives for "${task.name}" have been revised.`,
                userId: emp.user
             });
          }
       }
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const deleteTask = async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, company: req.user.company });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
