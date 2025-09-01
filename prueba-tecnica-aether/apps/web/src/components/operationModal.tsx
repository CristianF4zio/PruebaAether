import React, { useState } from 'react';
import { Contact } from '../types';

// Props que recibe el modal de operaciones
interface OperationModalProps {
  contact: Contact;                                // Contacto al que se le aplicará la operación
  onSubmit: (type: 'credit' | 'debit', amount: number) => void; // Función que ejecuta la operación
  onCancel: () => void;                            // Función para cancelar y cerrar el modal
}

// Componente principal
const OperationModal: React.FC<OperationModalProps> = ({
  contact,
  onSubmit,
  onCancel
}) => {
  // Estados locales
  const [amount, setAmount] = useState('');                    // Valor ingresado por el usuario
  const [type, setType] = useState<'credit' | 'debit'>('credit'); // Tipo de operación (por defecto ingreso)
  const [error, setError] = useState('');                      // Manejo de errores (ej: monto inválido)

  // Manejo del envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpia errores previos

    const numericAmount = parseFloat(amount);

    // Validación: debe ser un número positivo
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('El monto debe ser un número positivo');
      return;
    }

    // Validación: si es retiro, no puede superar el balance disponible
    if (type === 'debit' && numericAmount > contact.balance) {
      setError('Fondos insuficientes');
      return;
    }

    // Ejecuta la operación
    onSubmit(type, numericAmount);
  };

  // Calcula el nuevo balance según el monto escrito
  const calculateNewBalance = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return contact.balance;

    return type === 'credit'
      ? contact.balance + numericAmount // Si es ingreso, suma
      : contact.balance - numericAmount; // Si es retiro, resta
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        
        {/* Título */}
        <h2>Operación para {contact.name}</h2>

        {/* Info del balance actual y balance proyectado */}
        <div className="balance-info">
          <p><strong>Balance actual:</strong> ${contact.balance.toFixed(2)}</p>
          <p><strong>Nuevo balance:</strong> ${calculateNewBalance().toFixed(2)}</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="form">
          
          {/* Selección del tipo de operación */}
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

          {/* Input para el monto */}
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

          {/* Mensaje de error (si aplica) */}
          {error && <div className="error-message">{error}</div>}

          {/* Botones de acción */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={onCancel} 
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              Ejecutar Operación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OperationModal;
