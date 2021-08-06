const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.get('/', (request, response) => {
    response.send('API de appdelante');
});

app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000.');
});
