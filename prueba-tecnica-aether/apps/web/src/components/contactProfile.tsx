import React from 'react'; 
import { Contact, Operation } from '../types';  

// Función auxiliar: recibe un número y devuelve solo la parte entera como string
const fmt = (n: number) => Math.trunc(n).toString();  

// Props que recibe el componente ContactProfile
interface ContactProfileProps {   
  contact: Contact;            // Información del contacto (nombre, email, balance, fecha de creación, etc.)
  operations: Operation[];     // Lista de operaciones (ingresos, retiros, etc.)
  onClose: () => void;         // Función para cerrar el modal
  onEdit: () => void;          // Función para editar información del contacto
  onOperation: () => void;     // Función para registrar una nueva operación
  onExport: () => void;        // Función para exportar las operaciones a CSV
}  

// Componente principal que recibe props
const ContactProfile: React.FC<ContactProfileProps> = ({   
  contact,   
  operations,   
  onClose,   
  onEdit,   
  onOperation,   
  onExport 
}) => {   

  // Cálculo del total de ingresos (credit)
  const totalIngresos = operations
    .filter(op => op.type === 'credit')                 // Filtra operaciones tipo ingreso
    .reduce((sum, op) => sum + Math.trunc(op.amount), 0); // Suma los montos truncados

  // Cálculo del total de retiros (debit)
  const totalRetiros = operations
    .filter(op => op.type === 'debit')                  // Filtra operaciones tipo retiro
    .reduce((sum, op) => sum + Math.trunc(op.amount), 0);

  // Formatea la fecha de creación del contacto
  const formatMemberSince = () =>
    contact.createdAt
      ? new Date(contact.createdAt).toLocaleDateString('es-ES') // Convierte fecha al formato español
      : 'Fecha no disponible';

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        
        {/* Header con título y botón para cerrar */}
        <div className="profile-header">
          <h2>Perfil de {contact.name}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        {/* Contenido scrollable */}
        <div className="profile-content">
          
          {/* Tarjeta con datos principales del contacto */}
          <div className="contact-info-card">
            <div className="info-grid">
              <div className="info-item">
                <label>NOMBRE</label>
                <span>{contact.name}</span>
              </div>
              <div className="info-item">
                <label>EMAIL</label>
                <span>{contact.email}</span>
              </div>
              <div className="info-item">
                <label>BALANCE ACTUAL</label>
                <span className="balance-highlight">${fmt(contact.balance)}</span>
              </div>
              <div className="info-item">
                <label>MIEMBRO DESDE</label>
                <span>{formatMemberSince()}</span>
              </div>
            </div>
          </div>

          {/* Resumen de operaciones */}
          <div className="operations-summary">
            <div className="summary-card">
              <h4>TOTAL OPERACIONES</h4>
              <div className="summary-number">{operations.length}</div>
            </div>
            <div className="summary-card">
              <h4>TOTAL INGRESOS</h4>
              <div className="summary-positive">+${fmt(totalIngresos)}</div>
            </div>
            <div className="summary-card">
              <h4>TOTAL RETIROS</h4>
              <div className="summary-negative">-${fmt(totalRetiros)}</div>
            </div>
          </div>

          {/* Botones rápidos de acción */}
          <div className="quick-actions">
            <button onClick={onEdit} className="btn btn-secondary">Editar</button>
            <button onClick={onOperation} className="btn btn-primary">Nueva Operación</button>
            <button onClick={onExport} className="btn btn-warning">Exportar CSV</button>
          </div>

          {/* Tabla de historial de operaciones */}
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
                    // Si no hay operaciones, muestra mensaje vacío
                    <tr>
                      <td colSpan={4} className="empty-table">
                        No hay operaciones registradas
                      </td>
                    </tr>
                  ) : (
                    // Si hay operaciones, las lista
                    operations.map(op => (
                      <tr key={op._id} className="operation-row">
                        <td>{new Date(op.createdAt).toLocaleString()}</td>
                        <td>
                          <span className={`operation-badge ${op.type === 'credit' ? 'add' : 'subtract'}`}>
                            {op.type === 'credit' ? 'Ingreso' : 'Retiro'}
                          </span>
                        </td>
                        <td className={op.type === 'credit' ? 'add' : 'subtract'}>
                          {op.type === 'credit' ? '+' : '-'}${fmt(Math.abs(op.amount))}
                        </td>
                        <td>${fmt(op.balanceAfter)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer fijo con botón de cerrar */}
        <div className="form-actions">
          <button onClick={onClose} className="btn btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ContactProfile;
