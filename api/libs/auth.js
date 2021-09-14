const logger = require('./../../utils/logger');
const usuarios = require('./../../database').usuarios;
const bcrypt = require('bcrypt');
const passportJWT = require('passport-jwt');

const jwtOptions = {
    secretOrKey: 'esto es un secreto',
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}

module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
    const index = usuarios.findIndex(usuario => usuario.id === jwtPayload.id);
    if (index === -1) {
        logger.info(`JWT token no es válido. Usuario con id ${jwtPayload.id} no existe`);
        next(null, false);
    } else {
        logger.info(`Usuario ${usuarios[index].username} suministró un token válido. Autenticación completada.`);
        next(null, {
            username: usuarios[index].username,
            id: usuarios[index].id
        });
    }
});
