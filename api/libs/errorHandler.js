let procesarErrores = (fn) => {
    return function() {
        fn().catch(error => console.error("Dentro de procesar errores", error))
    }
};