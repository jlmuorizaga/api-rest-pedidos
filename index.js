const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT']
}))

app.get('/', (request, response) => {
    response.json({ info: 'API CHPSystem Pedidos Móviles Nube ver: 20230506 1218' })
})

//Endpoints para app móvil
app.post('/pedido', db.createPedido)
app.get('/estatusPedido/:id_pedido', db.getEstatusPedido)

//Endpoints para receptor de pedidos en sucursal
app.get('/pedidos/:clave_sucursal', db.getPedidosBySucursal)
app.get('/pedido/:id_pedido', db.getPedidoById)
app.put('/pedidoRecibido/:id_pedido', db.updateEstatusRecibido)
app.put('/pedidoCapturado/:id_pedido', db.updateEstatusCapturado)
app.put('/pedidoEnviado/:id_pedido', db.updateEstatusEnviado)
app.put('/pedidoListo/:id_pedido', db.updateEstatusListo)
app.put('/pedidoAtendido/:id_pedido', db.updateEstatusAtendido)

app.listen(port, () => {
    console.log('App corriendo en puerto',port)
})
