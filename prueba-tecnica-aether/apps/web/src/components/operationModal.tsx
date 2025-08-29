import React, { useState } from 'react';
import { Contact } from '../types';

interface OperationModalProps {
  contact: Contact;
  onSubmit: (type: 'credit' | 'debit', amount: number) => void;
  onCancel: () => void;
}

export default function OperationModal({ contact, onSubmit, onCancel }: OperationModalProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'credit' | 'debit'>('credit');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(type, parseFloat(amount));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Operación para {contact.name}</h2>
        <p>Balance actual: ${contact.balance}</p>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Tipo:</label>
            <select value={type} onChange={(e) => setType(e.target.value as 'credit' | 'debit')}>
              <option value="credit">Crédito (+)</option>
              <option value="debit">Débito (-)</option>
            </select>
          </div>
          <div>
            <label>Monto:</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onCancel}>Cancelar</button>
            <button type="submit">Ejecutar</button>
          </div>
        </form>
      </div>
    </div>
  );
}