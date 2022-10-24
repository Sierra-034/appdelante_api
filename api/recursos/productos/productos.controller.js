const Producto = require('./productos.model');

function crearProducto(producto, dueño) {
    return new Producto({
        ...producto,
        dueño
    }).save();
}

module.exports = {
    crearProducto
}