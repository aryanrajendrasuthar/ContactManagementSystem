const Group = require('../models/Group');
const Contact = require('../models/Contact');

const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ userId: req.user._id }).sort({ name: 1 }).lean();

    const counts = await Contact.aggregate([
      { $match: { userId: req.user._id, groupId: { $ne: null } } },
      { $group: { _id: '$groupId', count: { $sum: 1 } } }
    ]);

    const countMap = counts.reduce((acc, { _id, count }) => {
      acc[_id.toString()] = count;
      return acc;
    }, {});

    const groupsWithCount = groups.map(g => ({
      ...g,
      contactCount: countMap[g._id.toString()] || 0
    }));

    res.json({ success: true, groups: groupsWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    const exists = await Group.findOne({ name: name.trim(), userId: req.user._id });
    if (exists) {
      return res.status(400).json({ success: false, message: 'A group with this name already exists' });
    }

    const group = await Group.create({ name: name.trim(), color, userId: req.user._id });
    res.status(201).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateGroup = async (req, res) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, userId: req.user._id });

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const { name, color } = req.body;

    if (name && name.trim() !== group.name) {
      const exists = await Group.findOne({
        name: name.trim(),
        userId: req.user._id,
        _id: { $ne: group._id }
      });
      if (exists) {
        return res.status(400).json({ success: false, message: 'A group with this name already exists' });
      }
    }

    if (name) group.name = name.trim();
    if (color) group.color = color;
    await group.save();

    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, userId: req.user._id });

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    await Contact.updateMany({ groupId: group._id, userId: req.user._id }, { $set: { groupId: null } });
    await group.deleteOne();

    res.json({ success: true, message: 'Group deleted and contacts unassigned' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getGroups, createGroup, updateGroup, deleteGroup };
