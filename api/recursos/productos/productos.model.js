const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        require: [true, 'Producto debe tener un título']
    },
    precio: {
        type: Number,
        min: 0,
        require: [true, 'Producto debe tener un precio']
    },
    moneda: {
        type: String,
        maxLength: 3,
        minLength: 3,
        require: [true, 'Producto debe tener una moneda']
    },
    dueño: {
        type: String,
        require: [true, 'Producto debe estar asociado a un usuario']
    },
});

module.exports = mongoose.model('producto', productoSchema);