// app.js

import express from 'express';
import cors from 'cors';

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
app.use(cors());
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
    info: 'API CHPSystem Pedidos Móviles Nube versión: 20251206 1415',
    status: 'Operacional',
  });
});

// --- Arranque del Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor CHP System corriendo en http://localhost:${PORT}`);
});
