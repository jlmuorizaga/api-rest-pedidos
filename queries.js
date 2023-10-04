const Pool = require('pg').Pool;

//Datos de conexión a base de datos en AWS
const DB_HOST = process.env.DB_HOST || 'database-1.cgujpjkz4fsl.us-west-1.rds.amazonaws.com';
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
                throw error;
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
    const idCliente = request.params.idCliente;
    pool.query(
        'SELECT id_domicilio as "idDomicilio", id_cliente as "idCliente", descripcion, punto, id_lugar as "idLugar", activo '
        + 'FROM pedidos.domicilio WHERE id_cliente = $1',
        [idCliente],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        }
    );
}

const getTarjetasCliente = (request, response) => {
    const idCliente = request.params.idCliente;
    pool.query(
        'SELECT id_tarjeta as "idTarjeta", id_cliente as "idCliente", banco, numero_tarjeta as "numeroTarjeta", vigencia_mes as "vigenciaMes", vigencia_anio as "vigenciaAnio", cvv, cvv_dinamico as "cvvDinamico", activa '
        + 'FROM pedidos.tarjeta WHERE id_cliente = $1',
        [idCliente],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        }
    );
}

const getLugares = (request, response) => {
    pool.query(
        'SELECT id_lugar as "idLugar", nombre, poligono '
        + 'FROM pedidos.lugar',
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        }
    );
}

const insertaCliente = (req, res) => {
    const { idCliente, correoElectronico, contrasenia, nombre, telefono, fechaRegistro, activo } = req.body;
    pool.query(
        'INSERT INTO pedidos.cliente'
        + '(id_cliente, correo_electronico, contrasenia, nombre, telefono, fecha_registro, activo) '
        + 'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [idCliente, correoElectronico, contrasenia, nombre, telefono, fechaRegistro, activo],
        (error, results) => {
            if (error) {
                throw error;
            }
            textoRespuesta = '{"respuesta": "Se insertó cliente: ' + results.rows[0].id_cliente + '"}';
            res.status(201).json(JSON.parse(textoRespuesta));
        }
    );
}

const actualizaCliente = (req, res) => {
    const { idCliente, correoElectronico, contrasenia, nombre, telefono, fechaRegistro, activo } = req.body;
    pool.query(
        'UPDATE pedidos.cliente '
        + 'SET correo_electronico=$2, contrasenia=$3, nombre=$4, telefono=$5, fecha_registro=$6, activo=$7 '
        + 'WHERE id_cliente=$1 RETURNING *',
        [idCliente, correoElectronico, contrasenia, nombre, telefono, fechaRegistro, activo],
        (error, results) => {
            if (error) {
                throw error;
            }
            textoRespuesta = '{"respuesta": "Se actualizó cliente: ' + results.rows[0].id_cliente + '"}';
            res.status(201).json(JSON.parse(textoRespuesta));
        }
    );
}

const insertaDomicilioCliente = (req, res) => {
    const { idDomicilio, idCliente, descripcion, punto, idLugar, activo } = req.body;
    pool.query(
        'INSERT INTO pedidos.domicilio'
        + '(id_domicilio, id_cliente, descripcion, punto, id_lugar, activo) '
        + 'VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [idDomicilio, idCliente, descripcion, punto, idLugar, activo],
        (error, results) => {
            if (error) {
                throw error;
            }
            textoRespuesta = '{"respuesta": "Se insertó domicilio: ' + results.rows[0].id_domicilio + '"}';
            res.status(201).json(JSON.parse(textoRespuesta));
        }
    );
}

const actualizaDomicilioCliente = (req, res) => {
    const { idDomicilio, idCliente, descripcion, punto, idLugar, activo } = req.body;
    pool.query(
        'UPDATE pedidos.domicilio '
        + 'SET id_cliente=$2, descripcion=$3, punto=$4, id_lugar=$5, activo=$6 '
        + 'WHERE id_domicilio=$1 '
        + 'RETURNING *',
        [idDomicilio, idCliente, descripcion, punto, idLugar, activo],
        (error, results) => {
            if (error) {
                throw error;
            }
            textoRespuesta = '{"respuesta": "Se actualizó domicilio: ' + results.rows[0].id_domicilio + '"}';
            res.status(201).json(JSON.parse(textoRespuesta));
        }
    );
}

const eliminaDomicilioCliente = (req, res) => {
    const idDomicilio = req.params.idDomicilio;
    pool.query(
        'DELETE FROM pedidos.domicilio '
        + 'WHERE id_domicilio=$1 ',
        [idDomicilio],
        (error, results) => {
            if (error) {
                throw error;
            }
            textoRespuesta = '{"respuesta": "Se eliminó ' + results.rowCount + ' domicilio: ' + idDomicilio + '"}';
            res.status(201).json(JSON.parse(textoRespuesta));
        }
    );
}

const insertaTarjetaCliente = (req, res) => {
    const { idTarjeta, idCliente, banco, numeroTarjeta, vigenciaMes, vigenciaAnio, cvv, cvvDinamico, activa } = req.body;
    pool.query(
        'INSERT INTO pedidos.tarjeta '
        + '(id_tarjeta, id_cliente, banco, numero_tarjeta, vigencia_mes, vigencia_anio, cvv, cvv_dinamico, activa) '
        + 'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [idTarjeta, idCliente, banco, numeroTarjeta, vigenciaMes, vigenciaAnio, cvv, cvvDinamico, activa],
        (error, results) => {
            if (error) {
                throw error;
            }
            textoRespuesta = '{"respuesta": "Se insertó tarjeta: ' + results.rows[0].id_tarjeta + '"}';
            res.status(201).json(JSON.parse(textoRespuesta));
        }
    );
}

const actualizaTarjetaCliente = (req, res) => {
    const { idTarjeta, idCliente, banco, numeroTarjeta, vigenciaMes, vigenciaAnio, cvv, cvvDinamico, activa } = req.body;
    pool.query(
        'UPDATE pedidos.tarjeta '
        + 'SET id_cliente=$2, banco=$3, numero_tarjeta=$4, vigencia_mes=$5, vigencia_anio=$6, cvv=$7, cvv_dinamico=$8, activa=$9 '
        + 'WHERE id_tarjeta=$1 '
        + 'RETURNING *',
        [idTarjeta, idCliente, banco, numeroTarjeta, vigenciaMes, vigenciaAnio, cvv, cvvDinamico, activa],
        (error, results) => {
            if (error) {
                throw error;
            }
            textoRespuesta = '{"respuesta": "Se actualizó tarjeta: ' + results.rows[0].id_tarjeta + '"}';
            res.status(201).json(JSON.parse(textoRespuesta));
        }
    );
}

const eliminaTarjetaCliente = (req, res) => {
    const idTarjeta = req.params.idTarjeta;
    pool.query(
        'DELETE FROM pedidos.tarjeta '
        + 'WHERE id_tarjeta=$1 ',
        [idTarjeta],
        (error, results) => {
            if (error) {
                throw error;
            }
            textoRespuesta = '{"respuesta": "Se eliminó ' + results.rowCount + ' tarjeta: ' + idTarjeta + '"}';
            res.status(201).json(JSON.parse(textoRespuesta));
        }
    );
}

module.exports = {
    getClienteAcceso,
    getDatosCliente,
    getDomiciliosCliente,
    getTarjetasCliente,
    getLugares,
    insertaCliente,
    actualizaCliente,
    insertaDomicilioCliente,
    actualizaDomicilioCliente,
    eliminaDomicilioCliente,
    insertaTarjetaCliente,
    actualizaTarjetaCliente,
    eliminaTarjetaCliente,
}