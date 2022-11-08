const ambiente = process.env.NODE_ENV || 'development';
const server_port = process.env.SERVER_PORT || 3000;
const db_connection_string = process.env.MONGO_DB_CONNECTION;

const configuracionBase = {
    jwt: {},
    puerto: server_port,
    mongo: db_connection_string,
    suprimirLogs: false,
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
    case 'test':
        configuracionDeAmbiente = require('./test');
        break;
    default:
        configuracionDeAmbiente = require('./dev');
};

module.exports = {
    ...configuracionBase,
    ...configuracionDeAmbiente
}