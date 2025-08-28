export interface Contact {
  _id: string;
  email: string;
  name: string;
  balance: number;
  createdAt: string;
}

export interface Operation {
  _id: string;
  contact: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  createdAt: string;
}