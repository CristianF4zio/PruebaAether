import React from 'react';
import useSWR from 'swr';
import api from '../services/api';
import { Contact } from '../types';

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function ContactsPage() {
  const { data: contacts } = useSWR<Contact[]>('/contacts', fetcher);

  return (
    <div>
      <h1>Contactos</h1>
      {contacts?.map(c => (
        <div key={c._id}>
          {c.name} – {c.email} – ${c.balance}
        </div>
      ))}
    </div>
  );
}