const express = require('express');
const productos = require('../../../database').productos;
const uuidv4 = require('uuid/v4');
const validators = require('./productos.validate');
const logger = require('../../../utils/logger');
const Producto = require('./productos.model');

const productosRouter = express.Router();

productosRouter.get('/', (request, response) => response.json(productos));

productosRouter.post('/', [jwtAuthenticate, validators.validateProduct], (request, response) => {
    new Producto({ ...request.body, dueño: request.user.username }).save()
        .then(producto => {
            logger.info('Producto agregado a la colección productos', producto);
            response.status(201).json(producto);
        })
        .catch(err => {
            logger.warn('Producto, no pudo ser creado', err);
            response.status(500).send("Error ocurrió al tratar de crear el producto.");
        });
});

productosRouter.get('/:id', validators.validateExistance, (request, response) => {
    const product = productos.find(producto => producto.id === request.params.id);
    response.status(200).json(product);
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