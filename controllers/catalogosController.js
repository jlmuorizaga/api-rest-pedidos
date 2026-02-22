// controllers/catalogosController.js

// Importamos el pool de conexión CENTRALIZADO
import pool from '../db/database.js';

// --- FUNCIONES DEL CONTROLADOR ---

// Cada función ahora es 'export const' y 'async'
export const getSucursales = async (req, res) => {
  const query = `
    SELECT distinct clave, nombre_sucursal as "nombreSucursal",domicilio,hora_inicio as "horaInicio",hora_fin as "horaFin",
    latitud, longitud, id_Region as "idRegion", venta_activa as "ventaActiva", pk as "stripePublicKey"
    FROM preesppropro.sucursal as suc,
    preesppropro.relacion_pizza_sucursal as relpizzasucursal,
    preesppropro.relacion_producto_sucursal as relprod
    WHERE (suc.id=relpizzasucursal.id_sucursal OR suc.id=relprod.id_sucursal) 
    ORDER BY clave
  `;
  try {
    const results = await pool.query(query);
    res.status(200).json(results.rows);
  } catch (error) {
    console.error('Error en getSucursales:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getPizzasBySucursal = async (req, res) => {
  const { cve_sucursal } = req.params;
  const query = `
    SELECT DISTINCT p.id as"idPizza",ep.id as "idEspecialidad",ep.nombre as "nombreEspecialidad",tp.id as "idTamanioPizza",
    tp.nombre as "tamanioPizza",tp.orden as "ordenTamanioPizza",ep.ingredientes,ep.img_url as "imgUrl",
    ep.orden, rps.precio_x2 as "precioX2",rps.precio_x1 as "precioX1",ep.cantidad_ingredientes as "cantidadIngredientes",
    ep.es_de_un_ingrediente as "esDeUnIngrediente",p.aplica_2x1 as "aplica2x1",p.aplica_bebida_gratis as "aplicaBebidaGratis",p.categoria1,p.categoria2,p.categoria3,p.aplica_orilla_queso as "aplicaOrillaQueso"
    FROM preesppropro.especialidad_pizza as ep, preesppropro.tamanio_pizza as tp, preesppropro.pizza as p,
    preesppropro.relacion_pizza_sucursal as rps, preesppropro.sucursal as s
    WHERE ep.id=p.id_especialidad AND tp.id=p.id_tamanio AND p.id=rps.id_pizza AND s.id=rps.id_sucursal
    AND s.clave=$1 ORDER BY ep.orden,tp.orden ASC
  `;
  try {
    const results = await pool.query(query, [cve_sucursal]);
    // La lógica de conversión de números se mantiene
    const rows = results.rows.map((element) => ({
      ...element,
      precioX2: Number(element.precioX2),
      precioX1: Number(element.precioX1),
    }));
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error en getPizzasBySucursal:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getTamaniosBySucursal = async (req, res) => {
  const { cve_sucursal, id_especialidad } = req.params;
  const query = `
    SELECT id_especialidad_pizza as "idEspecialidadPizza",r.id_tamanio_pizza as "idTamanioPizza",
    t.nombre,r.precio, r.categoria1, r.categoria2, r.categoria3
    FROM preesppropro.relacion_especialidad_tamanio_precio_sucursal AS r,
    preesppropro.sucursal as s, preesppropro.tamanio_pizza as t
    WHERE s.id=r.id_sucursal and r.id_tamanio_pizza=t.id
    AND s.clave=$1
    AND id_especialidad_pizza=$2
  `;
  try {
    const results = await pool.query(query, [cve_sucursal, id_especialidad]);
    const rows = results.rows.map((element) => ({
      ...element,
      precio: Number(element.precio),
    }));
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error en getTamaniosBySucursal:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getProductosBySucursal = async (req, res) => {
  const { cve_sucursal } = req.params;
  const query = `
    SELECT p.id, p.descripcion,p.tamanio,p.usa_salsa as "usaSalsa", p.categoria1, p.categoria2, p.categoria3,
    rps.precio as "precio", p.aplica_bebida_gratis as "aplicaBebidaGratis"
    FROM preesppropro.producto as p,
    preesppropro.sucursal as s,
    preesppropro.relacion_producto_sucursal as rps
    WHERE rps.id_sucursal=s.id and s.clave=$1
    and rps.id_producto=p.id
  `;
  try {
    const results = await pool.query(query, [cve_sucursal]);
    const rows = results.rows.map((element) => ({
      ...element,
      precio: Number(element.precio),
    }));
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error en getProductosBySucursal:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getTipoProductosBySucursal = async (req, res) => {
  const { cve_sucursal } = req.params;
  const query = `
    SELECT distinct pt.id, pt.nombre, pt.descripcion, pt.orden,pt.img_url as "imgUrl"
    FROM preesppropro.relacion_producto_sucursal as rps,
    preesppropro.sucursal as s,
    preesppropro.producto as p,
    preesppropro.producto_tipo as pt
    where rps.id_sucursal=s.id and s.clave=$1
    and rps.id_producto=p.id
    and p.id_tipo_producto=pt.id
    ORDER BY orden, descripcion
  `;
  try {
    const results = await pool.query(query, [cve_sucursal]);
    res.status(200).json(results.rows);
  } catch (error) {
    console.error('Error en getTipoProductosBySucursal:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getProductosByTipoProductoBySucursal = async (req, res) => {
  const { cve_sucursal, id_tipo_producto } = req.params;
  const query = `
    SELECT p.id, p.descripcion,p.tamanio,p.usa_salsa as "usaSalsa", p.categoria1, p.categoria2, p.categoria3,
    rps.precio as "precio",p.aplica_bebida_gratis as "aplicaBebidaGratis"
    FROM preesppropro.producto as p,
    preesppropro.producto_tipo as pt,
    preesppropro.sucursal as s,
    preesppropro.relacion_producto_sucursal as rps
    WHERE p.id_tipo_producto=pt.id
    and rps.id_sucursal=s.id and s.clave=$1
    and rps.id_producto=p.id
    and pt.id=$2
  `;
  try {
    const results = await pool.query(query, [cve_sucursal, id_tipo_producto]);
    const rows = results.rows.map((element) => ({
      ...element,
      precio: Number(element.precio),
    }));
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error en getProductosByTipoProductoBySucursal:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getSucursalesAll = async (req, res) => {
  try {
    const results = await pool.query(
      'SELECT * FROM preesppropro.sucursal ORDER BY clave'
    );
    res.status(200).json(results.rows);
  } catch (error) {
    console.error('Error en getSucursalesAll:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getPromocionesBySucursal = async (req, res) => {
  const { cve_sucursal } = req.params;
  const query = `
    SELECT DISTINCT cpe.id_promocion as "idPromocion",cpe.nombre,
    cpe.descripcion, cpe.tipo, cpe.definicion, cpe.precio, cpe.img_url as "imgUrl"
    FROM preesppropro.promocion_especial as cpe,
    preesppropro.relacion_promocion_especial_sucursal as re,
    preesppropro.sucursal as s
    WHERE cpe.id_promocion=re.id_promocion
    AND s.id=re.id_sucursal AND s.clave=$1 AND re.activa='S'
    AND cpe.activa='S'
    ORDER BY cpe.nombre
  `;
  try {
    const results = await pool.query(query, [cve_sucursal]);
    const rows = results.rows.map((element) => ({
      ...element,
      precio: Number(element.precio),
    }));
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error en getPromocionesBySucursal:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getSalsasBySucursal = async (req, res) => {
  const { cve_sucursal } = req.params;
  const query = `
    SELECT salsa.id, salsa.descripcion
    FROM preesppropro.salsa as salsa,
    preesppropro.relacion_salsa_sucursal as rs,
    preesppropro.sucursal as s
    WHERE salsa.id=rs.id_salsa AND rs.id_sucursal=s.id
    AND s.clave=$1
    ORDER BY descripcion
  `;
  try {
    const results = await pool.query(query, [cve_sucursal]);
    res.status(200).json(results.rows);
  } catch (error) {
    console.error('Error en getSalsasBySucursal:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getRegionesAll = async (req, res) => {
  const query = `
    SELECT DISTINCT(l.id), nombre, l.latitud, l.longitud
    FROM preesppropro.region as l, preesppropro.sucursal as s
    WHERE l.id=s.id_region
    ORDER BY nombre ASC
  `;
  try {
    const results = await pool.query(query);
    res.status(200).json(results.rows);
  } catch (error) {
    console.error('Error en getRegionesAll:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getCategorias = async (req, res) => {
  try {
    const results = await pool.query(
      'SELECT codigo, nombre FROM preesppropro.categoria ORDER BY codigo ASC'
    );
    res.status(200).json(results.rows);
  } catch (error) {
    console.error('Error en getCategorias:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getIngredientesAll = async (req, res) => {
  try {
    const results = await pool.query(
      'SELECT * FROM preesppropro.ingrediente ORDER BY nombre'
    );
    res.status(200).json(results.rows);
  } catch (error) {
    console.error('Error en getIngredientesAll:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getOrillasAll = async (req, res) => {
  const query = `
    SELECT o.id,o.descripcion,tp.id as "idTamanio", tp.nombre as nombre
    FROM preesppropro.orilla as o,preesppropro.tamanio_pizza as tp
    WHERE o.id_tamanio=tp.id ORDER BY id ASC
  `;
  try {
    const results = await pool.query(query);
    res.status(200).json(results.rows);
  } catch (error) {
    console.error('Error en getOrillasAll:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getCategoriasAll = async (req, res) => {
  try {
    const results = await pool.query(
      'SELECT codigo, nombre FROM preesppropro.categoria ORDER BY codigo ASC'
    );
    res.status(200).json(results.rows);
  } catch (error) {
    console.error('Error en getCategoriasAll:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getOrillasBySucursal = async (req, res) => {
  const { cve_sucursal } = req.params;
  const query = `
    SELECT os.id_orilla, o.descripcion,tp.id as "idTamanio",tp.nombre as nombre, os.precio as "precio" 
    FROM preesppropro.relacion_orilla_sucursal as os,preesppropro.sucursal as s,
    preesppropro.orilla as o,preesppropro.tamanio_pizza as tp
    WHERE os.id_orilla=o.id and o.id_tamanio=tp.id and os.id_sucursal=s.id
    and s.clave=$1 ORDER BY o.descripcion,nombre ASC
  `;
  try {
    const results = await pool.query(query, [cve_sucursal]);
    const rows = results.rows.map((element) => ({
      ...element,
      precio: Number(element.precio),
    }));
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error en getOrillasBySucursal:', error);
    res.status(500).json({ error: error.message });
  }
};
