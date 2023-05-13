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
    response.json({ info: 'API CHPSystem Catálogos' })
})

//Endpoints para catálogos
app.get('/sucursales', db.getSucursales)
app.get('/especialidades/:cve_sucursal', db.getEspecialidadesBySucursal)
app.get('/tamanios/:cve_sucursal/:id_especialidad', db.getTamaniosBySucursal)
app.get('/productos/:cve_sucursal', db.getProductosBySucursal)
app.get('/tipoproductos/:cve_sucursal', db.getTipoProductosBySucursal)


app.listen(port, () => {
    console.log('App corriendo en puerto',port)
})
