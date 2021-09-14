const Joi = require('@hapi/joi');
const logger = require('../../../utils/logger');

const blueprintUsuario = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(200).required(),
    email: Joi.string().email().required()
});

const validarUsuario = (request, response, next) => {
    const resultado = blueprintUsuario.validate(request.body, { abortEarly: false, convert: false });
    if (resultado.error === undefined) {
        next();
        return;
    }

    logger.info('Usuario falló la validación', resultado.error.details.map(error => error.message));
    response.status(400).send(
        "Información del usuario no cumple con los requisitos. " +
        "El nombre de usuario debe ser alfanumérico y tener entre 3 y 30 caracteres. " +
        "La contraseña debe tener entre 6 y 200 caracteres. " +
        "Asegúrate de que el email sea válido"
    );
    return;
}

const blueprintPedidoLogin = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

const validarPedidoLogin = (request, response, next) => {
    const resultado = blueprintPedidoLogin.validate(request.body, { abortEarly: false, convert: false });
    if (resultado.error === undefined) {
        next();
        return;
    }

    logger.info('Usuario falló la validación', resultado.error.details.map(error => error.message));
    response.status(400).send(
        'Login falló. Debes especificar el username y la contraseña del usuario. ' +
        'Ambos deben ser strings.'
    );
    return;
};

module.exports = {
    validarUsuario,
    validarPedidoLogin
};
