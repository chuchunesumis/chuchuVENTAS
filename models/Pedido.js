const mongoose = require('mongoose');

const PedidoSchema = mongoose.Schema({
    pedido: {
        type: Array,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    nota: {
        type: String,
        trim: true
    },
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Cliente'
    },
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },
    empresa: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Empresa'
    },
    estado: {
        type: String,
        default: "PENDIENTE"
    },
    creado: {
        type: Date,
        default: Date.now
    }
});
// Se hizo modificación del Date.now() por Date.now para obtener la hora del sistema exacta
module.exports = mongoose.model('Pedido', PedidoSchema);