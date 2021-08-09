const Joi = require('@hapi/joi');
const productos = require('../../../database').productos;

const blueprintProducto = Joi.object({
    titulo: Joi.string().max(100).required(),
    precio: Joi.number().positive().precision(2).required(),
    moneda: Joi.string().length(3).uppercase()
});

const validateExistance = (request, response, next) => {
    const indexToLook = productos.findIndex(producto => producto.id === request.params.id);
    if (indexToLook === -1) {
        response.status(404).send(`El producto con id [${request.params.id}] no fué encontrado`);
        return;
    }

    next();
};

const validateProduct = (request, response, next) => {
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

module.exports = {
    validateExistance,
    validateProduct
};