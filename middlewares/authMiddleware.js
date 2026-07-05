import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_chpsystem_pizza_2026';

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token de seguridad.' });
  }

  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(400).json({ error: 'Formato de token inválido. Se espera: Bearer <token>' });
  }

  const token = partes[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded; // Guardamos el usuario decodificado en la petición
    next();
  } catch (error) {
    console.error('Error al verificar token JWT:', error);
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};
