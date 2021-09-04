const Joi = require('@hapi/joi');
const logger = require('../../../utils/logger');

const blueprintUsuario = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(200).required(),
    email: Joi.string().email().required()
});

module.exports = (request, response, next) => {
    const resultado = blueprintUsuario.validate(request.body, { abortEarly: false, convert: false });
    if (resultado.error === null) next();
    
    logger.info('Producto falló la validación', resultado.error.details);
    response.status(400).send("Información del usuario no cumple con los requisitos. El nombre de usuario debe ser alfanumérico y tener entre 3 y 30 caracteres. La contraseña debe tener entre 6 y 200 caracteres. Asegúrate de que el email sea válido");
    return;
}
