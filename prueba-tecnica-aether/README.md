1. CLonar el repositorio

git clone https://github.com/CristianF4zio/PruebaAether.git
cd prueba-tecnica-aether

2. Instalar dependencias

# Instalar dependencias del root (monorepo)

npm install

# Instalar dependencias del backend

cd apps/api
npm install

# Instalar dependencias del frontend

cd apps/web
npm install

3. Configurar variables de entorno

Backend (apps/api/.env)

MONGODB_URI=mongodb+srv://reviewer_aether:revision1234@cluster0.xoofuzv.mongodb.net/aether-contacts-db?retryWrites=true&w=majority
PORT=5004
NODE_ENV=development

4. Ejecutar por separado

BackEnd
cd apps/api
npm run dev

FrontEnd
cd apps/web
npm run dev

5. Solucion de problemas (SOlO SI ES NECESARIO)

# Cambiar puerto en el .env o liberar el puerto

npx kill-port 5004 # Para backend
npx kill-port 3000 # Para frontend

# Correr programa (nmp run dev, por separado como en el paso 4)

6. Acceso a Base de Datos

Para revisar la aplicación, aquí están las credenciales de acceso a la base de datos:

Database: aether-contacts-db
Usuario: reviewer_aether (read/write)
Password: revision1234
IP Whitelist: (0.0.0.0/0)

# StringConnection = mongodb+srv://reviewer_aether:revision1234@cluster0.xoofuzv.mongodb.net/aether-contacts-db?retryWrites=true&w=majority (StringConnection)
