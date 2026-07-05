import express from 'express';
import {
  verificaLogin,
  getClienteExisteCorreo,
} from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', verificaLogin);

// GET /api/auth/clientes/acceso/:correo
router.get('/clientes/acceso/:correo', getClienteExisteCorreo);

export default router;
