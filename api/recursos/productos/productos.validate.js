const Joi = require('@hapi/joi');
const logger = require('../../../utils/logger');

const blueprintProducto = Joi.object({
    titulo: Joi.string().max(100).required(),
    precio: Joi.number().positive().precision(2).required(),
    moneda: Joi.string().length(3).uppercase()
});

const validateId = (request, response, next) => {
    let id = request.params.id;
    // regex
    if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
        response.status(400).send(`El id [${id}] suministrado en el URL no es válido`);
        return  // Siguiente callback
    }

    next();
};

const validateProduct = (request, response, next) => {
    const validationResult = blueprintProducto.validate(request.body, { abortEarly: false, convert: false });
    if (validationResult.error !== undefined) {

        const validationErrors = validationResult.error.details.reduce((accumulator, error) => {
            return accumulator += `[${error.message}]\n`;
        }, "\n\t");

        logger.warn('El siguiente producto no pasó la validación', request.body, validationErrors);
        response.status(400).send(`Tu producto en el body debe especificar un título, precio y moneda: ${validationErrors}`);
        return;
    }

    next();
};

module.exports = {
    validateProduct,
    validateId,
};