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
router.post('/', insertaCliente);
// PUT /api/clientes/:idCliente
router.put('/id/:idCliente', actualizaDatosCliente);
// GET /api/clientes/:correo
router.get('/correo/:correo', getDatosCliente);

// Rutas de Domicilios (las agrupamos aquí)
// POST /api/domicilios-cliente
router.post('/domicilios', insertaDomicilioCliente);
// PUT /api/domicilios-cliente
router.put('/domicilios', actualizaDomicilioCliente);
// DELETE /api/domicilios-cliente/:idDomicilioCliente
router.delete('/domicilios/:idDomicilioCliente', eliminaDomicilioCliente);
// GET /api/domicilios-cliente/:idCliente
router.get('/domicilios/:idCliente', getDomiciliosCliente);

export default router;
