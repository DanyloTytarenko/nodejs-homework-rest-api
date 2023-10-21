const Contact = require('../models/contact');

const { HttpError, ctrlWrapper } = require('../helpers');

const listContacts = async (req, res) => {
  const { _id: owner } = req.user;

  const { page = 1, limit = 20, favorite } = req.query;

  const skip = (page - 1) * limit;

  const query = favorite ? { owner, favorite } : { owner };

  const allContacts = await Contact.find(query, null, {
    skip,
    limit,
  });
  res.json(allContacts);
};

const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contactById = await Contact.findById(contactId);

  if (!contactById) {
    throw HttpError(404, 'Not found');
  }

  res.json(contactById);
};

const addContact = async (req, res) => {
  const { _id: owner } = req.user;

  const newContact = await Contact.create({ ...req.body, owner });

  res.status(201).json(newContact);
};

const removeContact = async (req, res) => {
  const { contactId } = req.params;
  const removedContact = await Contact.findByIdAndRemove(contactId);

  if (!removedContact) {
    throw HttpError(404, 'Not found');
  }

  res.json({ message: 'contact deleted' });
};

const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!updatedContact) {
    throw HttpError(404, 'Not found');
  }

  res.json(updatedContact);
};

const updateStatusContact = async (req, res) => {
  const { contactId } = req.params;

  const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!updatedContact) {
    throw HttpError(404, 'Not found');
  }

  res.json(updatedContact);
};

module.exports = {
  listContacts: ctrlWrapper(listContacts),
  getContactById: ctrlWrapper(getContactById),
  addContact: ctrlWrapper(addContact),
  removeContact: ctrlWrapper(removeContact),
  updateContact: ctrlWrapper(updateContact),
  updateFavorite: ctrlWrapper(updateStatusContact),
};
