import React, { useState, useEffect } from 'react';
import { Contact } from '../types';

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
  // Estado local para los campos del formulario
  const [name, setName] = useState(contact?.name || '');
  const [email, setEmail] = useState(contact?.email || '');

  // Si se recibe un contacto, se cargan sus datos en los inputs
  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setEmail(contact.email);
    }
  }, [contact]);

  // Envía los datos del formulario al componente padre
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isEditing ? 'Editar Contacto' : 'Crear Contacto'}</h2>
        
        <form onSubmit={handleSubmit} className="form">
          {/* Campo nombre */}
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

          {/* Campo email (bloqueado si edita) */}
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

          {/* Nota solo al crear */}
          {!isEditing && (
            <div className="form-note">
              <p>El balance inicial será $0.00</p>
            </div>
          )}

          {/* Botones de acción */}
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