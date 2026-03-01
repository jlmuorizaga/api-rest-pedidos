import express from 'express';
import {
  //updatePedidoPago,
  insertPedido,
  getPedidosByCliente,
  getTotalPedidosHistoricosByCliente,
  getPedidosHistoricosByCliente,
  getPedidosBySucursal,
  getPedidosEstatusBySucursal,
  getPedidoById,
  updateEstatusPedido,
  getAllPedidos, // (El de la demo de Nacho)
  getConfiguracion,
} from '../controllers/pedidosController.js';

const router = express.Router();

// RUTAS DE PEDIDOS
router.post('/', insertPedido);
//router.put('/pago/:idPedido', updatePedidoPago);
router.get('/cliente/:idCliente', getPedidosByCliente);
router.get('/historico/:idCliente', getTotalPedidosHistoricosByCliente);
router.get(
  '/historico/:idCliente/:registrosXPagina/:iniciaEn',
  getPedidosHistoricosByCliente
);
router.get('/sucursal/:claveSucursal', getPedidosBySucursal);
router.get('/sucursal/:claveSucursal/:estatus', getPedidosEstatusBySucursal);

router.get('/sucursal', getAllPedidos); // (Tu ruta demo)
router.get('/id/:idPedido', getPedidoById);
router.put('/estatus/:estatus/:idPedido', updateEstatusPedido);

// RUTA DE CONFIGURACIÓN
router.get('/configuracion', getConfiguracion);

export default router;
