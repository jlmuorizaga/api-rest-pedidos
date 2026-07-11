// routes/catalogos.js
import express from 'express';

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
router.get('/regionesAdmin', getRegionesAdmin);
router.get('/categorias', getCategorias);
router.get('/ingredientesAll', getIngredientesAll);
router.get('/orillasAll', getOrillasAll);
router.get('/orillas/:cve_sucursal', getOrillasBySucursal);
router.get('/categoriasAll', getCategoriasAll);

// Ruta para actualizar polígono de cobertura
router.put('/sucursales/:clave/poligono', updateSucursalPoligono);

// Ruta para actualizar polígono y coordenadas de región
router.put('/regiones/:id/geometria', updateRegionGeometria);

// Exportamos el enrutador
export default router;
