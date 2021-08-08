const express = require('express');
const productos = require('../../../database').productos;
const uuidv4 = require('uuid/v4');

const productosRouter = express.Router();

productosRouter.route('/')
    .get((request, response) => {
        response.json(productos);
    })
    .post((request, response) => {
        let nuevoProducto = request.body;
        if (!nuevoProducto.titulo || !nuevoProducto.precio || !nuevoProducto.moneda) {
            response.status(400).send('Tu producto debe especificar un título, precio y moneda');
            return;
        }

        nuevoProducto.id = uuidv4();
        productos.push(nuevoProducto);
        response.status(201).json(nuevoProducto);
    });

productosRouter.route('/:id')
    .get((request, response) => {
        for (let producto of productos) {
            if (producto.id == request.params.id) {
                response.json(producto);
                return;
            }
        }

        response.status(404).send(`El producto con id [${request.params.id}] no existe`);
    })
    .put((request, response) => {
        let id = request.params.id;
        let productReplacer = request.body;

        if (!productReplacer.titulo || !productReplacer.precio || !productReplacer.moneda) {
            response.status(400).send('Tu producto debe especificar un título, precio y moneda');
            return;
        }
        
        let index = productos.findIndex(producto => producto.id == id);

        if(index !== -1) {
            productReplacer.id = id;
            productos[index] = productReplacer;
            response.status(200).json(productReplacer);
            return;
        } else {
            response.status(404).send(`El producto con id [${id}] no existe`);
        }
    })
    .delete((request, response) => {
        let indexToDelete = productos.findIndex(producto => producto.id === request.params.id);
        if(indexToDelete === -1) {
            response.status(404).send(`Producto con id [${request.params.id}] no existe. Nada que borrar.`);
            return;
        }

        let borrado = productos.splice(indexToDelete, 1);
        response.status(200).json(borrado);
    });

module.exports = productosRouter;