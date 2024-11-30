const mongoose = require('mongoose');

// Definindo o esquema do vendedor
const vendedorSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    posicao: {
        type: Number,
        required: true
    },
    dataCriacao: {
        type: Date,
        default: Date.now
    }
});

// Criação do modelo
const Vendedor = mongoose.model('Vendedor', vendedorSchema);

module.exports = Vendedor;
