const express = require('express');
const bodyParser = require('body-parser');
const productosRouter = require('./api/recursos/productos/productos.routes');
const logger = require('./utils/logger');
const morgan = require('morgan');

const app = express();
app.use(bodyParser.json());
app.use(morgan('short', {
    stream: {
        write: message => logger.info(message)
    }
}));

app.use('/productos', productosRouter);

app.get('/', (request, response) => {
    response.send('API de appdelante');
});

app.listen(3000, () => {
    logger.info('Escuchando en el puerto 3000.');
});
 