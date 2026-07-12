import express from 'express';
import {
  verificaLogin,
  getClienteExisteCorreo,
  loginUsuarioAdmin,
} from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/login (clientes venta movil)
router.post('/login', verificaLogin);

// GET /api/auth/clientes/acceso/:correo
router.get('/clientes/acceso/:correo', getClienteExisteCorreo);

// POST /api/auth/admin/login (usuarios geocheesepizza)
router.post('/admin/login', loginUsuarioAdmin);

export default router;
