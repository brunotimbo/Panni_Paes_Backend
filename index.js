const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// configuração do DB
const LINK_DO_BANCO = process.env.MONGO_URI;

//inicializa conexão com o servidor do mongodb
mongoose.connect(LINK_DO_BANCO)
    .then(function () {
        console.log("Conectado com sucesso ao MongoDB na núvem");
    })
    .catch(function (erro) {
        console.log("Erro ao conectar ao MongoDB: ", erro)
    });

// modelo de dados (schema): modelo de produto no db
const ProdutoSchema = new mongoose.Schema({
    nome: {type: String, required: true},
    categoria: {type: String, required: true},
    preco: {type: Number, required: true},
    imagem: {type: String, required: true},
    descricao: {type: String, required: true}
});

// modelo operacional do schema
const Produto = mongoose.model('Produto', ProdutoSchema);

// GET
app.get('/produtos', function (requisicao, response) {
    Produto.find()
        .then(function (listaDeProdutos) {
            return response.json(listaDeProdutos);
        })
        .catch(function (erro) {
            return response.status(500).json({erro: "Erro ao buscar dados do banco"});
        });
});

// POST
app.post('/produtos', function (requisicao, response) {
    const dadosRecebidos = requisicao.body;
    Produto.create({
        nome: dadosRecebidos.nome,
        categoria: dadosRecebidos.categoria,
        preco: dadosRecebidos.preco,
        imagem: dadosRecebidos.imagem,
        descricao: dadosRecebidos.descricao
    })
        .then(function (novoProduto) {
            return response.status(201).json(novoProduto);
        })
        .catch( function (erro) {
            return response.status(400).json({erro: "Erro ao salvar produto no banco"});
        });
});

// PUT
app.put('/produtos/:nomeParametro', function (requisicao, response) {
    const nomeParametro = decodeURIComponent(requisicao.params.nomeParametro);
    const dadosNovos = requisicao.body;

    Produto.findOneAndUpdate(
        {nome: {$regex: new RegExp("^" + nomeParametro + "$", "i")}},
        {nome: dadosNovos.nome, categoria: dadosNovos.categoria, preco: dadosNovos.preco, imagem: dadosNovos.imagem, descricao: dadosNovos.descricao},
        {new: true}
    )
        .then(function (produtoAtualizado) {
            if (!produtoAtualizado) {
                return response.status(404).json({erro: "Produto não encontrado para atualizar"});
            }
        })

});

// DELETE
app.delete('/produtos/:nomeParametro', function (requisicao, response) {
    const nomeParametro = decodeURIComponent(requisicao.params.nomeParametro);
    Produto.findOneAndDelete({nome: {$regex: new RegExp("^" + nomeParametro + "$", "i")}})
        .then(function (produtoDeletado) {
            if (!produtoDeletado) {
                return response.status(404).json({erro: "Produto não encontrado para deletar."});
            }
            return response.status(204).send();
        })
        .catch(function (erro) {
            return response.status(500).json({erro: "Erro ao processar a exclusão no banco."});
        });
});


const PORTA = 3000;
app.listen(PORTA, function () {
    console.log(`Backend rodando e pronto em http://localhost:${PORTA}`)
})


