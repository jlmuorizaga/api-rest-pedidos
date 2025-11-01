// routes/catalogos.js
import express from 'express';

// Importamos TODAS las funciones del controlador
import {
  getApiInfo,
  getSucursales,
  getPizzasBySucursal,
  getTamaniosBySucursal,
  getProductosBySucursal,
  getTipoProductosBySucursal,
  getProductosByTipoProductoBySucursal,
  getSucursalesAll,
  getPromocionesBySucursal,
  getSalsasBySucursal,
  getRegionesAll,
  getCategorias,
  getIngredientesAll,
  getOrillasAll,
  getOrillasBySucursal,
  getCategoriasAll,
} from '../controllers/catalogosController.js';

const router = express.Router();

// Ruta raíz de la API de Catálogos (la que tenías en '/')
router.get('/', getApiInfo);

// Endpoints para catálogos
router.get('/sucursales', getSucursales);
router.get('/pizzas/:cve_sucursal', getPizzasBySucursal);
router.get('/tamanios/:cve_sucursal/:id_especialidad', getTamaniosBySucursal);
router.get('/productos/:cve_sucursal', getProductosBySucursal);
router.get('/tipoproductos/:cve_sucursal', getTipoProductosBySucursal);
router.get(
  '/productos/:cve_sucursal/:id_tipo_producto',
  getProductosByTipoProductoBySucursal
);
router.get('/sucursalesAll', getSucursalesAll);
router.get('/promociones/:cve_sucursal', getPromocionesBySucursal);
router.get('/salsas/:cve_sucursal', getSalsasBySucursal);
router.get('/regionesAll', getRegionesAll);
router.get('/categorias', getCategorias);
router.get('/ingredientesAll', getIngredientesAll);
router.get('/orillasAll', getOrillasAll);
router.get('/orillas/:cve_sucursal', getOrillasBySucursal);
router.get('/categoriasAll', getCategoriasAll);

// Exportamos el enrutador
export default router;
