const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries_catalogos')
const port = process.env.PORT || 3001

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.use(cors({
    origin: '*'
}))
app.get('/', (request, response) => {
    response.json({ info: 'API CHPSystem Catálogos ' 
    +'/sucursales'
    +'/especialidades/:cve_sucursal'
    +'/tamanios/:cve_sucursal/:id_especialidad'
    +'/productos/:cve_sucursal'
    +'/tipoproductos/:cve_sucursal'
    +'/productos/:cve_sucursal/:id_tipo_producto'
    +'/sucursalesAll'
})

//Endpoints para catálogos
app.get('/sucursales', db.getSucursales)
app.get('/especialidades/:cve_sucursal', db.getEspecialidadesBySucursal)
app.get('/tamanios/:cve_sucursal/:id_especialidad', db.getTamaniosBySucursal)
app.get('/productos/:cve_sucursal', db.getProductosBySucursal)
app.get('/tipoproductos/:cve_sucursal', db.getTipoProductosBySucursal)
app.get('/productos/:cve_sucursal/:id_tipo_producto', db.getProductosByTipoProductoBySucursal)
app.get('/sucursalesAll', db.getSucursalesAll)

app.listen(port, () => {
    console.log('App corriendo en puerto',port)
})
