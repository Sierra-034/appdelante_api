const express = require('express');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const logger = require('../../../utils/logger');
const validarUsuario = require('./usuarios.validate').validarUsuario;
const validarPedidoLogin = require('./usuarios.validate').validarPedidoLogin;
const usuarios = require('../../../database').usuarios;

const usuariosRouter = express.Router();

usuariosRouter.get('/', (request, response) => {
    response.json(usuarios);
});

usuariosRouter.post('/', validarUsuario, (request, response) => {
    let nuevoUsuario = request.body;
    let indice = usuarios.findIndex(usuario => (
        usuario.username === nuevoUsuario.username ||
        usuario.email === nuevoUsuario.email
    ));

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
            password: hashedPassword,
            id: uuidv4()
        })

        response.status(200).send('Usuario creado exitosamente.');
        return;
    });
});

usuariosRouter.post('/login', validarPedidoLogin, (request, response) => {
    const usuarioNoAutenticado = request.body;
    const index = usuarios.findIndex(usuario => usuarioNoAutenticado.username === usuario.username);
    if (index === -1) {
        logger.info(`Usuario ${usuarioNoAutenticado.username} no existe. No puede ser autenticado.`);
        response.status(400).send('Credenciales incorrectas. El usuario no existe.');
        return;
    }

    const hashedPassword = usuarios[index].password;
    bcrypt.compare(usuarioNoAutenticado.password, hashedPassword, (err, iguales) => {
        if (iguales) {
            const token = jwt.sign({ id: usuarios[index].id }, 'esto es un secreto', { expiresIn: 86400 });
            logger.info(`Usuario ${usuarioNoAutenticado.username} completó la autenticación exitósamente.`);
            response.status(200).json({ token });
        } else {
            logger.info(`Usuario ${usuarioNoAutenticado.username} no completó la autenticación. Contraseña incorrecta.`);
            response.status(400).send('Credenciales incorrectas. Asegúrate de que el usuario y contraseña sean correctas.');
        }

        return;
    });
});

module.exports = usuariosRouter;
