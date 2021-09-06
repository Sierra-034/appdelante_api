const logger = require('./../../utils/logger');
const usuarios = require('./../../database').usuarios;
const bcrypt = require('bcrypt');

module.exports = (username, password, done) => {
    // Buscar al usuario en la base de datos.
    // Si no existe, llamar a done con falso e indicar que el usuario no pudo ser autenticado en el logger
    // Obtener el hashed password desde el usuario de la base de datos.
    // Comparar el password.
        // Si coincide, entonces llamar a done con true e indicarlo en el logger
        // De lo contrario, entonces llamar a done con false e indicarlo en el logger

    let index = usuarios.findIndex(usuario => usuario.username === username);
    if (index === -1) {
        logger.info(`Usuario ${username} no existe. No puede ser autenticado.`);
        done(null, false);
        return;
    }

    const hashedPassword = usuarios[index].password;
    bcrypt.compare(password, hashedPassword, (err, iguales) => {
        if (iguales) {
            logger.info(`Usuario ${username} completó la autenticación.`);
            done(null, true);
        } else {
            logger.info(`El usuario ${username} no completó la autenticación. Contraseña incorrecta`);
            done(null, false);
        }
    })
}
