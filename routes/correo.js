// routes/correo.js
import express from 'express';

// Importamos las funciones del controlador
import {
  verificaCorreoPrueba,
  recuperaCorreoPrueba,
  verificaCorreo,
  confirmarCodigo,
  recuperarContrasenia,
  restablecerContraseniaConCodigo,
} from '../controllers/correoController.js';

const router = express.Router();

// Ruta de prueba para verificar correo
// POST /api/verifica-correo-prueba
router.post('/verifica-correo-prueba', verificaCorreoPrueba);

// Ruta para verificar correo
// POST /api/verifica-correo
router.post('/verifica-correo', verificaCorreo);

// Ruta para confirmar código de verificación
// POST /api/correo/confirmar-codigo
router.post('/confirmar-codigo', confirmarCodigo);

// Ruta de prueba para recuperar contraseña
// POST /api/recupera-correo-prueba
router.post('/recupera-correo-prueba', recuperaCorreoPrueba);

// Ruta para recuperar contraseña (Envía el PIN)
// POST /api/recupera-contrasenia
router.post('/recupera-contrasenia', recuperarContrasenia);

// Ruta para establecer la nueva contraseña final
// POST /api/restablecer-contrasenia
router.post('/restablecer-contrasenia', restablecerContraseniaConCodigo);

export default router;
