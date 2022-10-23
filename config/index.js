const ambiente = process.env.NODE_ENV || 'development';
const server_port = process.env.SERVER_PORT || 3000;

const configuracionBase = {
    jwt: {},
    puerto: server_port
};

let configuracionDeAmbiente = {};

switch (ambiente) {
    case 'desarrollo':
    case 'dev':
    case 'development':
        configuracionDeAmbiente = require('./dev');
        break;
    case 'producción':
    case 'prod':
    case 'production':
        configuracionDeAmbiente = require('./prod');
        break;
    default:
        configuracionDeAmbiente = require('./dev');
};

module.exports = {
    ...configuracionBase,
    ...configuracionDeAmbiente
}