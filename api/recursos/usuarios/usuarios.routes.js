const express = require('express');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');

const logger = require('../../../utils/logger');
const validarUsuario = require('./usuarios.validate');
const usuarios = require('../../../database').usuarios;

const usuariosRouter = express.Router();

usuariosRouter.get('/', (request, response) => {
    response.json(usuarios);
});

usuariosRouter.post('/', validarUsuario, (request, response) => {
    let nuevoUsuario = request.body;
    let indice = usuarios.findIndex(usuario => {
        return usuario.username === nuevoUsuario.username || usuario.email === nuevoUsuario.email;
    });

    if (indice !== -1) {
        logger.info('Email o username ya existen en la base de datos.');
        response.status(409).send('El email o username ya están asociados a una cuenta.');
        return;
    }

    bcrypt.hash(nuevoUsuario.password, 10, (err, hashedPassword) => {
        if (err) {
            logger.info('Ocurrió algo al tratar de obtener el hash de una contraseña.', err);
            response.status(500).send('Ocurrió un error procesando creación de usuario.');
            return;
        }

        usuarios.push({
            username: nuevoUsuario.username,
            email: nuevoUsuario.email,
            password: hashedPassword
        })

        response.status(200).send('Usuario creado exitosamente.');
        return;
    });
});

module.exports = usuariosRouter;
