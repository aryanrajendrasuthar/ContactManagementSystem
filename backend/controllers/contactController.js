const { stringify } = require('csv-stringify/sync');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const Contact = require('../models/Contact');

const getContacts = async (req, res) => {
  try {
    const {
      search = '',
      group = '',
      favorite = '',
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { userId: req.user._id };

    if (search.trim()) {
      if (search.length >= 3) {
        query.$text = { $search: search.trim() };
      } else {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { firstName: regex },
          { lastName: regex },
          { email: regex },
          { company: regex },
          { phone: regex }
        ];
      }
    }

    if (group) query.groupId = group === 'none' ? null : group;
    if (favorite === 'true') query.isFavorite = true;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const sortObj = {};
    const allowedSorts = ['firstName', 'lastName', 'email', 'company', 'createdAt'];
    const sortField = allowedSorts.includes(sort) ? sort : 'createdAt';
    sortObj[sortField] = order === 'asc' ? 1 : -1;

    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .populate('groupId', 'name color')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Contact.countDocuments(query)
    ]);

    res.json({
      success: true,
      contacts,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('groupId', 'name color');

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createContact = async (req, res) => {
  try {
    const data = { ...req.body, userId: req.user._id };

    if (req.file) {
      data.avatarUrl = `/uploads/${req.file.filename}`;
    }

    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    if (data.address && typeof data.address === 'string') {
      try { data.address = JSON.parse(data.address); } catch { data.address = {}; }
    }

    if (data.socialLinks && typeof data.socialLinks === 'string') {
      try { data.socialLinks = JSON.parse(data.socialLinks); } catch { data.socialLinks = {}; }
    }

    const contact = await Contact.create(data);
    const populated = await contact.populate('groupId', 'name color');

    res.status(201).json({ success: true, contact: populated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, userId: req.user._id });

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    const data = { ...req.body };

    if (req.file) {
      data.avatarUrl = `/uploads/${req.file.filename}`;
    }

    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    if (data.address && typeof data.address === 'string') {
      try { data.address = JSON.parse(data.address); } catch { data.address = {}; }
    }

    if (data.socialLinks && typeof data.socialLinks === 'string') {
      try { data.socialLinks = JSON.parse(data.socialLinks); } catch { data.socialLinks = {}; }
    }

    if (data.groupId === '' || data.groupId === 'null') data.groupId = null;

    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('groupId', 'name color');

    res.json({ success: true, contact: updated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, userId: req.user._id });

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    contact.isFavorite = !contact.isFavorite;
    await contact.save();

    const populated = await Contact.findById(contact._id).populate('groupId', 'name color').lean();
    res.json({ success: true, contact: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user._id })
      .populate('groupId', 'name')
      .lean();

    const rows = contacts.map(c => ({
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      company: c.company,
      group: c.groupId?.name || '',
      tags: (c.tags || []).join(';'),
      notes: c.notes,
      street: c.address?.street || '',
      city: c.address?.city || '',
      state: c.address?.state || '',
      country: c.address?.country || '',
      zip: c.address?.zip || '',
      linkedin: c.socialLinks?.linkedin || '',
      twitter: c.socialLinks?.twitter || '',
      github: c.socialLinks?.github || '',
      website: c.socialLinks?.website || '',
      isFavorite: c.isFavorite ? 'true' : 'false'
    }));

    const csv = stringify(rows, { header: true });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const importContacts = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No CSV file uploaded' });
  }

  try {
    const content = fs.readFileSync(req.file.path, 'utf-8');
    const rows = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'CSV file is empty' });
    }

    const contacts = rows.map(row => {
      const contact = {
        userId: req.user._id,
        firstName: row.firstName || row.first_name || row['First Name'] || '',
        lastName: row.lastName || row.last_name || row['Last Name'] || '',
        email: row.email || row.Email || '',
        phone: row.phone || row.Phone || '',
        company: row.company || row.Company || '',
        notes: row.notes || row.Notes || '',
        isFavorite: row.isFavorite === 'true' || row.favorite === 'true',
      };

      const tagsRaw = row.tags || row.Tags || '';
      if (tagsRaw) {
        contact.tags = tagsRaw.split(/[;,]/).map(t => t.trim()).filter(Boolean);
      }

      const street = row.street || row.Street || '';
      const city = row.city || row.City || '';
      const state = row.state || row.State || '';
      const country = row.country || row.Country || '';
      const zip = row.zip || row.ZIP || row.Zip || '';
      if (street || city || state || country || zip) {
        contact.address = { street, city, state, country, zip };
      }

      const linkedin = row.linkedin || row.LinkedIn || '';
      const twitter = row.twitter || row.Twitter || '';
      const github = row.github || row.GitHub || '';
      const website = row.website || row.Website || '';
      if (linkedin || twitter || github || website) {
        contact.socialLinks = { linkedin, twitter, github, website };
      }

      return contact;
    }).filter(c => c.firstName);

    if (!contacts.length) {
      return res.status(400).json({ success: false, message: 'No valid contacts found (firstName is required)' });
    }

    const inserted = await Contact.insertMany(contacts, { ordered: false });

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      imported: inserted.length,
      message: `Successfully imported ${inserted.length} contact${inserted.length !== 1 ? 's' : ''}`
    });
  } catch (error) {
    if (req.file?.path) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  toggleFavorite,
  exportContacts,
  importContacts
};
