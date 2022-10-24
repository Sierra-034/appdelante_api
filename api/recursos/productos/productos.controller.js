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

function obtenerProducto(id) {
    return Producto.findById(id);
}

function borrarProducto(id) {
    return Producto.findByIdAndRemove(id);
}

module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProducto,
    borrarProducto
}