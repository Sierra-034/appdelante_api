const express = require('express');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const logger = require('../../../utils/logger');
const validarUsuario = require('./usuarios.validate');
const usuarios = require('../../../database').usuarios;

const usuariosRouter = express.Router();

usuariosRouter.get('/', (request, response) => {
    response.json(usuarios);
});

usuariosRouter.post('/', validarUsuario, (request, response) => {
    const nuevoUsuario = request.body;
    const indice = usuarios.findIndex(usuario => 
        usuario.username === nuevoUsuario.username || usuario.email === nuevoUsuario.email);
    
    if (indice !== -1) {
        logger.info('Email o username ya existen en la base de datos.');
        response.status(409).send('El email o username ya están asociados a una cuenta.');
        return
    }

    bcrypt.hash(nuevoUsuario.password, 10, (error, hashedPassword) => {
        if (error) {
            logger.error('Ocurrió un error al tratar de obtener el hash de una contraseña', error);
            response.status(500).send('Ocurrió un error procesando creación del usuario');
            return
        }

        usuarios.push({
            username: nuevoUsuario.username,
            email: nuevoUsuario.email,
            password: hashedPassword,
            id: uuidv4(),
        });

        response.status(201).send('Usuario creado exitosamente');
    });
});

usuariosRouter.post('/login', (request, response) => {
    const usuarioNoAutenticado = request.body;
    const index = usuarios.findIndex(usuario => usuario.username === usuarioNoAutenticado.username);
    if (index === -1) {
        logger.info(`Usuario ${usuarioNoAutenticado.username} no existe. No pudo ser autenticado`);
        response.status(400).send('Credenciales incorrectas. El usuario no existe');
        return;
    }

    const hashedPassword = usuarios[index].password;
    bcrypt.compare(usuarioNoAutenticado.password, hashedPassword, (error, iguales) => {
        if (iguales) {
            const token = jwt.sign({id: usuarios[index].id}, 'esto es un secreto', {expiresIn: 86400});
            logger.info(`Usuario ${usuarioNoAutenticado.username} completó autenticación existósamente.`);
            response.status(200).json({ token })
        } else {
            logger.info(`Usuario ${usuarioNoAutenticado.username} no completó autentiación. Contraseña incorrecta`);
            response.status(400).send('Credenciales incorrectas. Asegúrate que el username y contraseñas sean correctas.');
        }
    })
});

module.exports = usuariosRouter;
