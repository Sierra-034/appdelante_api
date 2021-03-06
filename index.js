const express = require('express');
const bodyParser = require('body-parser');
const productosRouter = require('./api/recursos/productos/productos.routes');
const usuariosRouter = require('./api/recursos/usuarios/usuarios.routes');
const logger = require('./utils/logger');
const morgan = require('morgan');
const passport = require('passport');
const authJWT = require('./api/libs/auth');

passport.use(authJWT);

const app = express();
app.use(bodyParser.json());
app.use(morgan('short', {
    stream: {
        write: message => logger.info(message.trim())
    }
}));

app.use(passport.initialize());
app.use('/productos', productosRouter);
app.use('/usuarios', usuariosRouter);

app.get('/', passport.authenticate('jwt', { session: false }), (request, response) => {
    logger.info('userInfo', request.user);
    response.send('API de appdelante');
});

app.listen(3000, () => {
    logger.info('Escuchando en el puerto 3000.');
});
