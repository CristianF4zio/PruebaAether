import React from 'react';
import { useNavigate } from 'react-router-dom';
import './homePage.css'; // Opcional: para estilos

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleAccessContacts = () => {
    navigate('/contacts');
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Sistema de Gestión de Contactos</h1>
        <p>¡Gestiona tus contactos y sus finanzas de manera eficiente!</p>
        
        <button 
          className="access-button"
          onClick={handleAccessContacts}
        >
          Presione aquí para acceder a los contactos
        </button>

        <div className="features">
          <h2>Características principales:</h2>
          <ul>
            <li> ✔️ Crear y editar contactos</li>
            <li> ✔️ Realizar operaciones de ingreso y retiro</li>
            <li> ✔️ Ver historial completo de transacciones</li>
            <li> ✔️ Exportar datos en formato CSV</li>
            <li> ✔️ Interfaz responsive y moderna</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;