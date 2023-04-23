const Pool = require('pg').Pool

const DB_HOST = process.env.DB_HOST || 'chp202304db.c2fc27t7knic.us-east-2.rds.amazonaws.com'
const DB_USER = process.env.DB_USER || 'cheesepizzauser'
const DB_PASSWORD = process.env.DB_PASSWORD || 'cheesepizza2001'
const DB_NAME = process.env.DB_NAME || 'chppreciosespecprodpromocdb'
const DB_PORT = process.env.DB_PORT || 5432

//Pool de conexiones a base de datos
const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
	ssl:{
            rejectUnauthorized:false,
        },
        
})



const getSucursales = (request, response) => {
    pool.query(
        'SELECT clave, nombre_sucursal FROM preesppropro.sucursal order by clave',
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

module.exports = {
    getSucursales
}
