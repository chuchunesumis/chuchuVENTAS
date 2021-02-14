const mongoose = require('mongoose');

const ProductosSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    existencia: {
        type: Number,
        required: true,
        trim: true
    },
    precio: {
        type: Number,
        required: true,
        trim: true
    },
    creado: {
        type: Date,
        default: Date.now
    },
    empresa: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'Empresa'
    }
});
// Se hizo modificación del Date.now() por Date.now para obtener la hora del sistema exacta
ProductosSchema.index({ nombre: 'text' });

module.exports = mongoose.model('Producto', ProductosSchema);