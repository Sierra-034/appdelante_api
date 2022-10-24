const express = require('express');
const passport = require('passport');
const validators = require('./productos.validate');
const logger = require('../../../utils/logger');
const productosController = require('./productos.controller');

const productosRouter = express.Router();

productosRouter.get('/', (request, response) => {
    productosController.obtenerProductos()
        .then(productos => {
            response.json(productos);
        })
        .catch(err => {
            response.status(500).send("Error al leer de la base de datos");
        });
});

productosRouter.post('/', [jwtAuthenticate, validators.validateProduct], (request, response) => {
    productosController.crearProducto(request.body, request.user.username)
        .then(producto => {
            logger.info('Producto agregado a la colección productos', producto);
            response.status(201).json(producto);
        })
        .catch(err => {
            logger.error('Producto, no pudo ser creado', err);
            response.status(500).send("Error ocurrió al tratar de crear el producto.");
        });
});

productosRouter.get('/:id', validators.validateId, (request, response) => {
    let id = request.params.id;
    productosController.obtenerProducto(id)
        .then(producto => {
            if (!producto) {
                response.status(404).send(`Producto con id [${id}] no existe`);
            } else {
                response.status(200).json(producto);
            }
        })
        .catch(err => {
            logger.error(`Excepción ocurrió al tratar de obtener producto con id [${id}]`, err);
            response.status(500).send(`Error ocurrió obteniendo producto con id [${id}]`);
        });
});

productosRouter.put(
    '/:id',
    [validators.validateExistance, validators.validateProduct],
    (request, response) => {

        let productReplacer = request.body;
        const idToReplace = productos.findIndex(producto => producto.id === request.params.id);

        productReplacer.id = request.params.id;
        productos[idToReplace] = productReplacer;
        logger.info(`Producto con id [${request.params.id}] fué reemplazado con nuevo producto`, productReplacer);
        response.status(200).json(productReplacer);
    });

productosRouter.delete('/:id', validators.validateExistance, (request, response) => {
    const idToDelete = productos.findIndex(producto => producto.id === request.params.id);
    const deletedProduct = productos.splice(idToDelete, 1);
    response.status(200).json(deletedProduct);
});

module.exports = productosRouter;