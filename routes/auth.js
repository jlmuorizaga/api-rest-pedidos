import express from 'express';
import {
  verificaLogin,
  getClienteAcceso,
  getClienteExisteCorreo,
} from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', verificaLogin);

// GET /api/auth/clientes/acceso/:correo/:contrasenia
router.get('/clientes/acceso/:correo/:contrasenia', getClienteAcceso);

// GET /api/auth/clientes/acceso/:correo
router.get('/clientes/acceso/:correo', getClienteExisteCorreo);

export default router;
