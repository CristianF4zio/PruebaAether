import React, { useState } from 'react';
import useSWR from 'swr';
import api from '../services/api';
import { Contact, Operation } from '../types';
import ContactForm from '../components/contactForm';
import OperationModal from '../components/operationModal';
import ExportModal from '../components/exportModal';
import ContactProfile from '../components/contactProfile';

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function ContactsPage() {
  const { data: contacts, mutate } = useSWR<Contact[]>('/contacts', fetcher);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showOperationsHistory, setShowOperationsHistory] = useState(false);
  const [showContactProfile, setShowContactProfile] = useState(false);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCreateContact = async (data: { name: string; email: string }) => {
    try {
      await api.post('/contacts', data);
      mutate();
      setShowContactForm(false);
      showSuccess('Contacto creado exitosamente');
    } catch (error) {
      console.error('Error creating contact:', error);
      showError('Error al crear contacto. Verifica que el email no exista.');
    }
  };

  const handleEditContact = async (data: { name: string; email: string }) => {
    if (!editingContact) return;
    
    try {
      await api.patch(`/contacts/${editingContact._id}`, { name: data.name });
      mutate();
      setEditingContact(null);
      showSuccess('Contacto actualizado exitosamente');
    } catch (error) {
      console.error('Error editing contact:', error);
      showError('Error al editar contacto.');
    }
  };

  const handleOperation = async (type: 'credit' | 'debit', amount: number) => {
    if (!selectedContact) return;
    
    try {
      await api.post(`/contacts/${selectedContact._id}/operations`, { 
        type, // ✅ Ahora envía directamente 'credit' o 'debit'
        amount 
      });
      mutate();
      setShowOperationModal(false);
      showSuccess(
        type === 'credit' 
          ? `Ingreso de $${amount.toFixed(2)} realizado con éxito`
          : `Retiro de $${amount.toFixed(2)} realizado con éxito`
      );
    } catch (error: any) {
      console.error('Error performing operation:', error);
      showError(error.response?.data?.error || 'Error al realizar la operación');
    }
  };

  const handleExport = (startDate?: string, endDate?: string) => {
    if (!selectedContact) return;
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    
    window.open(`http://localhost:5004/api/contacts/${selectedContact._id}/export?${params.toString()}`, '_blank');
    setShowExportModal(false);
    showSuccess('Exportación iniciada');
  };

  const loadOperationsHistory = async (contactId: string) => {
    try {
      const response = await api.get(`/contacts/${contactId}/operations`);
      setOperations(response.data);
      setShowOperationsHistory(true);
    } catch (error) {
      console.error('Error loading operations:', error);
      showError('Error al cargar el historial');
    }
  };

  const handleShowProfile = async (contact: Contact) => {
    setSelectedContact(contact);
    try {
      const response = await api.get(`/contacts/${contact._id}/operations`);
      setOperations(response.data);
      setShowContactProfile(true);
    } catch (error) {
      console.error('Error loading operations:', error);
      showError('Error al cargar el perfil');
    }
  };

  return (
    <div className="container">
      <h1>Lista de Contactos</h1>
      
      {/* Mensajes de éxito y error */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      <button onClick={() => setShowContactForm(true)} className="btn btn-primary1">
        ＋ Nuevo Contacto
      </button>

      <div className="contacts-grid">
        {contacts?.length === 0 ? (
          <div className="empty-state">
            <p>No hay contactos registrados</p>
            <button 
              onClick={() => setShowContactForm(true)}
              className="btn btn-primary"
            >
              Crear Primer Contacto
            </button>
          </div>
        ) : (
          contacts?.map(contact => (
            <div key={contact._id} className="contact-card">
              <div className="contact-info">
                <h3>{contact.name}</h3>
                <p className="contact-email">{contact.email}</p>
                <p className="contact-balance">Balance: ${contact.balance.toFixed(2)}</p>
              </div>
              
              <div className="contact-actions">
                <button 
                  onClick={() => setEditingContact(contact)}
                  className="btn btn-secondary"
                >
                  Editar
                </button>
                <button 
                  onClick={() => {
                    setSelectedContact(contact);
                    setShowOperationModal(true);
                  }}
                  className="btn btn-primary"
                >
                  Operación
                </button>
                <button 
                  onClick={() => handleShowProfile(contact)}
                  className="btn btn-info"
                >
                  Perfil
                </button>
                <button 
                  onClick={() => {
                    setSelectedContact(contact);
                    loadOperationsHistory(contact._id);
                  }}
                  className="btn btn-info"
                >
                  Historial
                </button>
                <button 
                  onClick={() => {
                    setSelectedContact(contact);
                    setShowExportModal(true);
                  }}
                  className="btn btn-warning"
                >
                  Exportar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para crear contacto */}
      {showContactForm && (
        <ContactForm
          onSubmit={handleCreateContact}
          onCancel={() => setShowContactForm(false)}
          isEditing={false}
        />
      )}

      {/* Modal para editar contacto */}
      {editingContact && (
        <ContactForm
          contact={editingContact}
          onSubmit={handleEditContact}
          onCancel={() => setEditingContact(null)}
          isEditing={true}
        />
      )}

      {/* Modal para operaciones */}
      {showOperationModal && selectedContact && (
        <OperationModal
          contact={selectedContact}
          onSubmit={handleOperation}
          onCancel={() => setShowOperationModal(false)}
        />
      )}

      {/* Modal para exportar */}
      {showExportModal && selectedContact && (
        <ExportModal
          contact={selectedContact}
          onExport={handleExport}
          onCancel={() => setShowExportModal(false)}
        />
      )}

      {/* Modal para historial de operaciones (DIRECTO) */}
      {showOperationsHistory && selectedContact && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            
            {/* Header centrado */}
            <div className="modal-header-historial">
              <h2>Historial de Operaciones - {selectedContact.name}</h2>
              <button className="btn-close" onClick={() => setShowOperationsHistory(false)}>×</button>
            </div>

            {/* Contenido */}
            <div className="modal-content-historial">
              
              {/* Resumen de balance */}
              <div className="balance-summary">
                <p><strong>Balance actual:</strong> ${selectedContact.balance.toFixed(2)}</p>
                <p><strong>Total operaciones:</strong> {operations.length}</p>
              </div>

              {/* Lista de operaciones */}
              <div className="operations-list">
                {operations.length === 0 ? (
                  <p className="empty-history">No hay operaciones registradas</p>
                ) : (
                  operations.map(operation => (
                    <div key={operation._id} className="operation-item">
                      <span className="operation-date">
                        {new Date(operation.createdAt).toLocaleDateString()} {new Date(operation.createdAt).toLocaleTimeString()}
                      </span>
                      <span className={`operation-type ${operation.type === 'credit' ? 'add' : 'subtract'}`}>
                        {operation.type === 'credit' ? '➕ Ingreso' : '➖ Retiro'}
                      </span>
                      <span className={`operation-amount ${operation.type === 'credit' ? 'add' : 'subtract'}`}>
                        {operation.type === 'credit' ? '+' : '-'}${Math.abs(operation.amount).toFixed(2)}
                      </span>
                      <span className="operation-balance">
                        Balance: ${operation.balanceAfter.toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="form-actions">
              <button 
                onClick={() => setShowOperationsHistory(false)} 
                className="btn btn-secondary"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal para perfil de contacto */}
      {showContactProfile && selectedContact && (
        <ContactProfile
          contact={selectedContact}
          operations={operations}
          onClose={() => setShowContactProfile(false)}
          onEdit={() => {
            setShowContactProfile(false);
            setEditingContact(selectedContact);
          }}
          onOperation={() => {
            setShowContactProfile(false);
            setShowOperationModal(true);
          }}
          onExport={() => {
            setShowContactProfile(false);
            setShowExportModal(true);
          }}
        />
      )}
    </div>
  );
}