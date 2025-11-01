// app.js

import express from 'express';
import cors from 'cors';
import pagosRouter from './routes/pagos.js'; // 1. Importamos el enrutador de pagos

// --- Inicialización del Servidor ---
const app = express();
const PORT = process.env.PORT || 3004;

// --- Middlewares Esenciales ---

// 2. Habilita CORS para permitir peticiones desde tu app Ionic
// Puedes configurarlo para ser más restrictivo en producción
app.use(cors());

// 3. Permite que Express entienda las peticiones con cuerpo en formato JSON
app.use(express.json());


// --- Definición de Rutas ---

// 4. Le decimos a Express que cualquier petición que empiece con '/api/pagos'
//    debe ser manejada por nuestro 'pagosRouter'.
//    Ej: POST a http://localhost:3000/api/pagos/crear-intento-pago
app.use('/api/pagos', pagosRouter);


// --- Ruta de Bienvenida (Opcional) ---
app.get('/', (req, res) => {
  res.send('API de Pagos funcionando correctamente.');
});


// --- Arranque del Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});