const express = require('express');
const bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');

const app = express();

// Base de datos en memoria
const productos = [
    { id: '123123', titulo: 'macbook pro 13 inches', precio: 1300, moneda: 'USD' },
    { id: 'aa12ab', titulo: 'Taza de café', precio: 10, moneda: 'USD' },
    { id: 'kfhdg2', titulo: 'microfono blue yeti', precio: 100, moneda: 'USD' }
];

app.route('/productos')
    .get((request, response) => {
        response.json(productos);
    })
    .post((request, response) => {
        let nuevoProducto = request.body;
        if(!nuevoProducto.titulo || !nuevoProducto.precio || !nuevoProducto.moneda) {
            response.status(400).send('Tu producto debe especificar un título, precio y moneda');
            return;
        }

        nuevoProducto.id = uuidv4();
        productos.push(nuevoProducto);
        response.status(201).json(nuevoProducto);
    });

app.get('/productos/:id', (request, response) => {
    for(let producto of productos) {
        if(producto.id == request.params.id) {
            response.json(producto);
            return
        }

        response.status(404).send(`El producto con id [${request.params.id}] no existe`);
    }
});

app.get('/', (request, response) => {
    response.send('API de appdelante');
});

app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000.');
});
