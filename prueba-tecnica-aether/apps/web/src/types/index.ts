export interface Contact {
  _id: string;
  name: string;
  email: string;
  balance: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Operation {
  _id: string;
  contactId: string;
  type: 'add' | 'subtract';
  amount: number;
  description?: string;
  createdAt: string;
}