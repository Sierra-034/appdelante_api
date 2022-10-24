const express = require('express');
const passport = require('passport');
const validators = require('./productos.validate');
const logger = require('../../../utils/logger');
const Producto = require('./productos.model');

const jwtAuthenticate = passport.authenticate('jwt', { session: false });
const productos = require('../../../database').productos;
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
    [jwtAuthenticate, validators.validateExistance, validators.validateProduct],
    (request, response) => {
        let productReplacer = {
            ...request.body,
            id: request.params.id,
            dueño: request.user.username
        }
        
        const idToReplace = productos.findIndex(producto => producto.id === request.params.id);
        if (productos[idToReplace].dueño !== productReplacer.dueño) {
            logger.info(`Usuario ${request.user.username} no es dueño del producto con id ${request.params.id}. Dueño real es ${productos[idToReplace].dueño}. Request no será procesado`);
            response.status(401).send(`No eres dueño del producto con id ${request.params.id}. Solo puedes modificar productos creados por ti.`);
            return;
        }
        productos[idToReplace] = productReplacer;
        logger.info(`Producto con id [${request.params.id}] fué reemplazado con nuevo producto`, productReplacer);
        response.status(200).json(productReplacer);
    });

productosRouter.delete('/:id', [jwtAuthenticate, validators.validateExistance], (request, response) => {
    const idToDelete = productos.findIndex(producto => producto.id === request.params.id);

    if (productos[idToDelete].dueño !== request.user.username) {
        logger.info(`Usuario ${request.user.username} no es dueño de producto con id ${request.params.id}. Dueño real es ${productos[idToDelete].dueño}. Request no será procesado`);
        response.status(401).send(`No eres dueño del producto con id ${request.params.id}. Solo puedes borrar productos creados por tí.`);
        return;
    }

    logger.info(`Producto con id [${request.params.id}] fué borrado.`)
    const deletedProduct = productos.splice(idToDelete, 1);
    response.status(200).json(deletedProduct);
});

module.exports = productosRouter;