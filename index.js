const express = require('express');
const bodyParser = require('body-parser');
const productosRouter = require('./api/recursos/productos/productos.routes');
const usuariosRouter = require('./api/recursos/usuarios/usuarios.routes');
const logger = require('./utils/logger');
const morgan = require('morgan');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

passport.use(new BasicStrategy(
    (username, password, done) => {
        if(username.valueOf() === 'sam' && password.valueOf() === 'sam123') {
            return done(null, true);
        } else {
            return done(null, false);
        }
    }
));

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

app.get('/', passport.authenticate('basic', { session: false }), (request, response) => {
    response.send('API de appdelante');
});

app.listen(3000, () => {
    logger.info('Escuchando en el puerto 3000.');
});
 