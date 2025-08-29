import React, { useState } from 'react';
import { Contact } from '../types';

interface ExportModalProps {
  contact?: Contact;
  onExport: (startDate?: string, endDate?: string) => void;
  onCancel: () => void;
}

export default function ExportModal({ contact, onExport, onCancel }: ExportModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [noStartDate, setNoStartDate] = useState(false);
  const [useCurrentEndDate, setUseCurrentEndDate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExport(noStartDate ? undefined : startDate, useCurrentEndDate ? undefined : endDate);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Exportar Transacciones {contact ? `de ${contact.name}` : ''}</h2>
        <form onSubmit={handleSubmit}>
          <div>
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
            <div>
              <label>Fecha inicio:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          )}
          <div>
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
            <div>
              <label>Fecha fin:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}
          <div className="modal-actions">
            <button type="button" onClick={onCancel}>Cancelar</button>
            <button type="submit">Exportar CSV</button>
          </div>
        </form>
      </div>
    </div>
  );
}