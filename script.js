// ======================================
// SAMURAI STOCK - VERSÃO 5
// ======================================


// CLASSE PRODUTO

class Produto {

    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.#preco = preco;
        this.#quantidade = quantidade;
    }

    get preco() {
        return this.#preco;
    }

    set preco(novoPreco) {
        this.#preco = novoPreco;
    }

    get quantidade() {
        return this.#quantidade;
    }

    set quantidade(novaQuantidade) {
        this.#quantidade = novaQuantidade;
    }

    calcularSubtotal() {
        return this.#preco * this.#quantidade;
    }

}


// VARIÁVEIS

let listaDeProdutos = [];
let indiceEdicao = null;

const CHAVE_STORAGE = "sistema_estoque_produtos";

let resolverConfirmacao = null;


// ELEMENTOS HTML

const formulario = document.getElementById("produto-form");

const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");

const tabelaProdutos = document.getElementById("tabela-produtos");

const contadorProdutos = document.getElementById("contador-produtos");
const valorTotal = document.getElementById("valor-total");

const campoBusca = document.getElementById("campo-busca");

const mensagemVazia = document.getElementById("mensagem-vazia");
const mensagemErro = document.getElementById("mensagem-erro");

const botaoSalvar = document.getElementById("botao-salvar");
const botaoCancelarEdicao = document.getElementById("botao-cancelar-edicao");

const botaoLimpar = document.getElementById("limpar-tabela");


// MODAL DE CONFIRMAÇÃO

const modalConfirmacao = document.getElementById("modal-confirmacao");

const tituloModal = document.getElementById("titulo-modal");
const textoModal = document.getElementById("texto-modal");

const botaoConfirmar = document.getElementById("confirmar-modal");
const botaoCancelar = document.getElementById("cancelar-modal");
const botaoFecharModal = document.getElementById("fechar-modal");


// MODAL BOOTSTRAP

const modalBootstrap = document.getElementById("modal-bootstrap");

const botaoBootstrap = document.getElementById("botao-bootstrap");

const botaoFecharBootstrap = document.getElementById("fechar-bootstrap");

const botaoEntendiBootstrap = document.getElementById("fechar-bootstrap-final");


// FORMATAÇÃO DE MOEDA

