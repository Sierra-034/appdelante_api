const mongoose = require('mongoose');
const logger = require("../../utils/logger");

exports.procesarErrores = (fn) => {
    return function(request, response, next) {
        fn(request, response, next).catch(next);
    }
};

exports.procesarErroresDeDB = (error, request, response, next) => {
    if (error instanceof mongoose.Error || error.name === 'MongoError') {
        logger.error(`Ocurrió un error relacionado a mongoose.`, error);
        error.message = "Error relacionado a la base de datos ocurrió inesperadamente. Para ayuda contacte a sierra@gmail.com";
        error.status = 500;
    }

    next(error);
};

exports.prodErrors = (error, request, response, next) => {
    response.status(error.status || 500);
    response.send({
        message: error.message
    });
}

exports.devErrors = (error, request, response, next) => {
    response.status(error.status || 500);
    response.send({
        message: error.message,
        stack: error.stack || '',
    });
}