import React from 'react';
import { Contact, Operation } from '../types';

interface ContactProfileProps {
  contact: Contact;
  operations: Operation[];
  onClose: () => void;
  onEdit: () => void;
  onOperation: () => void;
  onExport: () => void;
}

const ContactProfile: React.FC<ContactProfileProps> = ({
  contact,
  operations,
  onClose,
  onEdit,
  onOperation,
  onExport
}) => {
  // Calcular totales
  const totalIngresos = operations
    .filter(op => op.type === 'credit')
    .reduce((sum, op) => sum + Math.abs(op.amount), 0);

  const totalRetiros = operations
    .filter(op => op.type === 'debit')
    .reduce((sum, op) => sum + Math.abs(op.amount), 0);

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        
        {/* Header fijo */}
        <div className="profile-header">
          <h2>Perfil de {contact.name}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        {/* Contenido scrolleable */}
        <div className="profile-content">
          
          {/* Info de contacto */}
          <div className="contact-info-card">
            <div className="info-grid">
              <div className="info-item">
                <label>Nombre</label>
                <span>{contact.name}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span>{contact.email}</span>
              </div>
              <div className="info-item">
                <label>Balance Actual</label>
                <span className="balance-highlight">${contact.balance.toFixed(2)}</span>
              </div>
              <div className="info-item">
                <label>Miembro desde</label>
              </div>
            </div>
          </div>

          {/* Resumen de operaciones */}
          <div className="operations-summary">
            <div className="summary-card">
              <h4>Total Operaciones</h4>
              <div className="summary-number">{operations.length}</div>
            </div>
            <div className="summary-card">
              <h4>Total Ingresos</h4>
              <div className="summary-positive">+${totalIngresos.toFixed(2)}</div>
            </div>
            <div className="summary-card">
              <h4>Total Retiros</h4>
              <div className="summary-negative">-${totalRetiros.toFixed(2)}</div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="quick-actions">
            <button onClick={onEdit} className="btn btn-secondary">Editar</button>
            <button onClick={onOperation} className="btn btn-primary">Nueva Operación</button>
            <button onClick={onExport} className="btn btn-warning">Exportar CSV</button>
          </div>

          {/* Historial de operaciones */}
          <div className="operations-section">
            <h3>Historial de Operaciones</h3>
            <div className="operations-table-container">
              <table className="operations-table">
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Tipo</th>
                    <th>Monto</th>
                    <th>Balance Posterior</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty-table">
                        No hay operaciones registradas
                      </td>
                    </tr>
                  ) : (
                    operations.map(operation => (
                      <tr key={operation._id} className="operation-row">
                        <td>{new Date(operation.createdAt).toLocaleString()}</td>
                        <td>
                          <span className={`operation-badge ${operation.type === 'credit' ? 'add' : 'subtract'}`}>
                            {operation.type === 'credit' ? 'Ingreso' : 'Retiro'}
                          </span>
                        </td>
                        <td className={operation.type === 'credit' ? 'add' : 'subtract'}>
                          {operation.type === 'credit' ? '+' : '-'}${Math.abs(operation.amount).toFixed(2)}
                        </td>
                        <td>${operation.balanceAfter.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer fijo */}
        <div className="form-actions">
          <button onClick={onClose} className="btn btn-secondary">Cerrar</button>
        </div>

      </div>
    </div>
  );
};

export default ContactProfile;