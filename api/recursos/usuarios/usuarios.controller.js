const Usuario = require("./usuarios.model");

function obtenerUsuarios() {
	return Usuario.find({});
}

module.exports = {
	obtenerUsuarios,
};
