import { Request, Response } from 'express';
import Contact from '../models/contact';

export const getContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts' });
  }
};