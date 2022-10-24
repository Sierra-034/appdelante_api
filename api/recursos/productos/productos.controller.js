const Producto = require('./productos.model');

function crearProducto(producto, dueño) {
    return new Producto({
        ...producto,
        dueño
    }).save();
}

function obtenerProductos() {
    return Producto.find({});
}

module.exports = {
    crearProducto,
    obtenerProductos
}