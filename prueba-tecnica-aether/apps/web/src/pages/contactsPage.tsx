import React, { useState } from 'react';
import useSWR from 'swr';
import api from '../services/api';
import { Contact, Operation } from '../types';
import ContactForm from '../components/contactForm';
import OperationModal from '../components/operationModal';
import ExportModal from '../components/exportModal';
import ContactProfile from '../components/contactProfile';

// Función fetcher usada por SWR para obtener datos desde la API
const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function ContactsPage() {
  // SWR para obtener la lista de contactos y mutar (refrescar) los datos
  const { data: contacts, mutate } = useSWR<Contact[]>('/contacts', fetcher);

  // Estados principales de la vista
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null); // Contacto seleccionado
  const [showContactForm, setShowContactForm] = useState(false); // Modal de creación de contacto
  const [showOperationModal, setShowOperationModal] = useState(false); // Modal de operaciones
  const [showExportModal, setShowExportModal] = useState(false); // Modal de exportación
  const [editingContact, setEditingContact] = useState<Contact | null>(null); // Contacto en edición
  const [showOperationsHistory, setShowOperationsHistory] = useState(false); // Modal de historial
  const [showContactProfile, setShowContactProfile] = useState(false); // Modal de perfil de contacto
  const [operations, setOperations] = useState<Operation[]>([]); // Historial de operaciones cargadas
  const [errorMessage, setErrorMessage] = useState(''); // Mensaje de error
  const [successMessage, setSuccessMessage] = useState(''); // Mensaje de éxito

  // Función para mostrar errores con tiempo de desaparición
  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  // Función para mostrar mensajes de éxito con tiempo de desaparición
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Crear un nuevo contacto
  const handleCreateContact = async (data: { name: string; email: string }) => {
    try {
      await api.post('/contacts', data);
      mutate(); // Refresca lista de contactos
      setShowContactForm(false);
      showSuccess('Contacto creado exitosamente');
    } catch (error) {
      console.error('Error creating contact:', error);
      showError('Error al crear contacto. Verifica que el email no exista.');
    }
  };

  // Editar un contacto existente
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

  // Realizar una operación de ingreso o retiro
  const handleOperation = async (type: 'credit' | 'debit', amount: number) => {
    if (!selectedContact) return;
    
    try {
      await api.post(`/contacts/${selectedContact._id}/operations`, { 
        type, 
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

  // Exportar operaciones de un contacto
  const handleExport = (startDate?: string, endDate?: string) => {
    if (!selectedContact) return;
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    
    // Abre en nueva pestaña el archivo exportado
    window.open(`http://localhost:5004/api/contacts/${selectedContact._id}/export?${params.toString()}`, '_blank');
    setShowExportModal(false);
    showSuccess('Exportación iniciada');
  };

  // Cargar historial de operaciones de un contacto
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

  // Mostrar el perfil detallado de un contacto
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

  // Renderizado principal
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

      {/* Botón para crear nuevo contacto */}
      <button onClick={() => setShowContactForm(true)} className="btn btn-primary1">
        ＋ Nuevo Contacto
      </button>

      {/* Listado de contactos */}
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
                {/* Botón para editar */}
                <button 
                  onClick={() => setEditingContact(contact)}
                  className="btn btn-secondary"
                >
                  Editar
                </button>
                {/* Botón para abrir operaciones */}
                <button 
                  onClick={() => {
                    setSelectedContact(contact);
                    setShowOperationModal(true);
                  }}
                  className="btn btn-primary"
                >
                  Operación
                </button>
                {/* Botón para mostrar perfil */}
                <button 
                  onClick={() => handleShowProfile(contact)}
                  className="btn btn-info"
                >
                  Perfil
                </button>
                {/* Botón para historial */}
                <button 
                  onClick={() => {
                    setSelectedContact(contact);
                    loadOperationsHistory(contact._id);
                  }}
                  className="btn btn-info"
                >
                  Historial
                </button>
                {/* Botón para exportar */}
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

      {/* Modal para historial de operaciones */}
      {showOperationsHistory && selectedContact && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            
            {/* Encabezado */}
            <div className="modal-header-historial">
              <h2>Historial de Operaciones - {selectedContact.name}</h2>
              <button className="btn-close" onClick={() => setShowOperationsHistory(false)}>×</button>
            </div>

            {/* Contenido del historial */}
            <div className="modal-content-historial">
              
              {/* Resumen */}
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
