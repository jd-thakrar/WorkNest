import Contact from '../models/Contact.js';

// @desc    Submit a contact form
// @route   POST /api/contact
// @access  Public
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, company, subject, message } = req.body;

    const newContact = await Contact.create({
      name,
      email,
      phone,
      company,
      subject,
      message,
    });

    res.status(201).json({ message: 'Contact form submitted successfully', contact: newContact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
