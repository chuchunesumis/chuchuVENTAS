const mongoose = require('mongoose');

const UsuariosSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },    
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    empresa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa'
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    tipo: {
        type: Number,
        default: 1
    },
    creado: {
        type: Date,
        default: Date.now() 
    },
    habilitado: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Usuario', UsuariosSchema);