// routes/correo.js
import express from 'express';

// Importamos solo las dos funciones de prueba del controlador
import {
  verificaCorreoPrueba,
  recuperaCorreoPrueba,
  verificaCorreo,
} from '../controllers/correoController.js';

const router = express.Router();

// Ruta de prueba para verificar correo
// POST /api/verifica-correo-prueba
router.post('/verifica-correo-prueba', verificaCorreoPrueba);

// Ruta para verificar correo
// POST /api/verifica-correo
router.post('/verifica-correo', verificaCorreo);

// Ruta de prueba para recuperar contraseña
// POST /api/recupera-correo-prueba
router.post('/recupera-correo-prueba', recuperaCorreoPrueba);

export default router;
