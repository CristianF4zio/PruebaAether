import React, { useState } from 'react';
import { Contact } from '../types';

interface OperationModalProps {
  contact: Contact;
  onSubmit: (type: 'credit' | 'debit', amount: number) => void;
  onCancel: () => void;
}

const OperationModal: React.FC<OperationModalProps> = ({
  contact,
  onSubmit,
  onCancel
}) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('El monto debe ser un número positivo');
      return;
    }

    if (type === 'debit' && numericAmount > contact.balance) {
      setError('Fondos insuficientes');
      return;
    }

    onSubmit(type, numericAmount);
  };

  const calculateNewBalance = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return contact.balance;

    return type === 'credit'
      ? contact.balance + numericAmount
      : contact.balance - numericAmount;
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Operación para {contact.name}</h2>

        <div className="balance-info">
          <p><strong>Balance actual:</strong> ${contact.balance.toFixed(2)}</p>
          <p><strong>Nuevo balance:</strong> ${calculateNewBalance().toFixed(2)}</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Tipo de operación:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'credit' | 'debit')}
              className="form-select"
            >
              <option value="credit">Ingreso (+)</option>
              <option value="debit">Retiro (-)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Monto:</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="form-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Ejecutar Operación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OperationModal;