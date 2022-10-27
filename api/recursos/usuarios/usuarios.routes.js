const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const logger = require('../../../utils/logger');
const validarUsuario = require('./usuarios.validate').validarUsuario;
const validarLogin = require('./usuarios.validate').validarLogin;
const config = require('../../../config');
const usuarioController = require("./usuarios.controller");
const procesarErrores = require('../../libs/errorHandler').procesarErrores;


const usuariosRouter = express.Router();

class DatosDeUsuarioYaEnUso extends Error {
	constructor(message) {
		super(message);
		this.message = message ||
			'El email o usuario ya están asociados.';
		this.status = 409;
		this.name = 'DatosDeUsuarioYaEnUso';
	}
}

function transformarBodyALowercase(request, response, next) {
	request.body.username &&
		(request.body.username = request.body.username.toLowerCase());
	request.body.email &&
		(request.body.email = request.body.email.toLowerCase());
	next();
}

usuariosRouter.get("/", procesarErrores((request, response) => {
	return usuarioController
		.obtenerUsuarios()
		.then((usuarios) => {
			response.json(usuarios);
		})
}));

usuariosRouter.post(
	"/",
	[validarUsuario, transformarBodyALowercase],
	procesarErrores((request, response) => {
		
	const nuevoUsuario = request.body;
	return usuarioController
		.usuarioExiste(nuevoUsuario.username, nuevoUsuario.email)
		.then((usuarioExiste) => {
			if (usuarioExiste) {
				logger.warn(
					`Email [${nuevoUsuario.email}] o username \
					[${nuevoUsuario.username}] ya existe en la base \
					de datos`
				);
				throw new DatosDeUsuarioYaEnUso();
			}

			return bcrypt.hash(nuevoUsuario.password, 10);
		})
		.then(hash => {
			return usuarioController
				.crearUsuario(nuevoUsuario, hash)
				.then((nuevoUsuario) => response
					.status(201)
					.send(`Usuario creado exitósamente.`));
		});
}));

usuariosRouter.post(
	"/login",
	[validarLogin, transformarBodyALowercase],
	procesarErrores(async (request, response) => {

	const usuarioNoAutenticado = request.body;
	let usuarioRegistrado;
	usuarioRegistrado = await usuarioController.obtenerUsuario({
		username: usuarioNoAutenticado.username,
	});

	if (!usuarioRegistrado) {
		logger.info(
			`Usuario [${usuarioNoAutenticado.username}] no existe. No \
			pudo ser autenticado`
		);
		response
			.status(400)
			.send(
				`Credenciales incorrectas. Asegúrate que el username \
				y contraseña sean correctos.`
			);
		return;
	}

	let contraseñaCorrecta;
	contraseñaCorrecta = await bcrypt.compare(
		usuarioNoAutenticado.password,
		usuarioRegistrado.password
	);

	if (contraseñaCorrecta) {
		const token = jwt.sign(
			{ id: usuarioRegistrado.id },
			config.jwt.secreto,
			{ expiresIn: config.jwt.tiempoDeExpiracion }
		);
		logger.info(
			`Usuario ${usuarioNoAutenticado.username} completó \
			autenticación existósamente.`
		);
		response.status(200).json({ token });
	} else {
		logger.info(
			`Usuario ${usuarioNoAutenticado.username} no completó \
			autentiación. Contraseña incorrecta.`
		);
		response
			.status(400)
			.send(
				"Credenciales incorrectas. Asegúrate que el username \
				y contraseñas sean correctas."
			);
	}
}));

module.exports = usuariosRouter;
