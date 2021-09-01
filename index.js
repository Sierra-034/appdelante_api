const express = require('express');
const bodyParser = require('body-parser');
const productosRouter = require('./api/recursos/productos/productos.routes');
const winston = require('winston');

const incluirFecha = winston.format((info) => {
    info.message = `${new Date().toISOString()} ${info.message}`;
    return info;
})

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            level: 'info',
            handleExceptions: true,
            format: winston.format.combine(
                incluirFecha(),
                winston.format.simple()
            ),
            maxsize: 5120000,   // 5 Mb
            maxFiles: 5,
            filename: `${__dirname}/logs-de-aplicacion.log`
        })
    ]
})

logger.info(__dirname);
logger.info('Hola, soy logger', {compania: 'appdelante'});
logger.error('Algo explotó');
logger.warn('Algo inesperado ocurrió');
logger.debug('Llamada de debug');

const app = express();
app.use(bodyParser.json());
app.use('/productos', productosRouter);

app.get('/', (request, response) => {
    response.send('API de appdelante');
});

app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000.');
});
