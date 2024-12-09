const Pool = require('pg').Pool;

//Servidor viejito
//const DB_HOST =
//  process.env.DB_HOST || 'database-1.cgujpjkz4fsl.us-west-1.rds.amazonaws.com';
//Servidor nuevo 18 Oct 2024
const DB_HOST =
  process.env.DB_HOST || 'database-1.czyiomwau3kc.us-east-1.rds.amazonaws.com';
const DB_USER = process.env.DB_USER || 'cheesepizzauser';
const DB_PASSWORD = process.env.DB_PASSWORD || 'cheesepizza2001';
const DB_NAME = process.env.DB_NAME || 'chppreciosespecprodpromocdb';
const DB_PORT = process.env.DB_PORT || 5432;

//Pool de conexiones a base de datos
const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

const getSucursales = (request, response) => {
  pool.query(
    'SELECT distinct clave, nombre_sucursal as "nombreSucursal",domicilio,hora_inicio as "horaInicio",hora_fin as "horaFin", ' +
      'latitud, longitud, id_Region as "idRegion", venta_activa as "ventaActiva", pk as "stripePublicKey" ' +
      'FROM preesppropro.sucursal as suc, ' +
      'preesppropro.relacion_pizza_sucursal as relpizzasucursal, ' +
      'preesppropro.relacion_producto_sucursal as relprod ' +
      'WHERE suc.id=relpizzasucursal.id_sucursal or suc.id=relprod.id_sucursal order by clave',
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getPizzasBySucursal = (request, response) => {
  const cve_sucursal = request.params.cve_sucursal;
  pool.query(
    'SELECT DISTINCT p.id as"idPizza",ep.id as "idEspecialidad",ep.nombre as "nombreEspecialidad",tp.id as "idTamanioPizza",' +
      'tp.nombre as "tamanioPizza",tp.orden as "ordenTamanioPizza",ep.ingredientes,ep.img_url as "imgUrl",' +
      'ep.orden, rps.precio_x2 as "precioX2",rps.precio_x1 as "precioX1",ep.cantidad_ingredientes as "cantidadIngredientes",' +
      'ep.es_de_un_ingrediente as "esDeUnIngrediente",p.aplica_2x1 as "aplica2x1",p.aplica_bebida_gratis as "aplicaBebidaGratis",p.categoria1,p.categoria2,p.categoria3 ' +
      'FROM preesppropro.especialidad_pizza as ep, preesppropro.tamanio_pizza as tp, preesppropro.pizza as p,' +
      'preesppropro.relacion_pizza_sucursal as rps, preesppropro.sucursal as s ' +
      'WHERE ep.id=p.id_especialidad AND tp.id=p.id_tamanio AND p.id=rps.id_pizza AND s.id=rps.id_sucursal ' +
      'AND s.clave=$1 ORDER BY ep.orden,tp.orden ASC',
    [cve_sucursal],
    (error, results) => {
      if (error) {
        throw error;
      }
      results.rows.forEach((element) => {
        element.precioX2 = Number(element.precioX2);
        element.precioX1 = Number(element.precioX1);
      });
      response.status(200).json(results.rows);
    }
  );
};

const getTamaniosBySucursal = (request, response) => {
  const cve_sucursal = request.params.cve_sucursal;
  const id_especialidad = request.params.id_especialidad;
  pool.query(
    'SELECT id_especialidad_pizza as "idEspecialidadPizza",r.id_tamanio_pizza as "idTamanioPizza",' +
      't.nombre,r.precio, r.categoria1, r.categoria2, r.categoria3 ' +
      'FROM preesppropro.relacion_especialidad_tamanio_precio_sucursal AS r,' +
      'preesppropro.sucursal as s, preesppropro.tamanio_pizza as t ' +
      'WHERE s.id=r.id_sucursal and r.id_tamanio_pizza=t.id ' +
      'AND s.clave=$1 ' +
      'AND id_especialidad_pizza=$2',
    [cve_sucursal, id_especialidad],
    (error, results) => {
      if (error) {
        throw error;
      }
      results.rows.forEach((element) => {
        element.precio = Number(element.precio);
      });
      response.status(200).json(results.rows);
    }
  );
};

const getProductosBySucursal = (request, response) => {
  const cve_sucursal = request.params.cve_sucursal;
  pool.query(
    'SELECT p.id, p.descripcion,p.tamanio,p.usa_salsa as "usaSalsa", p.categoria1, p.categoria2, p.categoria3, ' +
      'rps.precio as "precio", p.aplica_bebida_gratis as "aplicaBebidaGratis" ' +
      'FROM preesppropro.producto as p,' +
      'preesppropro.sucursal as s,' +
      'preesppropro.relacion_producto_sucursal as rps ' +
      'WHERE rps.id_sucursal=s.id and s.clave=$1 ' +
      'and rps.id_producto=p.id ',
    [cve_sucursal],
    (error, results) => {
      if (error) {
        throw error;
      }
      results.rows.forEach((element) => {
        element.precio = Number(element.precio);
      });
      response.status(200).json(results.rows);
    }
  );
};

const getTipoProductosBySucursal = (request, response) => {
  const cve_sucursal = request.params.cve_sucursal;
  pool.query(
    'SELECT distinct pt.id, pt.nombre, pt.descripcion, pt.orden,pt.img_url as "imgUrl" ' +
      'FROM preesppropro.relacion_producto_sucursal as rps, ' +
      'preesppropro.sucursal as s,' +
      'preesppropro.producto as p,' +
      'preesppropro.producto_tipo as pt ' +
      'where rps.id_sucursal=s.id and s.clave=$1 ' +
      'and rps.id_producto=p.id ' +
      'and p.id_tipo_producto=pt.id ' +
      'ORDER BY orden, descripcion',
    [cve_sucursal],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getProductosByTipoProductoBySucursal = (request, response) => {
  const cve_sucursal = request.params.cve_sucursal;
  const id_tipo_producto = request.params.id_tipo_producto;
  pool.query(
    'SELECT p.id, p.descripcion,p.tamanio,p.usa_salsa as "usaSalsa", p.categoria1, p.categoria2, p.categoria3, ' +
      'rps.precio as "precio",p.aplica_bebida_gratis as "aplicaBebidaGratis" ' +
      'FROM preesppropro.producto as p,' +
      'preesppropro.producto_tipo as pt,' +
      'preesppropro.sucursal as s,' +
      'preesppropro.relacion_producto_sucursal as rps ' +
      'WHERE p.id_tipo_producto=pt.id ' +
      'and rps.id_sucursal=s.id and s.clave=$1 ' +
      'and rps.id_producto=p.id ' +
      ' and pt.id=$2',
    [cve_sucursal, id_tipo_producto],
    (error, results) => {
      if (error) {
        throw error;
      }
      results.rows.forEach((element) => {
        element.precio = Number(element.precio);
      });
      response.status(200).json(results.rows);
    }
  );
};

const getSucursalesAll = (request, response) => {
  pool.query(
    'SELECT *  ' + 'FROM preesppropro.sucursal ' + 'order by clave',
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getPromocionesBySucursal = (request, response) => {
  const cve_sucursal = request.params.cve_sucursal;
  pool.query(
    'SELECT DISTINCT cpe.id_promocion as "idPromocion",cpe.nombre, ' +
      'cpe.descripcion, cpe.tipo, cpe.definicion, cpe.precio, cpe.img_url as "imgUrl" ' +
      'FROM preesppropro.promocion_especial as cpe, ' +
      'preesppropro.relacion_promocion_especial_sucursal as re, ' +
      'preesppropro.sucursal as s ' +
      'WHERE cpe.id_promocion=re.id_promocion ' +
      "AND s.id=re.id_sucursal AND s.clave=$1 AND re.activa='S' " +
      "AND cpe.activa='S' " +
      'ORDER BY cpe.nombre',

    [cve_sucursal],
    (error, results) => {
      if (error) {
        throw error;
      }
      results.rows.forEach((element) => {
        element.precio = Number(element.precio);
      });
      response.status(200).json(results.rows);
    }
  );
};

const getSalsasBySucursal = (request, response) => {
  const cve_sucursal = request.params.cve_sucursal;
  pool.query(
    'SELECT salsa.id, salsa.descripcion ' +
      'FROM preesppropro.salsa as salsa,' +
      'preesppropro.relacion_salsa_sucursal as rs,' +
      'preesppropro.sucursal as s ' +
      'WHERE salsa.id=rs.id_salsa AND rs.id_sucursal=s.id ' +
      'AND s.clave=$1 ' +
      'ORDER BY descripcion',
    [cve_sucursal],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getRegionesAll = (request, response) => {
  pool.query(
    'SELECT DISTINCT(l.id), nombre ' +
      'FROM preesppropro.region as l, preesppropro.sucursal as s ' +
      'WHERE l.id=s.id_region ' +
      'ORDER BY nombre ASC',
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getCategorias = (request, response) => {
  pool.query(
    'SELECT codigo, nombre ' +
      'FROM preesppropro.categoria ' +
      'ORDER BY codigo ASC',
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getIngredientesAll = (request, response) => {
  pool.query(
    'SELECT *  ' + 'FROM preesppropro.ingrediente ' + 'order by nombre',
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getOrillasAll = (request, response) => {
  pool.query(
    'SELECT o.id,o.descripcion,tp.id as "idTamanio", tp.nombre as nombre ' +
      'FROM preesppropro.orilla as o,preesppropro.tamanio_pizza as tp ' +
      'WHERE o.id_tamanio=tp.id ORDER BY id ASC ',
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getCategoriasAll = (request, response) => {
  pool.query(
    'SELECT codigo, nombre FROM preesppropro.categoria ORDER BY codigo ASC ',
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getOrillasBySucursal = (request, response) => {
  const cve_sucursal = request.params.cve_sucursal;
  pool.query(
    'SELECT os.id_orilla, o.descripcion,tp.id as "idTamanio",tp.nombre as nombre, os.precio as "precio" FROM ' +
      'preesppropro.relacion_orilla_sucursal as os,preesppropro.sucursal as s,' +
      'preesppropro.orilla as o,preesppropro.tamanio_pizza as tp ' +
      'WHERE os.id_orilla=o.id and o.id_tamanio=tp.id and os.id_sucursal=s.id ' +
      'and s.clave=$1 ORDER BY o.descripcion,nombre ASC',

    [cve_sucursal],
    (error, results) => {
      if (error) {
        throw error;
      }
      results.rows.forEach((element) => {
        element.precio = Number(element.precio);
      });
      response.status(200).json(results.rows);
    }
  );
};

module.exports = {
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
  //updateEstatusPedidoBody,
};
