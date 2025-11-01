import pool from '../db/database.js';

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
    
    // IMPORTANTE: Aquí se compara texto plano. En un futuro deberías hashear contraseñas.
    if (cliente.contrasenia !== contrasenia) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    delete cliente.contrasenia;
    res.json({ message: 'Autenticación exitosa', cliente });
  } catch (error) {
    console.error('Error en la autenticación:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Convertido a async/await
export const getClienteAcceso = async (req, res) => {
  const { correo, contrasenia } = req.params;
  const query = `
    SELECT count(*) as acceso
    FROM pedidos.cliente
    WHERE activo = $1 AND correo_electronico = $2 AND contrasenia = $3
  `;
  try {
    const results = await pool.query(query, ['S', correo, contrasenia]);
    res.status(200).json(results.rows[0]);
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