const Pool = require('pg').Pool

//Base de datos local JLMG
/*
const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_USER = process.env.DB_USER || 'userchpmovildb'
const DB_PASSWORD = process.env.DB_PASSWORD || 'Secreto'
const DB_NAME = process.env.DB_NAME || 'chppedidosmovildb'
const DB_PORT = process.env.DB_PORT || 5432
*/

//Base de datos en AWS
const DB_HOST = process.env.DB_HOST || 'chp202304db.c2fc27t7knic.us-east-2.rds.amazonaws.com'
const DB_USER = process.env.DB_USER || 'cheesepizzauser'
const DB_PASSWORD = process.env.DB_PASSWORD || 'cheesepizza2001'
const DB_NAME = process.env.DB_NAME || 'cheesepizzapedidosmovilesdb'
const DB_PORT = process.env.DB_PORT || 5432


/*const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_USER = process.env.DB_USER || 'cheesepizzauser'
const DB_PASSWORD = process.env.DB_PASSWORD || 'cheesepizza2001'
const DB_NAME = process.env.DB_NAME || 'cheesepizzapedidosmovilesdb'
const DB_PORT = process.env.DB_PORT || 5434
*/

//Pool de conexiones a base de datos
const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT
    ,
	ssl:{
            rejectUnauthorized:false,
        },
})


const getEstatusAcceso = (request, response) => {
    const correo = request.params.correo;
    const contrasenia = request.params.contrasenia;
    pool.query(
        'SELECT count(*) as acceso FROM datos.cliente '
        +'WHERE correo_electronico = $1 ' 
        +'AND contrasenia = $2',
        [correo, contrasenia],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows[0]);
        }
    )
}


const insertaDatos = (req, res)=>{
    //console.log('Se invocó el post a datos');
    //const product = req.body;
    //console.log(product);

    //const mensaje = {
    //    mensaje:"Datos recibidos"
    //}

    //res.send(mensaje);
    const { id, tipo_pago, modalidad_entrega, estatus, fechahora, detalle, instrucciones, monto, datos_cliente, clave_sucursal } = req.body
    pool.query(
        'INSERT INTO datos.pedido("id", tipo_pago, modalidad_entrega, estatus, fechahora, detalle, instrucciones, monto, datos_cliente, clave_sucursal) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [id, tipo_pago, modalidad_entrega, estatus, fechahora, detalle, instrucciones, monto, datos_cliente, clave_sucursal],
        (error, results) => {
            if (error) {
                throw error
            }
            textoRespuesta = '{"respuesta": "Se insertó pedido: '+results.rows[0].id+'"}';
            res.status(201).json(JSON.parse(textoRespuesta))
        }
    )
}

const createPedido = (request, response) => {
    const { id, tipo_pago, modalidad_entrega, estatus, fechahora, detalle, instrucciones, monto, datos_cliente, clave_sucursal } = request.body
    pool.query(
        'INSERT INTO datos.pedido("id", tipo_pago, modalidad_entrega, estatus, fechahora, detalle, instrucciones, monto, datos_cliente, clave_sucursal) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [id, tipo_pago, modalidad_entrega, estatus, fechahora, detalle, instrucciones, monto, datos_cliente, clave_sucursal],
        (error, results) => {
            if (error) {
                throw error
            }
            textoRespuesta = '{"respuesta": "Se insertó pedido: '+results.rows[0].id+'"}';
            response.status(201).json(JSON.parse(textoRespuesta))
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
    const status_pedido_nube = 'NP' //Estatus: solicitado desde aplicación movil y actualmente en la nube
    pool.query(
        'SELECT id FROM datos.pedido WHERE clave_sucursal = $1 AND estatus = $2 ORDER BY id',
        [clave_sucursal, status_pedido_nube],
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
            if(results.rows[0]){
                response.status(200).json(results.rows[0])
            }else{
                textoError = '{"error": "No se encontró el pedido"}'
                response.status(404).json(JSON.parse(textoError))
            }
        }
    )
}

const updateEstatusRecibido = (request, response) => {
    const id_pedido = request.params.id_pedido
    const status_recibido = 'RP' //Estatus: recibido en el receptor de pedidos
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
    const status_capturado = 'CP' //Estatus: capturado en el punto de venta
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
    const status_enviado = 'EP' //Estatus: enviado al domicilio del cliente
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
    const status_listo = 'LP' //Estatus: pedido listo para entrega en sucursal
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
    const status_atendido = 'AP' //Estatus: pedido atendido
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

const updateEstatusPedidosReset = (request, response) => {
    const status_nube = 'NP' //Estatus: pedido atendido
    pool.query(
        'UPDATE datos.pedido SET estatus = $1',
        [status_nube],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send('Estatus reseteado en todos los pedidos')
        }
    )
}

module.exports = {
    getEstatusAcceso,
    insertaDatos,
    createPedido,
    getEstatusPedido,
    getPedidosBySucursal,
    getPedidoById,
    updateEstatusRecibido,
    updateEstatusCapturado,
    updateEstatusEnviado,
    updateEstatusListo,
    updateEstatusAtendido,
    updateEstatusPedidosReset
}
