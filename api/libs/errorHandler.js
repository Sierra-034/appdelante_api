const logger = require("../../utils/logger");

exports.procesarErrores = (fn) => {
    return function(req, res, next) {
        fn(req, res, next)
            .catch(error => logger.error("Dentro de procesar errores", error))
    }
};