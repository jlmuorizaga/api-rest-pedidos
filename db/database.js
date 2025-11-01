import pkg from 'pg';
const { Pool } = pkg;

// Leemos las variables de entorno para la conexión
const DB_HOST =
  process.env.DB_HOST || 'database-1.czyiomwau3kc.us-east-1.rds.amazonaws.com';
const DB_USER = process.env.DB_USER || 'cheesepizzauser';
const DB_PASSWORD = process.env.DB_PASSWORD || 'cheesepizza2001';
const DB_NAME = process.env.DB_NAME || 'chppreciosespecprodpromocdb';
const DB_PORT = process.env.DB_PORT || 5432;

// Pool de conexiones a base de datos
const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  ssl: {
    rejectUnauthorized: false, // <-- Importante para conexiones a AWS RDS
  },
});

// Opcional: listener para errores
pool.on('error', (err, client) => {
  console.error('Error inesperado en el cliente del pool', err);
  process.exit(-1);
});

console.log('Pool de conexión a PostgreSQL (AWS RDS) creado.');

// Exportamos el pool para que lo usen todos los controladores
export default pool;
