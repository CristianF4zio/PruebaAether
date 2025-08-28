import express from 'express';
import cors from 'cors';
import { contactRoutes } from './routes/contactRoutes'; // Importación corregida

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/contacts', contactRoutes); // ¡Esta línea es crucial!

// Ruta de salud para probar que funciona
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'API funcionando correctamente' });
});

// Manejo de rutas no encontradas
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

export default app;