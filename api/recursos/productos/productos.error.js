class ProductoNoExiste extends Error {
    constructor(message) {
        super(message);
        this.message = message ||
            'Producto no existe. Operación no puede ser completada.';
        this.status = 404;
        this.name = 'ProductoNoExiste';
    }
}

class UsuarioNoEsDueño extends Error {
    constructo(message) {
        super(message);
        this.message = message ||
            'No eres dueño del producto. Operación no puede ser \
            completada.'
        this.status = 401;
        this.name = 'UsuarioNoEsDueño'; 
    }
}

module.exports = {
    ProductoNoExiste,
    UsuarioNoEsDueño,
}