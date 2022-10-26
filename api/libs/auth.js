const passportJWT = require('passport-jwt');

const logger = require('../../utils/logger');
const config = require('../../config');
const usuarioController = require("../recursos/usuarios/usuarios.controller");


const jwtOptions = {
	secretOrKey: config.jwt.secreto,
	jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
}

module.exports = new passportJWT.Strategy(jwtOptions, (jwt_payload, next) => {
	usuarioController.obtenerUsuario({ id: jwt_payload.id })
		.then(usuario => {
			if (!usuario) {
				logger.info(`JWT token no es válido. Usuario con id ${jwt_payload.id} no existe.`);
				next(null, false);
				return
			}

			logger.info(`Usuario ${usuario.username} suministró un token válido. Autenticación completada.`);
			next(null, {
				username: usuario.username,
				id: usuario.id
			});
		})
		.catch(err => {
			logger.error(`Error ocurrió al tratar de validar un token.`, err);
			next(err);
		})
});
