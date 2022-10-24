const express = require('express');
const passport = require('passport');
const validators = require('./productos.validate');
const logger = require('../../../utils/logger');
const productosController = require('./productos.controller');

const jwtAuthenticate = passport.authenticate('jwt', { session: false });
const productos = require('../../../database').productos;
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

productosRouter.delete('/:id', [jwtAuthenticate, validators.validateId], async (request, response) => {
    let id = request.params.id;
    let productoBorrar;

    // async / await
    try {
        productoBorrar = await productosController.obtenerProducto(id);
    } catch (error) {
        logger.error(`Excepción ocurrió al procesar el borrado de producto con id [${id}]`, error);
        response.status(500).send(`Error ocurrió borrando producto con id [${id}]`);
        return
    }

    if (!productoBorrar) {
        logger.info(`Producto con id [${id}] no existe. Nada que borrar.`);
        response.status(404).send(`Producto con id [${id}] no existe. Nada que borrar.`);
        return
    }
    
    let usuarioAutenticado = request.user.username;
    if (productoBorrar.dueño !== usuarioAutenticado) {
        logger.info(`Usuario [${usuarioAutenticado}] no es dueño de producto con id [${id}]. Dueño real es [${productoBorrar.dueño}]. Request no será procesado`);
        response.status(401).send(`No eres dueño del producto con id [${id}]. Solo puedes borrar productos creados por tí.`);
        return
    }

    try {
        let productoBorrado = await productosController.borrarProducto(id);
        logger.info(`Producto con id [${id}] fué borrado`);
        response.json(productoBorrado);
    } catch (error) {
        logger.error(`Error ocurrió borrando el producto con id [${id}]`, error);
        response.status(500).send(`Error ocurrió borrando producto con id [${id}]`);
    }
});

module.exports = productosRouter;