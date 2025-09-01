import express from 'express';
import cors from 'cors';
import { contactRoutes } from './routes/contactRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// ¡ESTA LÍNEA ES CRUCIAL!
app.use('/api/contacts', contactRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'API funcionando correctamente' });
});

// Manejo de rutas no encontradas
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

export default app;