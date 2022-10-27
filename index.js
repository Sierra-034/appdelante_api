const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

const productosRouter = require('./api/recursos/productos/productos.routes');
const usuariosRouter = require('./api/recursos/usuarios/usuarios.routes');
const logger = require('./utils/logger');
const authJWT = require('./api/libs/auth');
const config = require('./config');
const errorHandler = require('./api/libs/errorHandler');

const passport = require('passport');

passport.use(authJWT);

logger.info(config.mongo);

mongoose.connect(config.mongo);
mongoose.connection.on('error', () => {
    logger.error('Falló la conexión a mongodb');
    process.exit(1);
});
 
const app = express();
app.use(bodyParser.json());
app.use(morgan('short', {
    stream: {
        write: message => logger.info(message)
    }
}));

app.use(passport.initialize());

app.use('/productos', productosRouter);
app.use('/usuarios', usuariosRouter);

app.use(errorHandler.procesarErroresDeDB);

if (config.ambiente === 'prod') {
    app.use(errorHandler.prodErrors);
} else {
    app.use(errorHandler.devErrors);
}

const server = app.listen(config.puerto, () => {
    logger.info('Escuchando en el puerto 3000.');
});

module.exports = {
    app,
    server,
};

