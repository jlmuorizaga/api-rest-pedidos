const Pool = require('pg').Pool;

//Datos de conexión a base de datos en AWS
//Servidor viejito
//const DB_HOST =
//process.env.DB_HOST || "database-1.cgujpjkz4fsl.us-west-1.rds.amazonaws.com";
//Servidor nuevo 18 Oct 2024
const DB_HOST =
  process.env.DB_HOST || 'database-1.czyiomwau3kc.us-east-1.rds.amazonaws.com';
const DB_USER = process.env.DB_USER || 'cheesepizzauser';
const DB_PASSWORD = process.env.DB_PASSWORD || 'cheesepizza2001';
const DB_NAME = process.env.DB_NAME || 'cheesepizzapedidosmovilesdb';
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

const getClienteAcceso = (request, response) => {
  const correo = request.params.correo;
  const contrasenia = request.params.contrasenia;
  pool.query(
    'SELECT count(*) as acceso ' +
      'FROM pedidos.cliente ' +
      'WHERE activo = $1 AND correo_electronico = $2 AND contrasenia = $3',
    ['S', correo, contrasenia],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows[0]);
    }
  );
};

const getClienteExisteCorreo = (request, response) => {
  const correo = request.params.correo;
  pool.query(
    'SELECT count(*) as existe ' +
      'FROM pedidos.cliente ' +
      'WHERE activo = $1 AND correo_electronico = $2',
    ['S', correo],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows[0]);
    }
  );
};

const getDatosCliente = (request, response) => {
  const correo = request.params.correo;
  pool.query(
    'SELECT id_cliente as "idCliente", correo_electronico as "correoElectronico", ' +
      'nombre, telefono, fecha_registro as "fechaRegistro", activo ' +
      'FROM pedidos.cliente ' +
      'WHERE correo_electronico = $1',
    [correo],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows[0]) {
        response.status(200).json(results.rows[0]);
      } else {
        textoError = '{"error": "No se encontró el cliente"}';
        response.status(404).json(JSON.parse(textoError));
      }
    }
  );
};

const getContraseniaCliente = (request, response) => {
  const correo = request.params.correo;
  pool.query(
    'SELECT correo_electronico as "correoElectronico", contrasenia as "contraSenia", activo ' +
      'FROM pedidos.cliente ' +
      "WHERE correo_electronico = $1 and activo='S'",
    [correo],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows[0]) {
        response.status(200).json(results.rows[0]);
      } else {
        textoError = '{"error": "No se encontró el cliente"}';
        response.status(404).json(JSON.parse(textoError));
      }
    }
  );
};

