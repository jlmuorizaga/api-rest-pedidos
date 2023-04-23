const Pool = require('pg').Pool

/*const DB_HOST = process.env.DB_HOST || 'chp202304db.c2fc27t7knic.us-east-2.rds.amazonaws.com'
const DB_USER = process.env.DB_USER || 'cheesepizzauser'
const DB_PASSWORD = process.env.DB_PASSWORD || 'cheesepizza2001'
const DB_NAME = process.env.DB_NAME || 'cheesepizzapedidosmovilesdb'
const DB_PORT = process.env.DB_PORT || 5432
*/
const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_USER = process.env.DB_USER || 'cheesepizzauser'
const DB_PASSWORD = process.env.DB_PASSWORD || 'cheesepizza2001'
const DB_NAME = process.env.DB_NAME || 'cheesepizzapedidosmovilesdb'
const DB_PORT = process.env.DB_PORT || 5434

//Pool de conexiones a base de datos
const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
	/*ssl:{
            rejectUnauthorized:false,
        },*/
})

const createPedido = (request, response) => {
    const { id, tipo_pago, modalidad_entrega, estatus, fechahora, detalle, instrucciones, monto, datos_cliente, clave_sucursal } = request.body
    pool.query(
        'INSERT INTO datos.pedido("id", tipo_pago, modalidad_entrega, estatus, fechahora, detalle, instrucciones, monto, datos_cliente, clave_sucursal) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [id, tipo_pago, modalidad_entrega, estatus, fechahora, detalle, instrucciones, monto, datos_cliente, clave_sucursal],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(201).send(`Se insertó pedido: ${results.rows[0].id}`)
        }
    )
}

const getEstatusPedido = (request, response) => {
    const id_pedido = request.params.id_pedido
    pool.query(
        'SELECT estatus FROM datos.pedido WHERE id = $1',
        [id_pedido],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const getPedidosBySucursal = (request, response) => {
    const clave_sucursal = request.params.clave_sucursal
    const status_solicitado = 'SL' //Estatus solicitado desde aplicación movil
    pool.query(
        'SELECT id FROM datos.pedido WHERE clave_sucursal = $1 AND estatus = $2',
        [clave_sucursal, status_solicitado],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const getPedidoById = (request, response) => {
    const id_pedido = request.params.id_pedido
    pool.query(         
        'SELECT "id", tipo_pago as "tipoPago", modalidad_entrega as "modalidadEntrega",'+ 
'estatus, fechahora as "fechaHora",detalle, instrucciones, monto, '+
'datos_cliente as "datosCliente",clave_sucursal as "claveSucursal"'+
' FROM datos.pedido WHERE id = $1',
        [id_pedido],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const updateEstatusRecibido = (request, response) => {
    const id_pedido = request.params.id_pedido
    const status_recibido = 'RC' //Estatus recibido en el receptor de pedidos
    pool.query(
        'UPDATE datos.pedido SET estatus = $1 WHERE id = $2',
        [status_recibido, id_pedido],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Estatus modificado del pedido: ${id_pedido}`)
        }
    )
}

const updateEstatusCapturado = (request, response) => {
    const id_pedido = request.params.id_pedido
    const status_capturado = 'CP' //Estatus capturado en el punto de venta
    pool.query(
        'UPDATE datos.pedido SET estatus = $1 WHERE id = $2',
        [status_capturado, id_pedido],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Estatus modificado del pedido: ${id_pedido}`)
        }
    )
}

const updateEstatusEnviado = (request, response) => {
    const id_pedido = request.params.id_pedido
    const status_enviado = 'EV' //Estatus al domicilio del cliente
    pool.query(
        'UPDATE datos.pedido SET estatus = $1 WHERE id = $2',
        [status_enviado, id_pedido],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Estatus modificado del pedido: ${id_pedido}`)
        }
    )
}

const updateEstatusListo = (request, response) => {
    const id_pedido = request.params.id_pedido
    const status_listo = 'LE' //Estatus listo para entrega en sucursal
    pool.query(
        'UPDATE datos.pedido SET estatus = $1 WHERE id = $2',
        [status_listo, id_pedido],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Estatus modificado del pedido: ${id_pedido}`)
        }
    )
}

const updateEstatusAtendido = (request, response) => {
    const id_pedido = request.params.id_pedido
    const status_atendido = 'AT' //Estatus pedido atendido
    pool.query(
        'UPDATE datos.pedido SET estatus = $1 WHERE id = $2',
        [status_atendido, id_pedido],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Estatus modificado del pedido: ${id_pedido}`)
        }
    )
}

module.exports = {
    createPedido,
    getEstatusPedido,
    getPedidosBySucursal,
    getPedidoById,
    updateEstatusRecibido,
    updateEstatusCapturado,
    updateEstatusEnviado,
    updateEstatusListo,
    updateEstatusAtendido
}
