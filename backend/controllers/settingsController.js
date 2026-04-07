import Settings from '../models/Settings.js';
import Notification from '../models/Notification.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findOneAndUpdate({}, req.body, { new: true });
    }

    // Special Notification if Payroll Lock changed
    if (req.body.hasOwnProperty('payrollLocked')) {
      await Notification.create({
        type: req.body.payrollLocked ? 'alert' : 'success',
        title: req.body.payrollLocked ? 'Payroll Cycle Locked' : 'Payroll Cycle Released',
        desc: req.body.payrollLocked 
          ? 'The current payroll cycle has been secured. No further modifications to salaries or statutory components are permitted.'
          : 'The payroll cycle has been released for further reconciliation and adjustments.',
        userId: req.user._id
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};
