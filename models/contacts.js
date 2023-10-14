const fs = require('fs/promises');
const { nanoid } = require('nanoid');
const path = require('path');

const contactsPath = path.join(__dirname, 'contacts.json');

const listContacts = async () => {
  // Повертає масив контактів.
  const data = await fs.readFile(contactsPath);
  return JSON.parse(data);
};

const getContactById = async contactId => {
  // Повертає об'єкт контакту з таким id. Повертає null, якщо контакт з таким id не знайдений.
  const contacts = await listContacts();
  const contact = contacts.find(item => item.id === contactId);
  return contact || null;
};

const removeContact = async contactId => {
  // Повертає об'єкт видаленого контакту. Повертає null, якщо контакт з таким id не знайдений.
  const contacts = await listContacts();
  const contactIndex = contacts.findIndex(item => item.id === contactId);
  if (contactIndex === -1) {
    return null;
  }
  const [contact] = contacts.splice(contactIndex, 1);
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return contact;
};

const addContact = async ({ name, email, phone }) => {
  // Повертає об'єкт доданого контакту.
  const contacts = await listContacts();
  const newContact = { id: nanoid(), name, email, phone };
  await fs.writeFile(
    contactsPath,
    JSON.stringify([...contacts, newContact], null, 2),
  );
  return newContact;
};

const updateContact = async (contactId, body) => {
  // Повертає об'єкт оновленого контакту. Повертає null, якщо контакт з таким id не знайдений.
  const contacts = await listContacts();
  const contactIndex = contacts.findIndex(item => item.id === contactId);
  if (contactIndex === -1) {
    return null;
  }

  contacts[contactIndex] = { id: contactId, ...body };

  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return contacts[contactIndex];
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
