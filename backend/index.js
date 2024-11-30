const express = require('express');
const mongoose = require('mongoose');
const cron = require('cron');
const Vendedor = require('./models/Vendedor');

// Inicializando o Express
const app = express();
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect('mongodb://localhost:27017/filaApi', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conectado ao MongoDB');
}).catch(err => {
    console.error('Erro ao conectar ao MongoDB', err);
});

// Função para limpar a fila todos os dias à meia-noite
const limparFilaDiariamente = () => {
    const job = new cron.CronJob('00 00 00 * * *', async () => {
        await Vendedor.deleteMany({});
        console.log('Fila limpa à meia-noite');
    });
    job.start();
};

// Chama a função para agendar o job
limparFilaDiariamente();

// Rota para adicionar um vendedor à fila
app.post('/adicionar-vendedor', async (req, res) => {
    try {
        const { nome } = req.body;

        // Verificar se a fila já está cheia
        const filaCount = await Vendedor.countDocuments();

        if (filaCount >= 15) {
            return res.status(400).json({ message: 'A fila está cheia. Não é possível adicionar mais vendedores.' });
        }

        // Calculando a posição do vendedor
        const posicao = filaCount + 1;

        // Criar um novo vendedor e adicionar à fila
        const vendedor = new Vendedor({ nome, posicao });
        await vendedor.save();

        res.status(200).json({ message: 'Vendedor adicionado à fila', vendedor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao adicionar vendedor à fila' });
    }
});

// Rota para exibir a fila de vendedores
app.get('/fila', async (req, res) => {
    try {
        const fila = await Vendedor.find().sort({ posicao: 1 });
        res.status(200).json(fila);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao obter a fila' });
    }
});

// Rota para visualizar a posição de um vendedor na fila
app.get('/fila/:nome', async (req, res) => {
    const { nome } = req.params;
    try {
        const vendedor = await Vendedor.findOne({ nome });
        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado na fila' });
        }
        res.status(200).json({ nome: vendedor.nome, posicao: vendedor.posicao });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar vendedor' });
    }
});

// Iniciando o servidor na porta 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
