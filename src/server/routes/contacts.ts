import authRoute from './auth-route';
import { Router } from 'express';
import { contactLookup } from '../models/contacts';

const contacts = Router();

contacts.get('/lookup/:displayName', authRoute(async (userId, req, res) => {
  const {displayName} = req.params;
  const user = await contactLookup(req.db, displayName)
      .catch((error) => null);
  res.success(user ? {user} : {});
}));

export default contacts;
