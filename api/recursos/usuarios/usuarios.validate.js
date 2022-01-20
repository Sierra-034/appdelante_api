const Joi = require('@hapi/joi');
const logger = require('./../../../utils/logger');

const bluePrintUsuario = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(200).required(),
    email: Joi.string().email().required(),
});

const validarUsuario = (request, response, next) => {
    const validationResult = bluePrintUsuario.validate(request.body, { abortEarly: false, convert: false });
    if (validationResult.error) {
        logger.info("Usuarios falló la validación", validationResult.error.details.map(error => error.message));
        response.status(400).send("Información del usuario no cumple los requisitos. El nombre del usuario debe ser alfanumérico y tener entre 3 y 30 caracteres. La contraseña debe tener entre 6 y 200 caracteres. Asegúrate de que el email sea válido.");
        return;
    }

    next();
}

const blueprintLogin = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
});

const validarLogin = (request, response, next) => {
    const resultado = blueprintLogin.validate(request.body, { abortEarly: false, convert: false });
    if (resultado.error) {
        response.status(400).send("Login falló. Debes especificar el username y contraseña del usuario. ambos deben ser strings.");
        return;
    }

    next();
};

module.exports = {
    validarUsuario,
    validarLogin,
};
