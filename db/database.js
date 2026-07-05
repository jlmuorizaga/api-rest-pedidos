import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Leemos las variables de entorno para la conexión
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT;

// Configurar SSL de forma dinámica para evitar errores en desarrollo local (localhost)
const useSSL = process.env.DB_SSL 
  ? process.env.DB_SSL === 'true' 
  : (DB_HOST && !['localhost', '127.0.0.1'].includes(DB_HOST.toLowerCase()));

const sslConfig = useSSL ? { rejectUnauthorized: false } : false;

// Pool de conexiones a base de datos
const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  ssl: sslConfig,
});

// Opcional: listener para errores
pool.on('error', (err, client) => {
  console.error('Error inesperado en el cliente del pool', err);
  process.exit(-1);
});

console.log('Pool de conexión a PostgreSQL (AWS RDS) creado.');

// Exportamos el pool para que lo usen todos los controladores
export default pool;
