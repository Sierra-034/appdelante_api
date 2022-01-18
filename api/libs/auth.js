const logger = require('../../utils/logger');
const usuarios = require('../../database').usuarios;
const bcrypt = require('bcrypt');

module.exports = (username, password, done) => {
    const index = usuarios.findIndex(usuario => usuario.username === username);
    if (index === -1) {
        logger.info(`Usuario ${username} no existe. No pudo ser autenticado.`);
        done(null, false);
        return;
    }

    const hashedPassword = usuarios[index].password;
    bcrypt.compare(password, hashedPassword, (err, iguales) => {
        if (iguales) {
            logger.info(`Usuario ${username} completó la autenticación.`)
            done(null, true);
        } else {
            logger.info(`Usuario ${username} no completó la autenticación. Contraseña incorrecta.`);
            done(null, false);
        }
    })
}
