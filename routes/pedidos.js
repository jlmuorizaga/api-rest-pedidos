import express from 'express';
import {
  updatePedidoPago,
  getPedidosByCliente,
  getTotalPedidosHistoricosByCliente,
  getPedidosHistoricosByCliente,
  getPedidosBySucursal,
  getPedidoById,
  updateEstatusPedido,
  getAllPedidos, // (El de la demo de Nacho)
  getConfiguracion,
} from '../controllers/pedidosController.js';

const router = express.Router();

// Nota: agrupé las rutas de pedidos bajo /pedidos/
// y /configuracion por separado

// RUTAS DE PEDIDOS
router.put('/pedidos/pago/:idPedido', updatePedidoPago);
router.get('/pedidos/cliente/:idCliente', getPedidosByCliente);
router.get('/pedidos/historico/:idCliente', getTotalPedidosHistoricosByCliente);
router.get(
  '/pedidos/historico/:idCliente/:registrosXPagina/:iniciaEn',
  getPedidosHistoricosByCliente
);
router.get('/pedidos/sucursal/:claveSucursal', getPedidosBySucursal);
router.get('/pedidos/sucursal', getAllPedidos); // (Tu ruta demo)
router.get('/pedidos/:idPedido', getPedidoById);
router.put('/pedidos/estatus/:estatus/:idPedido', updateEstatusPedido);

// RUTA DE CONFIGURACIÓN
router.get('/configuracion', getConfiguracion);

export default router;
