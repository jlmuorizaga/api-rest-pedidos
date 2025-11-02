import pool from '../db/database.js';

// Convertido a async/await
/*
export const updatePedidoPago = async (req, res) => {
  const { numeroPedido, estatus, urlReciboPago } = req.body;
  const { idPedido } = req.params;
  const query = `
    UPDATE pedidos.pedido
    SET numero_pedido=$1, estatus=$2, url_recibo_pago=$3
    WHERE id_pedido=$4 RETURNING *
  `;
  try {
    const results = await pool.query(query, [
      numeroPedido,
      estatus,
      urlReciboPago,
      idPedido,
    ]);
    if (results.rows.length > 0) {
      res.status(201).json({
        respuesta: `Se actualizó pedido pago ${results.rows[0].id_pedido}`,
      });
    } else {
      res.status(404).json({ respuesta: `No existe el pedido ${idPedido}` });
    }
  } catch (error) {
    console.error('Error en updatePedidoPago:', error);
    res.status(500).json({ error: error.message });
  }
};
*/

// Convertido a async/await
export const getPedidosByCliente = async (req, res) => {
  const { idCliente } = req.params;
  const estatusPedidoAtendido = 'AP';
  const estatusPedidoPendientePago = 'PP';
  const query = `
    SELECT id_pedido as "idPedido", numero_pedido as "numeroPedido",
    clave_sucursal as "claveSucursal", datos_sucursal as "datosSucursal",
    fecha_hora as "fechaHora", estatus, modalidad_entrega as "modalidadEntrega",
    monto_total as "montoTotal", cantidad_productos as "cantidadProductos",
    resumen_pedido as "resumenPedido",
    url_recibo_pago as "urlReciboPago"
    FROM pedidos.pedido
    WHERE id_cliente = $1
    AND estatus <> $2 AND estatus <> $3
    ORDER BY numero_pedido
  `;
  try {
    const results = await pool.query(query, [
      idCliente,
      estatusPedidoAtendido,
      estatusPedidoPendientePago,
    ]);
    const rows = results.rows.map((element) => ({
      ...element,
      montoTotal: Number(element.montoTotal),
    }));
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error en getPedidosByCliente:', error);
    res.status(500).json({ error: error.message });
  }
};

// Convertido a async/await
export const getTotalPedidosHistoricosByCliente = async (req, res) => {
  const { idCliente } = req.params;
  const estatusPedidoAtendido = 'AP';
  const query = `
    SELECT count(*) as totalPedidos
    FROM pedidos.pedido
    WHERE id_cliente = $1
    AND estatus = $2
  `;
  try {
    const results = await pool.query(query, [idCliente, estatusPedidoAtendido]);
    if (results.rows.length > 0) {
      res.status(200).json(results.rows[0]);
    } else {
      res.status(404).json({ error: 'No se encontró el cliente' });
    }
  } catch (error) {
    console.error('Error en getTotalPedidosHistoricosByCliente:', error);
    res.status(500).json({ error: error.message });
  }
};

// Convertido a async/await
export const getPedidosHistoricosByCliente = async (req, res) => {
  const { idCliente, registrosXPagina, iniciaEn } = req.params;
  const estatusPedidoAtendido = 'AP';
  const query = `
    SELECT id_pedido as "idPedido", numero_pedido as "numeroPedido", id_cliente as "idCliente",
    datos_cliente as "datosCliente", id_domicilio_cliente as "idDomicilioCliente",
    datos_domicilio_cliente as "datosDomicilioCliente", clave_sucursal as "claveSucursal",
    datos_sucursal as "datosSucursal", fecha_hora as "fechaHora", estatus,
    modalidad_entrega as "modalidadEntrega", monto_total as "montoTotal",
    detalle_pedido as "detallePedido", instrucciones_especiales as "instruccionesEspeciales",
    tipo_pago as "tipoPago",
    cantidad_productos as "cantidadProductos", resumen_pedido as "resumenPedido"
    FROM pedidos.pedido
    WHERE id_cliente = $1
    AND estatus = $2
    ORDER BY numero_pedido
    LIMIT $3 OFFSET $4
  `;
  try {
    const results = await pool.query(query, [
      idCliente,
      estatusPedidoAtendido,
      registrosXPagina,
      iniciaEn,
    ]);
    const rows = results.rows.map((element) => ({
      ...element,
      montoTotal: Number(element.montoTotal),
    }));
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error en getPedidosHistoricosByCliente:', error);
    res.status(500).json({ error: error.message });
  }
};

