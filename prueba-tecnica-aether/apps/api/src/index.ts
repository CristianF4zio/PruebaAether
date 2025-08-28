import mongoose from 'mongoose';
import app from './app';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 5004;

// Verificar que MONGODB_URI existe
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI no está definida en las variables de entorno');
  process.exit(1);
}

// Conectar a MongoDB Atlas y luego iniciar el servidor
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('Conectado a MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`API corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error conectando a MongoDB:', error);
  });