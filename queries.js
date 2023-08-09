const Pool = require('pg').Pool;

//Datos de conexión a base de datos en AWS
const DB_HOST = process.env.DB_HOST || 'chp202304db.c2fc27t7knic.us-east-2.rds.amazonaws.com';
const DB_USER = process.env.DB_USER || 'cheesepizzauser';
const DB_PASSWORD = process.env.DB_PASSWORD || 'cheesepizza2001';
const DB_NAME = process.env.DB_NAME || 'cheesepizzapedidosmovilesdb';
const DB_PORT = process.env.DB_PORT || 5432;

//Pool de conexiones a base de datos
const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT
    ,
    ssl: {
        rejectUnauthorized: false,
    },
});

const getClienteAcceso = (request, response) => {
    const correo = request.params.correo;
    const contrasenia = request.params.contrasenia;
    pool.query(
        'SELECT count(*) as acceso '
        + 'FROM pedidos.cliente '
        + 'WHERE activo = $1 AND correo_electronico = $2 AND contrasenia = $3',
        ['S', correo, contrasenia],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows[0]);
        }
    );
}

const getDatosCliente = (request, response) => {
    const correo = request.params.correo;
    pool.query(
        'SELECT id_cliente as "idCliente", correo_electronico as "correoElectronico", nombre, telefono, fecha_registro as "fechaRegistro", activo '
        + 'FROM pedidos.cliente '
        + 'WHERE correo_electronico = $1',
        [correo],
        (error, results) => {
            if (error) {
                throw error
            }
            if (results.rows[0]) {
                response.status(200).json(results.rows[0]);
            } else {
                textoError = '{"error": "No se encontró el cliente"}';
                response.status(404).json(JSON.parse(textoError));
            }
        }
    );
}

const getDomiciliosCliente = (request, response) => {
    const id_cliente = request.params.id_cliente
    pool.query(
        'SELECT id_domicilio as "idDomicilio", id_cliente as "idCliente", descripcion, punto, id_lugar as "idLugar", activo '
        + 'FROM pedidos.domicilio WHERE id_cliente = $1',
        [id_cliente],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const getFormasPagoCliente = (request, response) => {
    const id_cliente = request.params.id_cliente
    pool.query(
        'SELECT id_forma_pago as "idFormaPago", id_cliente as "idCliente", banco, numero_tarjeta as "numeroTarjeta", vigencia_mes as "vigenciaMes", vigencia_anio as "vigenciaAnio", cvv, cvv_dinamico as "cvvDinamico", activa '
        + 'FROM pedidos.forma_pago WHERE id_cliente = $1',
        [id_cliente],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

module.exports = {
    getClienteAcceso,
    getDatosCliente,
    getDomiciliosCliente,
    getFormasPagoCliente,
}