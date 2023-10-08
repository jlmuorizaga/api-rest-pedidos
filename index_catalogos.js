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
    response.json({
        info: 'API CHPSystem Catálogos\n'
            + '/sucursales\n'
            + '/especialidades/:cve_sucursal\n'
            + '/tamanios/:cve_sucursal/:id_especialidad\n'
            + '/productos/:cve_sucursal\n'
            + '/tipoproductos/:cve_sucursal\n'
            + '/productos/:cve_sucursal/:id_tipo_producto\n'
            + '/sucursalesAll\n'
            + '/promociones/:cve_sucursal\n'
            + 'Version 20231007 1154'
    })
})

//Endpoints para catálogos
app.get('/sucursales', db.getSucursales)
app.get('/especialidades/:cve_sucursal', db.getEspecialidadesBySucursal)
app.get('/tamanios/:cve_sucursal/:id_especialidad', db.getTamaniosBySucursal)
app.get('/productos/:cve_sucursal', db.getProductosBySucursal)
app.get('/tipoproductos/:cve_sucursal', db.getTipoProductosBySucursal)
app.get('/productos/:cve_sucursal/:id_tipo_producto', db.getProductosByTipoProductoBySucursal)
app.get('/sucursalesAll', db.getSucursalesAll)
app.get('/promociones/:cve_sucursal/',db.getPromocionesBySucursal)

app.listen(port, () => {
    console.log('App corriendo en puerto', port)
})
