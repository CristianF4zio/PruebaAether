import React, { useState } from 'react';
import useSWR from 'swr';
import api from '../services/api';
import { Contact } from '../types';
import ContactForm from '../components/contactForm';
import OperationModal from '../components/operationModal';
import ExportModal from '../components/exportModal';

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function ContactsPage() {
  const { data: contacts, mutate } = useSWR<Contact[]>('/contacts', fetcher);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const handleCreateContact = async (data: { name: string; email: string }) => {
    try {
      await api.post('/contacts', data);
      mutate();
      setShowContactForm(false);
    } catch (error) {
      console.error('Error creating contact:', error);
      alert('Error al crear contacto. Verifica que el email no exista.');
    }
  };

  const handleEditContact = async (data: { name: string; email: string }) => {
    if (!editingContact) return;
    
    try {
      await api.patch(`/contacts/${editingContact._id}`, { name: data.name });
      mutate();
      setEditingContact(null);
    } catch (error) {
      console.error('Error editing contact:', error);
      alert('Error al editar contacto.');
    }
  };

  const handleOperation = async (type: 'credit' | 'debit', amount: number) => {
    if (!selectedContact) return;
    try {
      await api.post(`/contacts/${selectedContact._id}/operations`, { type, amount });
      mutate();
      setShowOperationModal(false);
    } catch (error) {
      console.error('Error performing operation:', error);
      alert('Error al realizar la operación.');
    }
  };

  const handleExport = (startDate?: string, endDate?: string) => {
    if (!selectedContact) return;
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    
    window.open(`http://localhost:5004/api/contacts/${selectedContact._id}/export?${params.toString()}`, '_blank');
    setShowExportModal(false);
  };

  return (
    <div className="container">
      <h1>Contactos</h1>
      
      <button onClick={() => setShowContactForm(true)}>Nuevo Contacto</button>

      <div className="contacts-grid">
        {contacts?.map(contact => (
          <div key={contact._id} className="contact-card">
            <h3>{contact.name}</h3>
            <p>{contact.email}</p>
            <p>Balance: ${contact.balance}</p>
            <div className="contact-actions">
              <button onClick={() => setEditingContact(contact)}>
                Editar
              </button>
              <button onClick={() => {
                setSelectedContact(contact);
                setShowOperationModal(true);
              }}>
                Operación
              </button>
              <button onClick={() => {
                setSelectedContact(contact);
                setShowExportModal(true);
              }}>
                Exportar
              </button>
            </div>
          </div>
        ))}
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

      {showOperationModal && selectedContact && (
        <OperationModal
          contact={selectedContact}
          onSubmit={handleOperation}
          onCancel={() => setShowOperationModal(false)}
        />
      )}

      {showExportModal && selectedContact && (
        <ExportModal
          contact={selectedContact}
          onExport={handleExport}
          onCancel={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}