const getDomiciliosCliente = (request, response) => {
  const idCliente = request.params.idCliente;
  pool.query(
    'SELECT id_domicilio_cliente as "idDomicilioCliente", id_cliente as "idCliente", ' +
      'descripcion, punto, id_lugar as "idLugar", activo ' +
      'FROM pedidos.domicilio_cliente WHERE id_cliente = $1 ORDER BY descripcion',
    [idCliente],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getRegiones = (request, response) => {
  pool.query(
    'SELECT id_region as "idRegion", nombre, poligono ' + 'FROM pedidos.region',
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const insertaCliente = (req, res) => {
  const {
    idCliente,
    correoElectronico,
    contrasenia,
    nombre,
    telefono,
    fechaRegistro,
    activo,
  } = req.body;
  pool.query(
    'INSERT INTO pedidos.cliente' +
      '(id_cliente, correo_electronico, contrasenia, nombre, telefono, fecha_registro, activo) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [
      idCliente,
      correoElectronico,
      contrasenia,
      nombre,
      telefono,
      fechaRegistro,
      activo,
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      textoRespuesta =
        '{"respuesta": "Se insertó cliente: ' +
        results.rows[0].id_cliente +
        '"}';
      res.status(201).json(JSON.parse(textoRespuesta));
    }
  );
};

const actualizaCliente = (req, res) => {
  const {
    idCliente,
    correoElectronico,
    contrasenia,
    nombre,
    telefono,
    fechaRegistro,
    activo,
  } = req.body;
  pool.query(
    'UPDATE pedidos.cliente ' +
      'SET correo_electronico=$2, contrasenia=$3, nombre=$4, telefono=$5, fecha_registro=$6, activo=$7 ' +
      'WHERE id_cliente=$1 RETURNING *',
    [
      idCliente,
      correoElectronico,
      contrasenia,
      nombre,
      telefono,
      fechaRegistro,
      activo,
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      textoRespuesta =
        '{"respuesta": "Se actualizó cliente: ' +
        results.rows[0].id_cliente +
        '"}';
      res.status(201).json(JSON.parse(textoRespuesta));
    }
  );
};

const insertaDomicilioCliente = (req, res) => {
  const { idDomicilioCliente, idCliente, descripcion, punto, idLugar, activo } =
    req.body;
  pool.query(
    'INSERT INTO pedidos.domicilio_cliente' +
      '(id_domicilio_cliente, id_cliente, descripcion, punto, id_lugar, activo) ' +
      'VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [idDomicilioCliente, idCliente, descripcion, punto, idLugar, activo],
    (error, results) => {
      if (error) {
        throw error;
      }
      textoRespuesta =
        '{"respuesta": "Se insertó domicilio: ' +
        results.rows[0].id_domicilio_cliente +
        '"}';
      res.status(201).json(JSON.parse(textoRespuesta));
    }
  );
};

const actualizaDomicilioCliente = (req, res) => {
  const { idDomicilioCliente, idCliente, descripcion, punto, idLugar, activo } =
    req.body;
  pool.query(
    'UPDATE pedidos.domicilio_cliente ' +
      'SET id_cliente=$2, descripcion=$3, punto=$4, id_lugar=$5, activo=$6 ' +
      'WHERE id_domicilio_cliente=$1 ' +
      'RETURNING *',
    [idDomicilioCliente, idCliente, descripcion, punto, idLugar, activo],
    (error, results) => {
      if (error) {
        throw error;
      }
      textoRespuesta =
        '{"respuesta": "Se actualizó domicilio: ' +
        results.rows[0].id_domicilio_cliente +
        '"}';
      res.status(201).json(JSON.parse(textoRespuesta));
    }
  );
};

const eliminaDomicilioCliente = (req, res) => {
  const idDomicilioCliente = req.params.idDomicilioCliente;
  pool.query(
    'DELETE FROM pedidos.domicilio_cliente ' + 'WHERE id_domicilio_cliente=$1 ',
    [idDomicilioCliente],
    (error, results) => {
      if (error) {
        throw error;
      }
      textoRespuesta =
        '{"respuesta": "Se eliminó ' +
        results.rowCount +
        ' domicilio: ' +
        idDomicilioCliente +
        '"}';
      res.status(201).json(JSON.parse(textoRespuesta));
    }
  );
};

const insertaPedido = (req, res) => {
  const {
    idPedido,
    idCliente,
    datosCliente,
    idDomicilioCliente,
    datosDomicilioCliente,
    claveSucursal,
    datosSucursal,
    fechaHora,
    estatus,
    modalidadEntrega,
    montoTotal,
    detallePedido,
    instruccionesEspeciales,
    promocionesAplicadas,
    tipoPago,
    cantidadProductos,
    resumenPedido,
    urlReciboPago,
    montoSubtotal,
    montoDescuento,
  } = req.body;
  pool.query(
    'INSERT INTO pedidos.pedido' +
      '(id_pedido, id_cliente, datos_cliente, id_domicilio_cliente, datos_domicilio_cliente, ' +
      'clave_sucursal, datos_sucursal, fecha_hora, estatus, modalidad_entrega, monto_total, ' +
      'detalle_pedido, instrucciones_especiales, promociones_aplicadas, tipo_pago, ' +
      'cantidad_productos, resumen_pedido, url_recibo_pago, monto_subtotal, monto_descuento) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) ' +
      'RETURNING *',
    [
      idPedido,
      idCliente,
      datosCliente,
      idDomicilioCliente,
      datosDomicilioCliente,
      claveSucursal,
      datosSucursal,
      fechaHora,
      estatus,
      modalidadEntrega,
      montoTotal,
      detallePedido,
      instruccionesEspeciales,
      promocionesAplicadas,
      tipoPago,
      cantidadProductos,
      resumenPedido,
      urlReciboPago,
      montoSubtotal,
      montoDescuento,
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      textoRespuesta =
        '{"respuesta": "Se insertó pedido: ' +
        results.rows[0].id_pedido +
        '",' +
        '"numeroPedido":' +
        results.rows[0].numero_pedido +
        '}';
      res.status(201).json(JSON.parse(textoRespuesta));
    }
  );
};

const getPedidosByCliente = (request, response) => {
  //Retorna todos los pedidos del cliente que no han sido atendidos
  const idCliente = request.params.idCliente;
  const estatusPedidoAtendido = 'AP';
  pool.query(
    'SELECT id_pedido as "idPedido", numero_pedido as "numeroPedido", ' +
      'clave_sucursal as "claveSucursal", datos_sucursal as "datosSucursal", ' +
      'fecha_hora as "fechaHora", estatus, modalidad_entrega as "modalidadEntrega", ' +
      'monto_total as "montoTotal", cantidad_productos as "cantidadProductos", ' +
      'resumen_pedido as "resumenPedido", ' +
      'url_recibo_pago as "urlReciboPago" ' +
      'FROM pedidos.pedido ' +
      'WHERE id_cliente = $1 ' +
      'AND estatus <> $2',
    [idCliente, estatusPedidoAtendido],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};
// LGDD
const getTotalPedidosHistoricosByCliente = (request, response) => {
  //    //Retorna todos los pedidos del cliente que ya han sido atendidos
  const idCliente = request.params.idCliente;
  const estatusPedidoAtendido = 'AP';
  pool.query(
    'SELECT count(*) as totalPedidos ' +
      'FROM pedidos.pedido ' +
      'WHERE id_cliente = $1 ' +
      'AND estatus = $2 ',
    [idCliente, estatusPedidoAtendido],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows[0]) {
        response.status(200).json(results.rows[0]);
      } else {
        textoError = '{"error": "No se encontró el cliente"}';
        response.status(404).json(JSON.parse(textoError));
      }
    }
  );
};

const getPedidosHistoricosByCliente = (request, response) => {
  //Retorna todos los pedidos del cliente que ya han sido atendidos
  console.log('');
  const idCliente = request.params.idCliente;
  const registrosXPagina = request.params.registrosXPagina;
  const iniciaEn = request.params.iniciaEn;
  const estatusPedidoAtendido = 'AP';
  pool.query(
    'SELECT id_pedido as "idPedido", numero_pedido as "numeroPedido", id_cliente as "idCliente", ' +
      'datos_cliente as "datosCliente", id_domicilio_cliente as "idDomicilioCliente", ' +
      'datos_domicilio_cliente as "datosDomicilioCliente", clave_sucursal as "claveSucursal", ' +
      'datos_sucursal as "datosSucursal", fecha_hora as "fechaHora", estatus, ' +
      'modalidad_entrega as "modalidadEntrega", monto_total as "montoTotal", ' +
      'detalle_pedido as "detallePedido", instrucciones_especiales as "instruccionesEspeciales", ' +
      'promociones_aplicadas as "promocionesAplicadas", tipo_pago as "tipoPago", ' +
      'cantidad_productos as "cantidadProductos", resumen_pedido as "resumenPedido" ' +
      'FROM pedidos.pedido ' +
      'WHERE id_cliente = $1 ' +
      'AND estatus = $2 ' +
      'ORDER BY numero_pedido ' +
      'limit $3 offset $4',
    [idCliente, estatusPedidoAtendido, registrosXPagina, iniciaEn],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};
// LGDD

const getPedidosBySucursal = (request, response) => {
  //Retorna todos los pedidos de la sucursal que siguen en estatus de Pedido en la Nube
  const claveSucursal = request.params.claveSucursal;
  const estatusPedidoNube = 'NP';
  pool.query(
    'SELECT id_pedido as "idPedido", numero_pedido as "numeroPedido", id_cliente as "idCliente", ' +
      'datos_cliente as "datosCliente", id_domicilio_cliente as "idDomicilioCliente", ' +
      'datos_domicilio_cliente as "datosDomicilioCliente", clave_sucursal as "claveSucursal", ' +
      'datos_sucursal as "datosSucursal", fecha_hora as "fechaHora", estatus, ' +
      'modalidad_entrega as "modalidadEntrega", ' +
      'monto_total as "montoTotal", ' +
      'detalle_pedido as "detallePedido", instrucciones_especiales as "instruccionesEspeciales", ' +
      'promociones_aplicadas as "promocionesAplicadas", tipo_pago as "tipoPago", ' +
      'cantidad_productos as "cantidadProductos", resumen_pedido as "resumenPedido", ' +
      'url_recibo_pago as "urlReciboPago" ' +
      'FROM pedidos.pedido ' +
      'WHERE clave_sucursal = $1 ' +
      'AND estatus = $2 ' +
      'ORDER BY fecha_hora',
    [claveSucursal, estatusPedidoNube],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getPedidoById = (request, response) => {
  const idPedido = request.params.idPedido;
  pool.query(
    'SELECT id_pedido as "idPedido", numero_pedido as "numeroPedido", id_cliente as "idCliente", ' +
      'datos_cliente as "datosCliente", id_domicilio_cliente as "idDomicilioCliente", ' +
      'datos_domicilio_cliente as "datosDomicilioCliente", clave_sucursal as "claveSucursal", ' +
      'datos_sucursal as "datosSucursal", fecha_hora as "fechaHora", estatus, ' +
      'modalidad_entrega as "modalidadEntrega", ' +
      'monto_subtotal as "montoSubtotal", monto_descuento as "montoDescuento", monto_total as "montoTotal", ' +
      'detalle_pedido as "detallePedido", instrucciones_especiales as "instruccionesEspeciales", ' +
      'promociones_aplicadas as "promocionesAplicadas", tipo_pago as "tipoPago", ' +
      'cantidad_productos as "cantidadProductos", resumen_pedido as "resumenPedido", ' +
      'url_recibo_pago as "urlReciboPago" ' +
      'FROM pedidos.pedido ' +
      'WHERE id_pedido = $1',
    [idPedido],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows[0]) {
        response.status(200).json(results.rows[0]);
      } else {
        textoError = '{"error": "No se encontró el pedido"}';
        response.status(404).json(JSON.parse(textoError));
      }
    }
  );
};

const updateEstatusPedido = (req, resp) => {
 // const { idPedido, estatus} = req.body;
  const estatus = req.params.estatus;
  const idPedido = req.params.idPedido;
  console.log('estatus=',estatus);
  console.log('idPedido=',idPedido);
  pool.query(
    'UPDATE pedidos.pedido ' +
      'SET estatus=$1 ' +
      'WHERE id_pedido=$2 RETURNING *',
    [estatus,idPedido],
    (error, results) => {
      if (error) {
        throw error;
      }
      textoRespuesta =
        '{"respuesta": "Se actualizó pedido en updateEstatusPedido ' +
        results.rows[0].id_pedido +
        '"}';
      resp.status(201).json(JSON.parse(textoRespuesta));
    }
  );
};

const updateEstatusPedidoBody = (request, response) => {
  const estatus = request.params.estatus;
  const idPedido = request.params.idPedido;
  //const { idPedido, estatus} = req.body;
  pool.query(
    'UPDATE pedidos.pedido ' +
      'SET estatus=$2 ' +
      'WHERE id_pedido=$1 RETURNING *',
    [idPedido, estatus],
    (error, results) => {
      if (error) {
        throw error;
      }
      textoRespuesta =
        '{"respuesta": "Se actualizó pedido en updateEstatusPedidoBody "}';
      response.status(201).json(JSON.parse(textoRespuesta));
    }
  );
};

const getAllPedidos = (request, response) => {
  //Retorna todos los pedidos de la sucursal que siguen en estatus de Pedido en la Nube
  //const claveSucursal = request.params.claveSucursal;
  const estatusPedidoNube = 'NP';
  pool.query(
    //SELECT id_pedido, numero_pedido, id_cliente, datos_cliente, id_domicilio_cliente,
    //datos_domicilio_cliente, clave_sucursal, datos_sucursal, fecha_hora, estatus,
    //modalidad_entrega, monto_total, detalle_pedido, instrucciones_especiales,
    //promociones_aplicadas, tipo_pago, cantidad_productos, resumen_pedido
    'SELECT id_pedido as "idPedido", numero_pedido as "numeroPedido", datos_cliente as "datosCliente", ' +
      'datos_domicilio_cliente as "datosDomicilioCliente", clave_sucursal as "claveSucursal", ' +
      'fecha_hora as "fechaHora", estatus, modalidad_entrega as "modalidadEntrega", ' +
      'monto_total as "montoTotal", detalle_pedido as "detallePedido", tipo_pago as "tipoPago" ' +
      'FROM pedidos.pedido ' +
      'WHERE estatus = $1 ' +
      'ORDER BY clave_sucursal, numero_pedido',
    [estatusPedidoNube],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

module.exports = {
  getClienteAcceso,
  getClienteExisteCorreo,
  getDatosCliente,
  getContraseniaCliente,
  getDomiciliosCliente,
  getRegiones,
  insertaCliente,
  actualizaCliente,
  insertaDomicilioCliente,
  actualizaDomicilioCliente,
  eliminaDomicilioCliente,
  insertaPedido,
  getPedidosByCliente,
  // LGDD
  getTotalPedidosHistoricosByCliente,
  getPedidosHistoricosByCliente,
  // LGDD
  getPedidoById,
  updateEstatusPedido,
  getPedidosBySucursal,
  getAllPedidos,
  updateEstatusPedidoBody
};
