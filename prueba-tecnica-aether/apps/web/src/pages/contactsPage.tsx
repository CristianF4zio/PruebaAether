import React, { useState, useEffect } from 'react';
import { Contact, Operation } from '../types';
import ContactForm from '../components/contactForm';
import OperationModal from '../components/operationModal';
import ExportModal from '../components/exportModal';
import ContactProfile from '../components/contactProfile';

export default function ContactsPage() {
  // Estado principal: lista de contactos
  const [contacts, setContacts] = useState<Contact[]>([]);
  // Contacto seleccionado (para operaciones, perfil o exportación)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  // Mostrar modales
  const [showContactForm, setShowContactForm] = useState(false);
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showOperationsHistory, setShowOperationsHistory] = useState(false);
  const [showContactProfile, setShowContactProfile] = useState(false);
  // Historial de operaciones del contacto seleccionado
  const [operations, setOperations] = useState<Operation[]>([]);
  // Mensajes de error y éxito
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Función para cargar contactos desde la API
  const fetchContacts = async () => {
    try {
      const res = await fetch('http://localhost:5004/api/contacts');
      const data = await res.json();
      setContacts(data);
    } catch (error) {
      console.error(error);
      setErrorMessage('Error cargando contactos');
    }
  };

  // Cargar contactos al montar el componente
  useEffect(() => {
    fetchContacts();
  }, []);

  // Función para mostrar mensajes de error por 5s
  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  // Función para mostrar mensajes de éxito por 3s
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Crear nuevo contacto
  const handleCreateContact = async (data: { name: string; email: string }) => {
    try {
      await fetch('http://localhost:5004/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      fetchContacts(); // Refresca lista
      setShowContactForm(false);
      showSuccess('Contacto creado exitosamente');
    } catch {
      showError('Error al crear contacto.');
    }
  };

  // Editar contacto existente
  const handleEditContact = async (data: { name: string; email: string }) => {
    if (!editingContact) return;
    try {
      await fetch(`http://localhost:5004/api/contacts/${editingContact._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name }),
      });
      fetchContacts(); // Refresca lista
      setEditingContact(null);
      showSuccess('Contacto actualizado exitosamente');
    } catch {
      showError('Error al editar contacto');
    }
  };

  // Realizar operación (ingreso o retiro)
  const handleOperation = async (type: 'credit' | 'debit', amount: number) => {
    if (!selectedContact) return;
    try {
      await fetch(`http://localhost:5004/api/contacts/${selectedContact._id}/operations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, amount }),
      });
      fetchContacts(); // Refresca lista
      setShowOperationModal(false);
      showSuccess(type === 'credit' ? `Ingreso $${amount} exitoso` : `Retiro $${amount} exitoso`);
    } catch {
      showError('Error al realizar la operación');
    }
  };

  // Exportar operaciones de un contacto
  const handleExport = (startDate?: string, endDate?: string) => {
    if (!selectedContact) return;
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    // Abrir exportación en nueva pestaña
    window.open(`http://localhost:5004/api/contacts/${selectedContact._id}/export?${params.toString()}`, '_blank');
    setShowExportModal(false);
    showSuccess('Exportación iniciada');
  };

  // Cargar historial de operaciones
  const loadOperationsHistory = async (contactId: string) => {
    try {
      const res = await fetch(`http://localhost:5004/api/contacts/${contactId}/operations`);
      const data = await res.json();
      setOperations(data);
      setShowOperationsHistory(true);
    } catch {
      showError('Error cargando historial');
    }
  };

  // Mostrar perfil de contacto
  const handleShowProfile = async (contact: Contact) => {
    setSelectedContact(contact);
    try {
      const res = await fetch(`http://localhost:5004/api/contacts/${contact._id}/operations`);
      const data = await res.json();
      setOperations(data);
      setShowContactProfile(true);
    } catch {
      showError('Error al cargar perfil');
    }
  };

  return (
    <div className="container">
      <h1>Lista de Contactos</h1>

      {/* Mensajes de éxito y error */}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {/* Botón para crear nuevo contacto */}
      <button onClick={() => setShowContactForm(true)} className="btn btn-primary1">＋ Nuevo Contacto</button>

      {/* Lista de contactos */}
      <div className="contacts-grid">
        {contacts.length === 0 ? (
          <div className="empty-state">
            <p>No hay contactos registrados</p>
            <button onClick={() => setShowContactForm(true)} className="btn btn-primary">
              Crear Primer Contacto
            </button>
          </div>
        ) : (
          contacts.map(contact => (
            <div key={contact._id} className="contact-card">
              <div className="contact-info">
                <h3>{contact.name}</h3>
                <p className="contact-email">{contact.email}</p>
                <p className="contact-balance">Balance: ${contact.balance.toFixed(2)}</p>
              </div>
              <div className="contact-actions">
                {/* Editar contacto */}
                <button onClick={() => setEditingContact(contact)} className="btn btn-secondary">Editar</button>
                {/* Operación de ingreso/retiro */}
                <button onClick={() => { setSelectedContact(contact); setShowOperationModal(true); }} className="btn btn-primary">Operación</button>
                {/* Ver perfil */}
                <button onClick={() => handleShowProfile(contact)} className="btn btn-info">Perfil</button>
                {/* Ver historial */}
                <button onClick={() => { setSelectedContact(contact); loadOperationsHistory(contact._id); }} className="btn btn-info">Historial</button>
                {/* Exportar operaciones */}
                <button onClick={() => { setSelectedContact(contact); setShowExportModal(true); }} className="btn btn-warning">Exportar</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modales */}
      {showContactForm && <ContactForm onSubmit={handleCreateContact} onCancel={() => setShowContactForm(false)} isEditing={false} />}
      {editingContact && <ContactForm contact={editingContact} onSubmit={handleEditContact} onCancel={() => setEditingContact(null)} isEditing={true} />}
      {showOperationModal && selectedContact && <OperationModal contact={selectedContact} onSubmit={handleOperation} onCancel={() => setShowOperationModal(false)} />}
      {showExportModal && selectedContact && <ExportModal contact={selectedContact} onExport={handleExport} onCancel={() => setShowExportModal(false)} />}

      {/* Historial de operaciones */}
      {showOperationsHistory && selectedContact && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header-historial">
              <h2>Historial de Operaciones - {selectedContact.name}</h2>
              <button className="btn-close" onClick={() => setShowOperationsHistory(false)}>×</button>
            </div>
            <div className="modal-content-historial">
              <div className="balance-summary">
                <p><strong>Balance actual:</strong> ${selectedContact.balance.toFixed(2)}</p>
                <p><strong>Total operaciones:</strong> {operations.length}</p>
              </div>
              <div className="operations-list">
                {operations.length === 0 ? (
                  <p className="empty-history">No hay operaciones registradas</p>
                ) : (
                  operations.map(operation => (
                    <div key={operation._id} className="operation-item">
                      <span className="operation-date">{new Date(operation.createdAt).toLocaleDateString()} {new Date(operation.createdAt).toLocaleTimeString()}</span>
                      <span className={`operation-type ${operation.type === 'credit' ? 'add' : 'subtract'}`}>{operation.type === 'credit' ? '➕ Ingreso' : '➖ Retiro'}</span>
                      <span className={`operation-amount ${operation.type === 'credit' ? 'add' : 'subtract'}`}>{operation.type === 'credit' ? '+' : '-'}${Math.abs(operation.amount).toFixed(2)}</span>
                      <span className="operation-balance">Balance: ${operation.balanceAfter.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="form-actions">
              <button onClick={() => setShowOperationsHistory(false)} className="btn btn-secondary">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Perfil de contacto */}
      {showContactProfile && selectedContact && (
        <ContactProfile
          contact={selectedContact}
          operations={operations}
          onClose={() => setShowContactProfile(false)}
          onEdit={() => { setShowContactProfile(false); setEditingContact(selectedContact); }}
          onOperation={() => { setShowContactProfile(false); setShowOperationModal(true); }}
          onExport={() => { setShowContactProfile(false); setShowExportModal(true); }}
        />
      )}
    </div>
  );
}
