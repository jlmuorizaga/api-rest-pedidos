// routes/catalogos.js
import express from 'express';
import { verificarToken } from '../middlewares/authMiddleware.js';

// Importamos TODAS las funciones del controlador
import {
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
  getRegionesAdmin,
  getCategorias,
  getIngredientesAll,
  getOrillasAll,
  getOrillasBySucursal,
  getCategoriasAll,
  updateSucursalPoligono,
  updateRegionGeometria,
} from '../controllers/catalogosController.js';

const router = express.Router();

// Endpoints para catálogos públicos (sin autenticar, usados por la app móvil de clientes)
router.get('/sucursales', getSucursales);
router.get('/pizzas/:cve_sucursal', getPizzasBySucursal);
router.get('/tamanios/:cve_sucursal/:id_especialidad', getTamaniosBySucursal);
router.get('/productos/:cve_sucursal', getProductosBySucursal);
router.get('/tipoproductos/:cve_sucursal', getTipoProductosBySucursal);
router.get(
  '/productos/:cve_sucursal/:id_tipo_producto',
  getProductosByTipoProductoBySucursal
);
router.get('/promociones/:cve_sucursal', getPromocionesBySucursal);
router.get('/salsas/:cve_sucursal', getSalsasBySucursal);
router.get('/regionesAll', getRegionesAll);
router.get('/categorias', getCategorias);
router.get('/ingredientesAll', getIngredientesAll);
router.get('/orillasAll', getOrillasAll);
router.get('/orillas/:cve_sucursal', getOrillasBySucursal);
router.get('/categoriasAll', getCategoriasAll);

// Endpoints administrativos protegidos con JWT (usados por geocheesepizza)
router.get('/sucursalesAll', verificarToken, getSucursalesAll);
router.get('/regionesAdmin', verificarToken, getRegionesAdmin);
router.put('/sucursales/:clave/poligono', verificarToken, updateSucursalPoligono);
router.put('/regiones/:id/geometria', verificarToken, updateRegionGeometria);

// Exportamos el enrutador
export default router;
