
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(cors());
app.use(express.json());

// CONEXÃO COM O BANCO
const LINK_DO_BANCO = process.env.MONGO_URI;

mongoose.connect(LINK_DO_BANCO)
    .then(function () {
        console.log("Conectado com sucesso ao MongoDB na nuvem");
    })
    .catch(function (erro) {
        console.log("Erro ao conectar ao MongoDB:", erro);
    });

// SCHEMA DO PRODUTO
const ProdutoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    categoria: { type: String, required: true },
    preco: { type: Number, required: true },
    imagem: { type: String, required: true },
    descricao: { type: String, required: true }
});

const Produtos = mongoose.model('Produtos', ProdutoSchema);

// ======================================
// ROTA AUTOMÁTICA PARA CADASTRAR TESTE
// ======================================

app.get('/produto/cadastrar', async function (requisicao, response) {
    try {
        const novoProduto = await Produtos.create({
            nome: "Produto de Teste",
            categoria: "Eletrônicos",
            preco: 199.90,
            imagem: "https://placehold.co/300x300",
            descricao: "Este é um produto cadastrado automaticamente para teste."
        });

        return response.status(201).json({
            mensagem: "Produto cadastrado com sucesso!",
            produto: novoProduto
        });

    } catch (erro) {
        return response.status(500).json({
            erro: "Erro ao cadastrar produto de teste",
            detalhes: erro.message
        });
    }
});

// ======================================
// GET - LISTAR PRODUTOS
// ======================================

app.get('/produtos', async function (requisicao, response) {
    try {
        const listaDeProdutos = await Produtos.find();

        return response.json(listaDeProdutos);

    } catch (erro) {
        return response.status(500).json({
            erro: "Erro ao buscar dados do banco"
        });
    }
});

// ======================================
// POST - CADASTRAR PRODUTO
// ======================================

app.post('/produtos', async function (requisicao, response) {
    try {
        const dadosRecebidos = requisicao.body;

        const novoProduto = await Produtos.create({
            nome: dadosRecebidos.nome,
            categoria: dadosRecebidos.categoria,
            preco: dadosRecebidos.preco,
            imagem: dadosRecebidos.imagem,
            descricao: dadosRecebidos.descricao
        });

        return response.status(201).json(novoProduto);

    } catch (erro) {
        return response.status(400).json({
            erro: "Erro ao salvar produto no banco"
        });
    }
});

// ======================================
// PUT - ATUALIZAR PRODUTO
// ======================================

app.put('/produtos/:nomeParametro', async function (requisicao, response) {
    try {
        const nomeParametro = decodeURIComponent(
            requisicao.params.nomeParametro
        );

        const dadosNovos = requisicao.body;

        const produtoAtualizado = await Produtos.findOneAndUpdate(
            {
                nome: {
                    $regex: "^" + nomeParametro.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$",
                    $options: "i"
                }
            },
            {
                nome: dadosNovos.nome,
                categoria: dadosNovos.categoria,
                preco: dadosNovos.preco,
                imagem: dadosNovos.imagem,
                descricao: dadosNovos.descricao
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!produtoAtualizado) {
            return response.status(404).json({
                erro: "Produto não encontrado para atualizar"
            });
        }

        return response.json({
            mensagem: "Produto atualizado com sucesso!",
            produto: produtoAtualizado
        });

    } catch (erro) {
        return response.status(500).json({
            erro: "Erro ao atualizar produto"
        });
    }
});

// ======================================
// DELETE - EXCLUIR PRODUTO
// ======================================

app.delete('/produtos/:nomeParametro', async function (requisicao, response) {
    try {
        const nomeParametro = decodeURIComponent(
            requisicao.params.nomeParametro
        );

        const produtoDeletado = await Produtos.findOneAndDelete({
            nome: {
                $regex: "^" + nomeParametro.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$",
                $options: "i"
            }
        });

        if (!produtoDeletado) {
            return response.status(404).json({
                erro: "Produto não encontrado para deletar."
            });
        }

        return response.status(204).send();

    } catch (erro) {
        return response.status(500).json({
            erro: "Erro ao processar a exclusão no banco."
        });
    }
});

// ======================================
// INICIAR SERVIDOR
// ======================================

const PORTA = 3000;

app.listen(PORTA, function () {
    console.log(`Backend rodando em http://localhost:${PORTA}`);
});
