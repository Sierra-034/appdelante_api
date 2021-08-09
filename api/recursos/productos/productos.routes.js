const express = require('express');
const productos = require('../../../database').productos;
const uuidv4 = require('uuid/v4');
const Joi = require('@hapi/joi');

const productosRouter = express.Router();

const blueprintProducto = Joi.object({
    titulo: Joi.string().max(100).required(),
    precio: Joi.number().positive().precision(2).required(),
    moneda: Joi.string().length(3).uppercase()
});

const validarProducto = (request, response, next) => {
    const validationResult = blueprintProducto.validate(request.body, { abortEarly: false, convert: false });
    if (validationResult.error !== undefined) {

        const validationErrors = validationResult.error.details.reduce((accumulator, error) => {
            return accumulator += `[${error.message}]\n`;
        }, "\n\t");

        response.status(400).send(`Tu producto en el body debe especificar un título, precio y moneda: ${validationErrors}`);
        return;
    }

    next();
};

const validateProductExistance = (request, response, next) => {
    const indexToLook = productos.findIndex(producto => producto.id === request.params.id);
    if (indexToLook === -1) {
        response.status(404).send(`El producto con id [${request.params.id}] no fué encontrado`);
        return;
    }

    next();
}

productosRouter.get('/', (request, response) => response.json(productos));

productosRouter.post('/', validarProducto, (request, response) => {
    let nuevoProducto = request.body;
    nuevoProducto.id = uuidv4();
    productos.push(nuevoProducto);
    response.status(201).json(nuevoProducto);
});

productosRouter.get('/:id', validateProductExistance, (request, response) => {
    const product = productos.find(producto => producto.id === request.params.id);
    response.status(200).json(product);
});

productosRouter.put('/:id', [validateProductExistance, validarProducto], (request, response) => {
    let productReplacer = request.body;
    const idToReplace = productos.findIndex(producto => producto.id === request.params.id);

    productReplacer.id = request.params.id;
    productos[idToReplace] = productReplacer;
    response.status(200).json(productReplacer);
});

productosRouter.delete('/:id', validateProductExistance, (request, response) => {
    const idToDelete = productos.findIndex(producto => producto.id === request.params.id);
    const deletedProduct = productos.splice(idToDelete, 1);
    response.status(200).json(deletedProduct);
});

module.exports = productosRouter;