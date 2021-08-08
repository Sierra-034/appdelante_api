const express = require('express');
const productos = require('../../../database').productos;
const uuidv4 = require('uuid/v4');

const productosRouter = express.Router();

productosRouter.get('/', (request, response) => {
    response.json(productos);
});

productosRouter.post('/', (request, response) => {
    let nuevoProducto = request.body;
    if (!nuevoProducto.titulo || !nuevoProducto.precio || !nuevoProducto.moneda) {
        response.status(400).send('Tu producto debe especificar un título, precio y moneda');
        return;
    }

    nuevoProducto.id = uuidv4();
    productos.push(nuevoProducto);
    response.status(201).json(nuevoProducto);
});

productosRouter.get('/:id', (request, response) => {
    const id = request.params.id;
    const indexToResponse = productos.findIndex(producto => producto.id === id);
    if (indexToResponse === -1) {
        response.status(404).send(`El producto con id [${request.params.id}] no existe`);
        return;
    }

    const productToResponse = productos[indexToResponse];
    response.status(200).json(productToResponse);
});

productosRouter.put('/:id', (request, response) => {
    const idToReplace = productos.findIndex(producto => producto.id === request.params.id);
    if (idToReplace === -1) {
        response.status(404).send(`El producto con id [${request.params.id}] no existe`);
        return;
    }

    const productReplacer = request.body;
    if (!productReplacer.titulo || !productReplacer.precio || !productReplacer.moneda) {
        response.status(400).send('Tu producto debe especificar un título, precio y moneda');
        return;
    }

    productReplacer.id = request.params.id;
    productos[idToReplace] = productReplacer;
    response.status(200).json(productReplacer);
});

productosRouter.delete('/:id', (request, response) => {
    const idToDelete = productos.findIndex(producto => producto.id === request.params.id);
    if (idToDelete === -1) {
        response.status(404).send(`El producto con id [${request.params.id}] no existe. Nada que`);
        return;
    }

    const deletedProduct = productos.splice(idToDelete, 1);
    response.status(200).json(deletedProduct);
});

module.exports = productosRouter;