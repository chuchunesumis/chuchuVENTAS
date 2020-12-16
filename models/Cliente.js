const mongoose = require('mongoose');

const ClientesSchema = mongoose.Schema({
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
    ci: {
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
        default: Date.now() 
    },    
    empresa: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'Empresa'
    }, 
    vendedor: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'Usuario'
    }

});

module.exports = mongoose.model('Cliente', ClientesSchema);