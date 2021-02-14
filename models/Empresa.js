const mongoose = require('mongoose');

const EmpresasSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    rif: {
        type: String,
        trim: true
    },
    direccion: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    telefono: {
        type: String,
        trim: true
    },
    creado: {
        type: Date,
        default: Date.now
    }
});
// Se hizo modificación del Date.now() por Date.now para obtener la hora del sistema exacta
module.exports = mongoose.model('Empresa', EmpresasSchema);