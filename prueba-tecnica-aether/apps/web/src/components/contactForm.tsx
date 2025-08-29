import React, { useState, useEffect } from 'react';
import { Contact } from '../types';

// Define las props que recibe el componente
interface ContactFormProps {
  onSubmit: (data: { name: string; email: string }) => void;
  onCancel: () => void;
  contact?: Contact;
  isEditing?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  contact, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}) => {
  const [name, setName] = useState(contact?.name || '');
  const [email, setEmail] = useState(contact?.email || '');

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setEmail(contact.email);
    }
  }, [contact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isEditing ? 'Editar Contacto' : 'Crear Contacto'}</h2>
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="name">Nombre:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ingrese el nombre"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isEditing}
              placeholder="Ingrese el email"
            />
          </div>

          {!isEditing && (
            <div className="form-note">
              <p>💡 El balance inicial será $0</p>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;