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

const router = express.Router();

// Rutas de Clientes
// POST /api/clientes
router.post('/clientes', insertaCliente);
// PUT /api/clientes/:idCliente
router.put('/clientes/:idCliente', actualizaDatosCliente);
// GET /api/clientes/:correo
router.get('/clientes/:correo', getDatosCliente);

// Rutas de Domicilios (las agrupamos aquí)
// POST /api/domicilios-cliente
router.post('/domicilios-cliente', insertaDomicilioCliente);
// PUT /api/domicilios-cliente
router.put('/domicilios-cliente', actualizaDomicilioCliente);
// DELETE /api/domicilios-cliente/:idDomicilioCliente
router.delete('/domicilios-cliente/:idDomicilioCliente', eliminaDomicilioCliente);
// GET /api/domicilios-cliente/:idCliente
router.get('/domicilios-cliente/:idCliente', getDomiciliosCliente);

export default router;