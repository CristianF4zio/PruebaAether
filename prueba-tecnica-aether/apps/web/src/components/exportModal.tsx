import React, { useState } from 'react';
import { Contact } from '../types';

interface ExportModalProps {
  contact: Contact;
  onExport: (startDate?: string, endDate?: string) => void;
  onCancel: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  contact,
  onExport,
  onCancel
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [noStartDate, setNoStartDate] = useState(false);
  const [useCurrentEndDate, setUseCurrentEndDate] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalStartDate = noStartDate ? undefined : startDate;
    const finalEndDate = useCurrentEndDate ? undefined : endDate;
    
    onExport(finalStartDate, finalEndDate);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Exportar Operaciones - {contact.name}</h2>
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={noStartDate}
                onChange={(e) => setNoStartDate(e.target.checked)}
              />
              Desde el inicio
            </label>
          </div>

          {!noStartDate && (
            <div className="form-group">
              <label>Fecha de inicio:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={useCurrentEndDate}
                onChange={(e) => setUseCurrentEndDate(e.target.checked)}
              />
              Hasta la fecha actual
            </label>
          </div>

          {!useCurrentEndDate && (
            <div className="form-group">
              <label>Fecha de fin:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Exportar CSV
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportModal;