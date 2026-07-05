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
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// RUTAS DE PEDIDOS
router.post('/', verificarToken, insertPedido);
//router.put('/pago/:idPedido', updatePedidoPago);
router.get('/cliente/:idCliente', verificarToken, getPedidosByCliente);
router.get('/historico/:idCliente', verificarToken, getTotalPedidosHistoricosByCliente);
router.get(
  '/historico/:idCliente/:registrosXPagina/:iniciaEn',
  verificarToken,
  getPedidosHistoricosByCliente
);
router.get('/sucursal/:claveSucursal', getPedidosBySucursal);
router.get('/sucursal/:claveSucursal/:estatus', getPedidosEstatusBySucursal);

router.get('/sucursal', getAllPedidos); // (Tu ruta demo)
router.get('/id/:idPedido', verificarToken, getPedidoById);
router.put('/estatus/:estatus/:idPedido', updateEstatusPedido);

// RUTA DE CONFIGURACIÓN
router.get('/configuracion', getConfiguracion);

export default router;
