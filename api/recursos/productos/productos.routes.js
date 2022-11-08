const express = require('express');
const passport = require('passport');
const validators = require('./productos.validate');
const logger = require('../../../utils/logger');
const productosController = require('./productos.controller');
const procesarErrores = require('../../libs/errorHandler').procesarErrores;
const { ProductoNoExiste, UsuarioNoEsDueño } = require('./productos.error');

const jwtAuthenticate = passport.authenticate('jwt', { session: false });
const productosRouter = express.Router();

productosRouter.get('/', procesarErrores((request, response) => {
    return productosController.obtenerProductos()
        .then(productos => response.json(productos));
}));

productosRouter.post(
    '/',
    [jwtAuthenticate, validators.validateProduct],
    procesarErrores((request, response) => {

        return productosController
            .crearProducto(request.body, request.user.username)
            .then(producto => {
                logger.info(
                    "Producto agregado a la colección productos",
                    producto.toObject()
                );
                response.status(201).json(producto);
            });
    }));

productosRouter.get(
    '/:id',
    validators.validateId,
    procesarErrores((request, response) => {

        let id = request.params.id;
        return productosController.obtenerProducto(id)
            .then(producto => {
                if (!producto) {
                    logger.warn(`No existe producto`);
                    throw new ProductoNoExiste(`Producto con id [${id}] no existe`);
                }
                response.status(200).json(producto);
            });
    }));

productosRouter.put(
    "/:id",
    [jwtAuthenticate, validators.validateProduct],
    procesarErrores(async (request, response) => {

        let id = request.params.id;
        let requestUsuario = request.user.username;
        let productoReemplazar;
        productoReemplazar = await productosController.obtenerProducto(id);

        if (!productoReemplazar) {
            throw new ProductNoExiste(`El producto con id [${id}] no existe`)
        }

        if (productoReemplazar.dueño !== requestUsuario) {
            logger.warn(
                `Usuario [${requestUsuario}] no es dueño de \
            producto con id [${id}]. Dueño real es \
            [${productoReemplazar.dueño}]. Request no será procesado`
            );
            throw new UsuarioNoEsDueño(`No eres dueño del producto con id [${id}]. Solo \
        puedes modificar productos creados por tí.`);
        }

        productosController
            .reemplazarProducto(id, request.body, requestUsuario)
            .then((producto) => {
                response.json(producto);
                logger.info(
                    `Producto con id reemplazado con nuevo producto`,
                    producto.toObject()
                );

            })
    }));

productosRouter.delete(
    '/:id',
    [jwtAuthenticate, validators.validateId],
    procesarErrores(async (request, response) => {

        let id = request.params.id;
        let productoBorrar;

        // async / await
        productoBorrar = await productosController.obtenerProducto(id);

        if (!productoBorrar) {
            logger.info(`Producto con id [${id}] no existe. Nada que borrar.`);
            throw new ProductNoExiste(`Producto con id [${id}] no existe. Nada que borrar`);
        }

        let usuarioAutenticado = request.user.username;
        if (productoBorrar.dueño !== usuarioAutenticado) {
            logger.info(`Usuario [${usuarioAutenticado}] no es dueño de producto con id [${id}]. Dueño real es [${productoBorrar.dueño}]. Request no será procesado`);
            throw new UsuarioNoEsDueño(`No eres dueño del producto con id [${id}]. Solo puedes borrar productos creados por tí.`);
        }

        let productoBorrado = await productosController.borrarProducto(id);
        logger.info(`Producto con id [${id}] fué borrado`);
        response.json(productoBorrado);
    }));

module.exports = productosRouter;