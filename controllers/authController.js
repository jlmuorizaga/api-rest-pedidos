import pool from '../db/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_chpsystem_pizza_2026';

// Convertido a async/await
export const verificaLogin = async (req, res) => {
  const { correo, contrasenia } = req.body;

  if (!correo || !contrasenia) {
    return res.status(400).json({ error: 'Se requiere correo y contraseña' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM pedidos.cliente WHERE correo_electronico = $1',
      [correo]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const cliente = result.rows[0];

    // Verificar contraseña usando bcrypt.compare
    const match = await bcrypt.compare(contrasenia, cliente.contrasenia);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    delete cliente.contrasenia;

    // Generar Token JWT
    const token = jwt.sign(
      { idCliente: cliente.id_cliente, correoElectronico: cliente.correo_electronico },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ message: 'Autenticación exitosa', cliente, token });
  } catch (error) {
    console.error('Error en la autenticación:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Convertido a async/await
export const getClienteAcceso = async (req, res) => {
  const { correo, contrasenia } = req.params;
  try {
    const query = `
      SELECT contrasenia 
      FROM pedidos.cliente 
      WHERE activo = $1 AND correo_electronico = $2
    `;
    const results = await pool.query(query, ['S', correo]);
    if (results.rows.length === 0) {
      return res.status(200).json({ acceso: '0' });
    }
    
    // Comparar contraseña con el hash de la base de datos
    const match = await bcrypt.compare(contrasenia, results.rows[0].contrasenia);
    res.status(200).json({ acceso: match ? '1' : '0' });
  } catch (error) {
    console.error('Error en getClienteAcceso:', error);
    res.status(500).json({ error: error.message });
  }
};

// Convertido a async/await
export const getClienteExisteCorreo = async (req, res) => {
  const { correo } = req.params;
  const query = `
    SELECT count(*) as existe
    FROM pedidos.cliente
    WHERE activo = $1 AND correo_electronico = $2
  `;
  try {
    const results = await pool.query(query, ['S', correo]);
    res.status(200).json(results.rows[0]);
  } catch (error) {
    console.error('Error en getClienteExisteCorreo:', error);
    res.status(500).json({ error: error.message });
  }
};
