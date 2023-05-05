const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = 3002;

app.get('/', (req, res) => res.send('Hello World!'));

app.get("/products", (req, res) => {
    console.log('Se invocó el get a products');
    const products = [
        {
            id: 1,
            name: "hammer",
        },
        {
            id: 2,
            name: "screwdriver",
        },
        {
            id: 3,
            name: "wrench",
        },
    ];

    res.json(products);
});

app.post("/products", (req, res)=>{
    console.log('Se invocó el post a products');
    const product = req.body;
    console.log(product);

    const mensaje = {
        mensaje:"Producto recibido"
    }

    res.send(mensaje);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));