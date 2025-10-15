// routes/pagos.js
import express from 'express';
import {
  crearIntentoPago,
  confirmarYGuardarPedido,
} from '../controllers/pagosController.js';

const router = express.Router();

// Endpoint para crear la intención de pago
router.post('/crear-intento-pago', crearIntentoPago);

// Endpoint para verificar el pago y guardar el pedido final
router.post('/confirmar-y-guardar', confirmarYGuardarPedido);

export default router;
