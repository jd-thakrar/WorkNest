import Team from '../models/Team.js';

// @desc    Get all teams for the authenticated admin
// @route   GET /api/teams
// @access  Private/Admin
export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ company: req.user.company })
      .populate({
        path: 'lead',
        select: 'firstName lastName designation'
      })
      .populate({
        path: 'members',
        select: 'firstName lastName designation'
      });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private/Admin
export const createTeam = async (req, res) => {
  try {
    const { name, lead, members, projects, color } = req.body;

    const team = await Team.create({
      name,
      lead,
      members,
      projects: projects || 0,
      color: color || 'bg-teal-50 text-teal-600 border-teal-100',
      company: req.user.company,
      addedBy: req.user._id
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('lead', 'firstName lastName designation')
      .populate('members', 'firstName lastName designation');

    res.status(201).json(populatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a team
// @route   PUT /api/teams/:id
// @access  Private/Admin
export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, lead, members, projects, color } = req.body;
    
    team.name = name || team.name;
    team.lead = lead || team.lead;
    team.members = members || team.members;
    team.projects = projects !== undefined ? projects : team.projects;
    team.color = color || team.color;

    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate('lead', 'firstName lastName designation')
      .populate('members', 'firstName lastName designation');

    res.json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a team
// @route   DELETE /api/teams/:id
// @access  Private/Admin
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await team.deleteOne();
    res.json({ message: 'Team removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
