// app.js

//import dotenv from 'dotenv';
//dotenv.config();

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

//Importación de enrutadores
import pagosRouter from './routes/pagos.js';
import catalogosRouter from './routes/catalogos.js';
import authRouter from './routes/auth.js';
import clientesRouter from './routes/clientes.js';
import pedidosRouter from './routes/pedidos.js';
import correoRouter from './routes/correo.js';

// --- Inicialización del Servidor ---
const app = express();
//const PORT = process.env.PORT || 3000;
const PORT = 3000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors()); // Habilita preflight para todas las rutas

app.use(express.json());
// app.use(express.urlencoded({ extended: false })); // (Opcional, si no usas formularios HTML)

// Define las rutas base de tu API
// Todo lo de pagos estará en /api/pagos/...
app.use('/api/pagos', pagosRouter);
// Todo lo de catálogos estará en /api/catalogos/...
app.use('/api/catalogos', catalogosRouter);
// Todo lo de autenticación estará en /api/auth/...
app.use('/api/auth', authRouter);
// Todo lo de clientes y domicilios estará en /api/clientes/...
app.use('/api/clientes', clientesRouter);
// Todo lo de pedidos y config estará en /api/pedidos/...
app.use('/api/pedidos', pedidosRouter);
// Todo lo de pedidos y config estará en /api/correo/...
app.use('/api/correo', correoRouter);

// Ruta raíz de la API unificada
app.get('/', (req, res) => {
  res.json({
    info: 'API CHPSystem Pedidos Móviles Nube versión: 20260302 0934',
    status: 'Operacional',
  });
});

// Ruta para retornar la versión de la API de forma dinámica
app.get('/api/version', (req, res) => {
  res.json({
    version: packageJson.version,
  });
});

// --- Arranque del Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor CHP System corriendo en http://localhost:${PORT}`);
});
