import express from 'express';
import {
  insertaCliente,
  actualizaDatosCliente,
  getDatosCliente,
  getDomiciliosCliente,
  insertaDomicilioCliente,
  actualizaDomicilioCliente,
  eliminaDomicilioCliente,
} from '../controllers/clientesController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas de Clientes
// POST /api/clientes (Registro - Abierto, pero validado internamente)
router.post('/', insertaCliente);
// PUT /api/clientes/:idCliente (Protegido)
router.put('/id/:idCliente', verificarToken, actualizaDatosCliente);
// GET /api/clientes/:correo (Protegido)
router.get('/correo/:correo', verificarToken, getDatosCliente);

// Rutas de Domicilios (Protegidos)
// POST /api/domicilios-cliente
router.post('/domicilios', verificarToken, insertaDomicilioCliente);
// PUT /api/domicilios-cliente
router.put('/domicilios', verificarToken, actualizaDomicilioCliente);
// DELETE /api/domicilios-cliente/:idDomicilioCliente
router.delete('/domicilios/:idDomicilioCliente', verificarToken, eliminaDomicilioCliente);
// GET /api/domicilios-cliente/:idCliente
router.get('/domicilios/:idCliente', verificarToken, getDomiciliosCliente);

export default router;