// Convertido a async/await
export const getPedidosBySucursal = async (req, res) => {
  const { claveSucursal } = req.params;
  const estatusPedidoNube = 'NP';
  const query = `
    SELECT id_pedido as "idPedido", numero_pedido as "numeroPedido", id_cliente as "idCliente",
    datos_cliente as "datosCliente", id_domicilio_cliente as "idDomicilioCliente",
    datos_domicilio_cliente as "datosDomicilioCliente", clave_sucursal as "claveSucursal",
    datos_sucursal as "datosSucursal", fecha_hora as "fechaHora", estatus,
    modalidad_entrega as "modalidadEntrega",
    monto_total as "montoTotal",
    detalle_pedido as "detallePedido", instrucciones_especiales as "instruccionesEspeciales",
    tipo_pago as "tipoPago",
    cantidad_productos as "cantidadProductos", resumen_pedido as "resumenPedido",
    url_recibo_pago as "urlReciboPago"
    FROM pedidos.pedido
    WHERE clave_sucursal = $1
    AND estatus = $2
    ORDER BY fecha_hora
  `;
  try {
    const results = await pool.query(query, [claveSucursal, estatusPedidoNube]);
    const rows = results.rows.map((element) => ({
      ...element,
      montoTotal: Number(element.montoTotal),
    }));
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error en getPedidosBySucursal:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getPedidosEstatusBySucursal = async (req, res) => {
  const { claveSucursal, estatus } = req.params;
  if (
    estatus != 'NP' &&
    estatus != 'RP' &&
    estatus != 'CP' &&
    estatus != 'EP' &&
    estatus != 'LP'
  ) {
    estatus = '00';
  }

  const query = `
    SELECT id_pedido as "idPedido", numero_pedido as "numeroPedido", id_cliente as "idCliente",
    datos_cliente as "datosCliente", id_domicilio_cliente as "idDomicilioCliente",
    datos_domicilio_cliente as "datosDomicilioCliente", clave_sucursal as "claveSucursal",
    datos_sucursal as "datosSucursal", fecha_hora as "fechaHora", estatus,
    modalidad_entrega as "modalidadEntrega",
    monto_total as "montoTotal",
    detalle_pedido as "detallePedido", instrucciones_especiales as "instruccionesEspeciales",
    tipo_pago as "tipoPago",
    cantidad_productos as "cantidadProductos", resumen_pedido as "resumenPedido",
    url_recibo_pago as "urlReciboPago"
    FROM pedidos.pedido
    WHERE clave_sucursal = $1
    AND estatus = $2
    ORDER BY fecha_hora
  `;
  try {
    const results = await pool.query(query, [claveSucursal, estatus]);
    const rows = results.rows.map((element) => ({
      ...element,
      montoTotal: Number(element.montoTotal),
    }));
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error en getPedidosBySucursal:', error);
    res.status(500).json({ error: error.message });
  }
};

// Convertido a async/await
export const getPedidoById = async (req, res) => {
  const { idPedido } = req.params;
  const query = `
    SELECT id_pedido as "idPedido", numero_pedido as "numeroPedido", id_cliente as "idCliente",
    datos_cliente as "datosCliente", id_domicilio_cliente as "idDomicilioCliente",
    datos_domicilio_cliente as "datosDomicilioCliente", clave_sucursal as "claveSucursal",
    datos_sucursal as "datosSucursal", fecha_hora as "fechaHora", estatus,
    modalidad_entrega as "modalidadEntrega",
    monto_total as "montoTotal",
    detalle_pedido as "detallePedido", instrucciones_especiales as "instruccionesEspeciales",
    tipo_pago as "tipoPago",
    cantidad_productos as "cantidadProductos", resumen_pedido as "resumenPedido",
    url_recibo_pago as "urlReciboPago"
    FROM pedidos.pedido
    WHERE id_pedido = $1
  `;
  try {
    const results = await pool.query(query, [idPedido]);
    if (results.rows.length > 0) {
      const row = {
        ...results.rows[0],
        montoTotal: Number(results.rows[0].montoTotal),
      };
      res.status(200).json(row);
    } else {
      res.status(404).json({ error: 'No se encontró el pedido' });
    }
  } catch (error) {
    console.error('Error en getPedidoById:', error);
    res.status(500).json({ error: error.message });
  }
};

// Convertido a async/await
export const updateEstatusPedido = async (req, res) => {
  const { estatus, idPedido } = req.params;
  const query =
    'UPDATE pedidos.pedido SET estatus=$1 WHERE id_pedido=$2 RETURNING *';
  try {
    const results = await pool.query(query, [estatus, idPedido]);
    if (results.rows.length > 0) {
      res.status(201).json({
        respuesta: `Se actualizó pedido ${results.rows[0].id_pedido}`,
      });
    } else {
      res.status(404).json({ respuesta: `No existe el pedido ${idPedido}` });
    }
  } catch (error) {
    console.error('Error en updateEstatusPedido:', error);
    res.status(500).json({ error: error.message });
  }
};

// Convertido a async/await
export const getAllPedidos = async (req, res) => {
  const estatusPedidoNube = 'NP';
  const query = `
    SELECT id_pedido as "idPedido", numero_pedido as "numeroPedido", datos_cliente as "datosCliente",
    datos_domicilio_cliente as "datosDomicilioCliente", clave_sucursal as "claveSucursal",
    fecha_hora as "fechaHora", estatus, modalidad_entrega as "modalidadEntrega",
    monto_total as "montoTotal", detalle_pedido as "detallePedido", tipo_pago as "tipoPago"
    FROM pedidos.pedido
    WHERE estatus = $1
    ORDER BY clave_sucursal, numero_pedido
  `;
  try {
    const results = await pool.query(query, [estatusPedidoNube]);
    res.status(200).json(results.rows);
  } catch (error) {
    console.error('Error en getAllPedidos:', error);
    res.status(500).json({ error: error.message });
  }
};

// Convertido a async/await
export const getConfiguracion = async (req, res) => {
  const query = 'SELECT * FROM configuracion.minimos_maximos LIMIT 1';
  try {
    const results = await pool.query(query);
    if (results.rows.length > 0) {
      res.status(200).json(results.rows[0]);
    } else {
      res
        .status(404)
        .json({ error: 'No se encontraron parámetros de configuración.' });
    }
  } catch (error) {
    console.error('Error al consultar la configuración:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