function formatarMoeda(valor) {

    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


// MENSAGENS NA TELA

function mostrarMensagemErro(mensagem) {

    mensagemErro.textContent = mensagem;
    mensagemErro.hidden = false;

    mensagemErro.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}


function limparMensagemErro() {

    mensagemErro.textContent = "";
    mensagemErro.hidden = true;

}


// LOCAL STORAGE

function salvarNoLocalStorage() {

    try {

        localStorage.setItem(
            CHAVE_STORAGE,
            JSON.stringify(listaDeProdutos)
        );

    } catch (erro) {

        console.error("Erro ao salvar produtos:", erro);

        mostrarMensagemErro(
            "Não foi possível salvar os dados no navegador."
        );

    }

}


function carregarDoLocalStorage() {

    try {

        const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

        if (!dadosSalvos) {
            listaDeProdutos = [];
            return;
        }

        const produtosConvertidos = JSON.parse(dadosSalvos);

        if (!Array.isArray(produtosConvertidos)) {
            throw new Error("Dados inválidos.");
        }

        listaDeProdutos = produtosConvertidos.map(produto => {

            return new Produto(
                produto.nome,
                Number(produto.preco),
                Number(produto.quantidade)
            );

        });

    } catch (erro) {

        console.error("Erro ao carregar produtos:", erro);

        listaDeProdutos = [];

        mostrarMensagemErro(
            "Não foi possível carregar os produtos salvos."
        );

    }

}


// PESQUISA

function obterProdutosFiltrados() {

    const pesquisa = campoBusca.value.toLowerCase().trim();

    return listaDeProdutos

        .map((produto, indice) => ({
            produto,
            indice
        }))

        .filter(item => {

            return item.produto.nome
                .toLowerCase()
                .includes(pesquisa);

        });

}


// ATUALIZAR INTERFACE

function atualizarInterface() {

    const produtosFiltrados = obterProdutosFiltrados();

    renderizarTabela(produtosFiltrados);

    atualizarContador(produtosFiltrados);

    atualizarValorTotal(produtosFiltrados);

    atualizarMensagemVazia(produtosFiltrados);

}


// RENDERIZAR TABELA

function renderizarTabela(produtosFiltrados) {

    tabelaProdutos.innerHTML = "";

    produtosFiltrados.forEach(item => {

        const produto = item.produto;

        const indiceOriginal = item.indice;

        const linha = document.createElement("tr");

        const colunaNome = document.createElement("td");
        const colunaPreco = document.createElement("td");
        const colunaQuantidade = document.createElement("td");
        const colunaSubtotal = document.createElement("td");
        const colunaAcoes = document.createElement("td");

        colunaNome.textContent = produto.nome;

        colunaPreco.textContent = formatarMoeda(produto.preco);

        colunaQuantidade.textContent = produto.quantidade;

        colunaSubtotal.textContent = formatarMoeda(
            produto.calcularSubtotal()
        );


        // BOTÃO EDITAR

        const botaoEditar = document.createElement("button");

        botaoEditar.textContent = "Editar";

        botaoEditar.className = "botao-editar";

        botaoEditar.type = "button";

        botaoEditar.addEventListener("click", () => {

            prepararEdicao(indiceOriginal);

        });


        // BOTÃO REMOVER

        const botaoRemover = document.createElement("button");

        botaoRemover.textContent = "Remover";

        botaoRemover.className = "botao-remover";

        botaoRemover.type = "button";

        botaoRemover.addEventListener("click", () => {

            removerProduto(indiceOriginal);

        });


        colunaAcoes.append(botaoEditar, botaoRemover);

        linha.append(
            colunaNome,
            colunaPreco,
            colunaQuantidade,
            colunaSubtotal,
            colunaAcoes
        );

        tabelaProdutos.appendChild(linha);

    });

}


// CONTADOR

function atualizarContador(produtosFiltrados) {

    contadorProdutos.textContent = produtosFiltrados.length;

}


// VALOR TOTAL

function atualizarValorTotal(produtosFiltrados) {

    const total = produtosFiltrados.reduce((soma, item) => {

        return soma + item.produto.calcularSubtotal();

    }, 0);

    valorTotal.textContent = formatarMoeda(total);

}


// MENSAGEM DA TABELA

function atualizarMensagemVazia(produtosFiltrados) {

    mensagemVazia.hidden = produtosFiltrados.length > 0;

    if (produtosFiltrados.length === 0) {

        if (listaDeProdutos.length === 0) {

            mensagemVazia.textContent =
                "Nenhum produto cadastrado.";

        } else {

            mensagemVazia.textContent =
                "Nenhum produto encontrado com essa pesquisa.";

        }

    }

}


// CADASTRAR E EDITAR

formulario.addEventListener("submit", function(evento) {

    evento.preventDefault();

    limparMensagemErro();

    const nome = campoNome.value.trim();

    const preco = Number(campoPreco.value);

    const quantidade = Number(campoQuantidade.value);


    if (nome === "") {

        mostrarMensagemErro("Digite o nome do produto.");

        campoNome.focus();

        return;

    }


    if (
        campoPreco.value.trim() === "" ||
        !Number.isFinite(preco) ||
        preco <= 0
    ) {

        mostrarMensagemErro(
            "Digite um preço válido e maior que zero."
        );

        campoPreco.focus();

        return;

    }


    if (
        campoQuantidade.value.trim() === "" ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
    ) {

        mostrarMensagemErro(
            "Digite uma quantidade inteira maior que zero."
        );

        campoQuantidade.focus();

        return;

    }


    if (indiceEdicao !== null) {

        if (!listaDeProdutos[indiceEdicao]) {

            cancelarEdicao();

            mostrarMensagemErro(
                "Produto não encontrado para edição."
            );

            return;

        }

        const produto = listaDeProdutos[indiceEdicao];

        produto.nome = nome;
        produto.preco = preco;
        produto.quantidade = quantidade;

    } else {

        const novoProduto = new Produto(
            nome,
            preco,
            quantidade
        );

        listaDeProdutos.push(novoProduto);

    }


    salvarNoLocalStorage();

    cancelarEdicao();

    atualizarInterface();

});


// PREPARAR EDIÇÃO

function prepararEdicao(indice) {

    const produto = listaDeProdutos[indice];

    if (!produto) {

        mostrarMensagemErro("Produto não encontrado.");

        return;

    }

    indiceEdicao = indice;

    campoNome.value = produto.nome;
    campoPreco.value = produto.preco;
    campoQuantidade.value = produto.quantidade;

    botaoSalvar.textContent = "Salvar alterações";

    botaoCancelarEdicao.hidden = false;

    limparMensagemErro();

    campoNome.focus();

    formulario.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// CANCELAR EDIÇÃO

function cancelarEdicao() {

    indiceEdicao = null;

    formulario.reset();

    botaoSalvar.textContent = "⚔ Cadastrar produto";

    botaoCancelarEdicao.hidden = true;

    limparMensagemErro();

}


botaoCancelarEdicao.addEventListener("click", cancelarEdicao);


// MODAL DE CONFIRMAÇÃO

function solicitarConfirmacao(titulo, mensagem) {

    return new Promise(resolve => {

        resolverConfirmacao = resolve;

        tituloModal.textContent = titulo;

        textoModal.textContent = mensagem;

        modalConfirmacao.hidden = false;

        botaoCancelar.focus();

    });

}


function fecharModalConfirmacao(resultado) {

    if (modalConfirmacao.hidden) {
        return;
    }

    modalConfirmacao.hidden = true;

    if (resolverConfirmacao) {

        const resolver = resolverConfirmacao;

        resolverConfirmacao = null;

        resolver(resultado);

    }

}


botaoConfirmar.addEventListener("click", () => {
    fecharModalConfirmacao(true);
});


botaoCancelar.addEventListener("click", () => {
    fecharModalConfirmacao(false);
});


botaoFecharModal.addEventListener("click", () => {
    fecharModalConfirmacao(false);
});


modalConfirmacao.addEventListener("click", evento => {

    if (evento.target === modalConfirmacao) {
        fecharModalConfirmacao(false);
    }

});


// REMOVER PRODUTO

async function removerProduto(indice) {

    const produto = listaDeProdutos[indice];

    if (!produto) {
        return;
    }

    const confirmou = await solicitarConfirmacao(
        "Remover produto?",
        `Deseja realmente remover "${produto.nome}" do estoque?`
    );

    if (!confirmou) {
        return;
    }

    if (indiceEdicao === indice) {

        cancelarEdicao();

    } else if (
        indiceEdicao !== null &&
        indice < indiceEdicao
    ) {

        indiceEdicao--;

    }

    listaDeProdutos.splice(indice, 1);

    salvarNoLocalStorage();

    atualizarInterface();

}


// LIMPAR ESTOQUE

botaoLimpar.addEventListener("click", async () => {

    if (listaDeProdutos.length === 0) {

        mostrarMensagemErro(
            "Não existem produtos para remover."
        );

        return;

    }

    const confirmou = await solicitarConfirmacao(
        "Limpar todo o estoque?",
        "Todos os produtos serão removidos. Deseja continuar?"
    );

    if (!confirmou) {
        return;
    }

    listaDeProdutos = [];

    indiceEdicao = null;

    localStorage.removeItem(CHAVE_STORAGE);

    campoBusca.value = "";

    cancelarEdicao();

    atualizarInterface();

});


// PESQUISA

campoBusca.addEventListener("input", () => {
    atualizarInterface();
});


// LIMPAR ERRO AO DIGITAR

formulario.addEventListener("input", () => {
    limparMensagemErro();
});


// MODAL BOOTSTRAP

function abrirModalBootstrap() {

    modalBootstrap.hidden = false;

    botaoEntendiBootstrap.focus();

}


function fecharModalBootstrap() {

    modalBootstrap.hidden = true;

}


botaoBootstrap.addEventListener("click", abrirModalBootstrap);

botaoFecharBootstrap.addEventListener("click", fecharModalBootstrap);

botaoEntendiBootstrap.addEventListener("click", fecharModalBootstrap);


modalBootstrap.addEventListener("click", evento => {

    if (evento.target === modalBootstrap) {
        fecharModalBootstrap();
    }

});


// TECLA ESCAPE

document.addEventListener("keydown", evento => {

    if (evento.key === "Escape") {

        if (!modalConfirmacao.hidden) {
            fecharModalConfirmacao(false);
        }

        if (!modalBootstrap.hidden) {
            fecharModalBootstrap();
        }

    }

});


// INICIALIZAÇÃO

carregarDoLocalStorage();

atualizarInterface();