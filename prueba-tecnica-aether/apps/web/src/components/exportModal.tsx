import React, { useState } from 'react';
import { Contact } from '../types';

// Props que recibe el modal de exportación
interface ExportModalProps {
  contact: Contact;                                  // Contacto del que se exportarán operaciones
  onExport: (startDate?: string, endDate?: string) => void; // Función que ejecuta la exportación
  onCancel: () => void;                              // Función para cancelar y cerrar el modal
}

// Componente principal
const ExportModal: React.FC<ExportModalProps> = ({
  contact,
  onExport,
  onCancel
}) => {
  // Estado para manejar fechas y opciones
  const [startDate, setStartDate] = useState('');        // Fecha de inicio seleccionada
  const [endDate, setEndDate] = useState('');            // Fecha de fin seleccionada
  const [noStartDate, setNoStartDate] = useState(false); // Checkbox: "Desde el inicio"
  const [useCurrentEndDate, setUseCurrentEndDate] = useState(true); // Checkbox: "Hasta la fecha actual"

  // Maneja el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si "Desde el inicio" está marcado, no se envía startDate
    const finalStartDate = noStartDate ? undefined : startDate;
    // Si "Hasta la fecha actual" está marcado, no se envía endDate
    const finalEndDate = useCurrentEndDate ? undefined : endDate;
    
    // Ejecuta la exportación con las fechas seleccionadas
    onExport(finalStartDate, finalEndDate);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        
        {/* Título del modal */}
        <h2>Exportar Operaciones - {contact.name}</h2>
        
        {/* Formulario para configurar rango de fechas */}
        <form onSubmit={handleSubmit} className="form">
          
          {/* Opción: exportar desde el inicio (ignora fecha de inicio) */}
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

          {/* Campo: fecha de inicio (solo visible si no se marcó "Desde el inicio") */}
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

          {/* Opción: exportar hasta la fecha actual (ignora fecha de fin) */}
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

          {/* Campo: fecha de fin (solo visible si no se marcó "Hasta la fecha actual") */}
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

          {/* Botones de acción */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={onCancel} 
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              Exportar CSV
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportModal;
