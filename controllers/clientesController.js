import pool from '../db/database.js';
import bcrypt from 'bcryptjs';

// --- CLIENTES ---

// Convertido a async/await
export const insertaCliente = async (req, res) => {
  const {
    idCliente,
    correoElectronico,
    contrasenia,
    nombre,
    telefono,
    fechaRegistro,
    activo,
  } = req.body;

  // Validar longitud mínima de contraseña
  if (!contrasenia || contrasenia.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  // 1. Verificar si el correo ha sido verificado en la tabla de verificación de códigos
  try {
    const verificacionRes = await pool.query(
      'SELECT verificado FROM pedidos.codigo_verificacion WHERE correo = $1',
      [correoElectronico]
    );
    if (verificacionRes.rows.length === 0 || !verificacionRes.rows[0].verificado) {
      return res.status(400).json({ error: 'El correo electrónico no ha sido verificado.' });
    }
  } catch (error) {
    console.error('Error al comprobar verificación de correo:', error);
    return res.status(500).json({ error: 'Error interno al validar el correo electrónico.' });
  }

  // 2. Hashear la contraseña antes de guardar
  let hashedPassword;
  try {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(contrasenia, salt);
  } catch (error) {
    console.error('Error al hashear contraseña:', error);
    return res.status(500).json({ error: 'Error interno al procesar el registro.' });
  }

  const query = `
    INSERT INTO pedidos.cliente
    (id_cliente, correo_electronico, contrasenia, nombre, telefono, fecha_registro, activo)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
  `;
  try {
    const results = await pool.query(query, [
      idCliente,
      correoElectronico,
      hashedPassword,
      nombre,
      telefono,
      fechaRegistro,
      activo,
    ]);
    
    // Opcional: Eliminar la verificación de correo una vez registrado
    await pool.query('DELETE FROM pedidos.codigo_verificacion WHERE correo = $1', [correoElectronico]);

    res.status(201).json({
      respuesta: `Se insertó cliente: ${results.rows[0].id_cliente}`,
    });
  } catch (error) {
    console.error('Error en insertaCliente:', error);
    res.status(500).json({ error: error.message });
  }
};

// (Tu función 'actualizaDatosCliente' ya era async/await, solo se importa el pool)
export const actualizaDatosCliente = async (req, res) => {
  const { idCliente } = req.params;
  const { contrasenia, nombre, telefono } = req.body;

  // Validar longitud mínima de contraseña
  if (!contrasenia || contrasenia.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasenia, salt);
    const result = await pool.query(
      `UPDATE pedidos.cliente 
       SET contrasenia = $1, nombre = $2, telefono = $3
       WHERE id_cliente = $4
       RETURNING *`,
      [hashedPassword, nombre, telefono, idCliente]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
};

// Convertido a async/await
export const getDatosCliente = async (req, res) => {
  const { correo } = req.params;
  const query = `
    SELECT id_cliente as "idCliente", correo_electronico as "correoElectronico",
    nombre, telefono, fecha_registro as "fechaRegistro", activo
    FROM pedidos.cliente
    WHERE correo_electronico = $1
  `;
  try {
    const results = await pool.query(query, [correo]);
    if (results.rows.length > 0) {
      res.status(200).json(results.rows[0]);
    } else {
      res.status(404).json({ error: 'No se encontró el cliente' });
    }
  } catch (error) {
    console.error('Error en getDatosCliente:', error);
    res.status(500).json({ error: error.message });
  }
};

// --- DOMICILIOS ---

// Convertido a async/await
export const getDomiciliosCliente = async (req, res) => {
  const { idCliente } = req.params;
  const query = `
    SELECT id_domicilio_cliente as "idDomicilioCliente", id_cliente as "idCliente",
    id_region as "idRegion", activo, calle, numero, codigo_postal as "codigoPostal",
    estado, ciudad, colonia, informacion_adicional as "informacionAdicional", latitud, longitud
    FROM pedidos.domicilio_cliente WHERE id_cliente = $1 ORDER BY calle, numero
  `;
  try {
    const results = await pool.query(query, [idCliente]);
    res.status(200).json(results.rows);
  } catch (error) {
    console.error('Error en getDomiciliosCliente:', error);
    res.status(500).json({ error: error.message });
  }
};

// Convertido a async/await
export const insertaDomicilioCliente = async (req, res) => {
  const {
    idDomicilioCliente,
    idCliente,
    idRegion,
    activo,
    calle,
    numero,
    codigoPostal,
    estado,
    ciudad,
    colonia,
    informacionAdicional,
    latitud,
    longitud,
  } = req.body;
  const query = `
    INSERT INTO pedidos.domicilio_cliente
    (id_domicilio_cliente, id_cliente, id_region, activo, calle, numero, codigo_postal,
     estado, ciudad, colonia, informacion_adicional, latitud, longitud)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *
  `;
  try {
    const results = await pool.query(query, [
      idDomicilioCliente,
      idCliente,
      idRegion,
      activo,
      calle,
      numero,
      codigoPostal,
      estado,
      ciudad,
      colonia,
      informacionAdicional,
      latitud,
      longitud,
    ]);
    res.status(201).json({
      respuesta: `Se insertó domicilio: ${results.rows[0].id_domicilio_cliente}`,
    });
  } catch (error) {
    console.error('Error en insertaDomicilioCliente:', error);
    res.status(500).json({ error: error.message });
  }
};

// Convertido a async/await
export const actualizaDomicilioCliente = async (req, res) => {
  const {
    idDomicilioCliente,
    idCliente,
    idRegion,
    activo,
    calle,
    numero,
    codigoPostal,
    estado,
    ciudad,
    colonia,
    informacionAdicional,
    latitud,
    longitud,
  } = req.body;
  const query = `
    UPDATE pedidos.domicilio_cliente
    SET id_cliente=$2, id_region=$3, activo=$4, calle=$5, numero=$6, codigo_postal=$7, estado=$8,
    ciudad=$9, colonia=$10, informacion_adicional=$11, latitud=$12, longitud=$13
    WHERE id_domicilio_cliente=$1
    RETURNING *
  `;
  try {
    const results = await pool.query(query, [
      idDomicilioCliente,
      idCliente,
      idRegion,
      activo,
      calle,
      numero,
      codigoPostal,
      estado,
      ciudad,
      colonia,
      informacionAdicional,
      latitud,
      longitud,
    ]);
    res.status(201).json({
      respuesta: `Se actualizó domicilio: ${results.rows[0].id_domicilio_cliente}`,
    });
  } catch (error) {
    console.error('Error en actualizaDomicilioCliente:', error);
    res.status(500).json({ error: error.message });
  }
};

// Convertido a async/await
export const eliminaDomicilioCliente = async (req, res) => {
  const { idDomicilioCliente } = req.params;
  const query =
    'DELETE FROM pedidos.domicilio_cliente WHERE id_domicilio_cliente=$1';
  try {
    const results = await pool.query(query, [idDomicilioCliente]);
    res.status(201).json({
      respuesta: `Se eliminó ${results.rowCount} domicilio: ${idDomicilioCliente}`,
    });
  } catch (error) {
    console.error('Error en eliminaDomicilioCliente:', error);
    res.status(500).json({ error: error.message });
  }
};
