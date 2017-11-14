import authRoute from './auth-route';
import { Router } from 'express';
import {
  addContact,
  addContactToGroup,
  contactLookup,
  createContactGroup,
  getContactGroups,
  getContacts,
  removeContactFromGroup,
} from '../models/contacts';

const contacts = Router();

contacts.get('/lookup/:displayName', authRoute(async (userId, req, res) => {
  const {displayName} = req.params;
  const user = await contactLookup(req.db, displayName)
      .catch((error) => null);
  res.success(user ? {user} : {});
}));

contacts.get('/', authRoute(async (userId, req, res) => {
  const contacts = await getContacts(req.db, userId);
  res.success({contacts});
}));

contacts.put('/:contactId', authRoute(async (userId, req, res) => {
  const {contactId} = req.params;
  await addContact(req.db, userId, contactId);
  res.success({});
}));

contacts.get('/group', authRoute(async (userId, req, res) => {
  const contact_groups = await getContactGroups(req.db, userId);
  res.success({contact_groups});
}));

contacts.post('/group', authRoute(async (userId, req, res) => {
  const {contact_group: {name}} = await req.parseUserMessage();
  await createContactGroup(req.db, userId, name);
  res.success({});
}));

contacts.put('/group/:group/:contact', authRoute(async (userId, req, res) => {
  const {group, contact} = req.params;
  await addContactToGroup(req.db, userId, group, contact);
  res.success({});
}));

contacts.delete('/group/:group/:contact', authRoute(async (userId, req, res) => {
  const {group, contact} = req.params;
  await removeContactFromGroup(req.db, userId, group, contact);
  res.success({});
}));

export default contacts;
