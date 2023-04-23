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

app.get('/', (request, response) => {
    response.json({ info: 'API CHPSystem Catálogos' })
})

//Endpoints para catálogos
app.get('/sucursales', db.getSucursales)

app.listen(port, () => {
    console.log('App corriendo en puerto',port)
})
