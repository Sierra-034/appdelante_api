const express = require('express');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const logger = require('../../../utils/logger');
const validarUsuario = require('./usuarios.validate').validarUsuario;
const validarLogin = require('./usuarios.validate').validarLogin;
const usuarios = require('../../../database').usuarios;
const config = require('../../../config');
const usuarioController = require("./usuarios.controller");

const usuariosRouter = express.Router();

function transformarBodyALowercase(request, response, next) {
	request.body.username &&
		(request.body.username = request.body.username.toLowerCase());
	request.body.email && (request.body.email = request.body.email.toLowerCase());
	next();
}

usuariosRouter.get("/", (request, response) => {
	usuarioController
		.obtenerUsuarios()
		.then((usuarios) => {
			response.json(usuarios);
		})
		.catch((err) => {
			logger.error(`Error al obtener todos los usuarios`, err);
			response.sendStatus(500);
		});
});

usuariosRouter.post(
	"/",
	[validarUsuario, transformarBodyALowercase],
	(request, response) => {
		const nuevoUsuario = request.body;

		usuarioController
			.usuarioExiste(nuevoUsuario.username, nuevoUsuario.email)
			.then((usuarioExiste) => {
				if (usuarioExiste) {
					logger.warn(
						`Email [${nuevoUsuario.email}] o username [${nuevoUsuario.username}] ya existe en la base de datos`
					);
					response
						.status(409)
						.send(`El email o usuario ya están asociados con una cuenta`);
					return;
				}

				bcrypt.hash(nuevoUsuario.password, 10, (err, hashedPassword) => {
					if (err) {
						logger.error(
							`Error ocurrió al tratar de obtener el hash de una contraseña`,
							err
						);
						response.status(500).send(`Error procesando creación del usuario.`);
						return;
					}

					usuarioController
						.crearUsuario(nuevoUsuario, hashedPassword)
						.then((nuevoUsuario) => {
							response.status(201).send(`Usuario creado exitósamente.`);
						})
						.catch((err) => {
							logger.error(
								`Error ocurrió al tratar de crear nuevo usuario`,
								err
							);
							response
								.status(500)
								.send(`Error ocurrió al tratar de crear nuevo usuario`);
						});
				});
			})
			.catch((err) => {
				logger.error(
					`Error ocurrió al tratar de verificar si usuario [${nuevoUsuario.username}] con email [${nuevoUsuario.email}] ya existe.`
				);
				response
					.status(500)
					.send(`Error ocurrió al tratar de crear nuevo usuario.`);
			});
	}
);

usuariosRouter.post(
	"/login",
	[validarLogin, transformarBodyALowercase],
	async (request, response) => {
		const usuarioNoAutenticado = request.body;
		let usuarioRegistrado;

		try {
			usuarioRegistrado = await usuarioController.obtenerUsuario({
				username: usuarioNoAutenticado.username,
			});
		} catch (error) {
			logger.error(
				`Error ocurrió al tratar de determinar si el usuario [${usuarioNoAutenticado.username}] ya existe`,
				err
			);
			response.status(500).send(`Error ocurrió duarnte el proceso de login.`);
		}

		const index = usuarios.findIndex(
			(usuario) => usuario.username === usuarioNoAutenticado.username
		);
		if (index === -1) {
			logger.info(
				`Usuario ${usuarioNoAutenticado.username} no existe. No pudo ser autenticado`
			);
			response
				.status(400)
				.send("Credenciales incorrectas. El usuario no existe");
			return;
		}

		const hashedPassword = usuarios[index].password;
		bcrypt.compare(
			usuarioNoAutenticado.password,
			hashedPassword,
			(error, iguales) => {
				if (iguales) {
					const token = jwt.sign(
						{ id: usuarios[index].id },
						config.jwt.secreto,
						{ expiresIn: config.jwt.tiempoDeExpiracion }
					);
					logger.info(
						`Usuario ${usuarioNoAutenticado.username} completó autenticación existósamente.`
					);
					response.status(200).json({ token });
				} else {
					logger.info(
						`Usuario ${usuarioNoAutenticado.username} no completó autentiación. Contraseña incorrecta`
					);
					response
						.status(400)
						.send(
							"Credenciales incorrectas. Asegúrate que el username y contraseñas sean correctas."
						);
				}
			}
		);
	}
);

module.exports = usuariosRouter;
