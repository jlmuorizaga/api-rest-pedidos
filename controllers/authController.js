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

export const loginUsuarioAdmin = async (req, res) => {
  const { usuario, contrasenia } = req.body;

  if (!usuario || !contrasenia) {
    return res.status(400).json({ error: 'Se requiere usuario y contraseña.' });
  }

  try {
    const query = 'SELECT * FROM preesppropro.usuario WHERE usuario = $1';
    const result = await pool.query(query, [usuario]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const dbUser = result.rows[0];

    // Contraseña sin encriptación
    if (contrasenia !== dbUser.contrasenia) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    // Limpiar contraseña
    delete dbUser.contrasenia;

    // Generar Token JWT
    const token = jwt.sign(
      { id: dbUser.id.trim(), usuario: dbUser.usuario, nombre: dbUser.nombre },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Autenticación exitosa.',
      usuario: {
        id: dbUser.id.trim(),
        usuario: dbUser.usuario,
        nombre: dbUser.nombre
      },
      token
    });
  } catch (error) {
    console.error('Error en loginUsuarioAdmin:', error);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
};
