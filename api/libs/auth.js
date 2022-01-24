const logger = require('../../utils/logger');
const usuarios = require('../../database').usuarios;
const bcrypt = require('bcrypt');
const passportJWT = require('passport-jwt');

const jwtOptions = {
    secretOrKey: 'esto es un secreto',
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
}

module.exports = new passportJWT.Strategy(jwtOptions, (jwt_payload, done) => {
    const index = usuarios.findIndex(usuario => usuario.id === jwt_payload.id);
    if (index === -1) {
        logger.info(`JWT no es válido. Usuario con id ${jwt_payload.id} no existe.`);
        done(null, false);
        return;
    }

    logger.info(`Usuario ${usuarios[index].username} suministró token válido. Autenticación completada.`);
    done(null, {
        username: usuarios[index].username,
        id: usuarios[index].id,
    });
});
