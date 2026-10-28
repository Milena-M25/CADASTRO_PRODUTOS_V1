// ==========================================
// FASE 1: MODELAGEM DOS DADOS
// ==========================================

class Produto {
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {
        nome = String(nome).trim();

        if (nome === "") {
            throw new Error("O nome do produto é obrigatório.");
        }

        this.nome = nome;
        this.preco = preco;
        this.quantidade = quantidade;
    }

    get preco() {
        return this.#preco;
    }

    set preco(novoPreco) {
        novoPreco = Number(novoPreco);

        if (!Number.isFinite(novoPreco) || novoPreco <= 0) {
            throw new Error(
                "O preço deve ser um número maior que zero."
            );
        }

        this.#preco = novoPreco;
    }

    get quantidade() {
        return this.#quantidade;
    }

    set quantidade(novaQuantidade) {
        novaQuantidade = Number(novaQuantidade);

        if (
            !Number.isInteger(novaQuantidade) ||
            novaQuantidade <= 0
        ) {
            throw new Error(
                "A quantidade deve ser um número inteiro maior que zero."
            );
        }

        this.#quantidade = novaQuantidade;
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}


// ==========================================
// FASE 2: GERENCIAMENTO DE ESTADO
// ==========================================

const listaDeProdutos = [];
const CHAVE_STORAGE = "sistema_estoque_produtos";

let indiceEdicao = null;


// ==========================================
// FASE 3: CAPTURA DOS ELEMENTOS DO HTML
// ==========================================

const formProduto = document.getElementById("produto-form");
const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");

const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const quantidadeProdutosEl = document.getElementById(
    "quantidade-produtos"
);
const contadorProdutosEl = document.getElementById(
    "contador-produtos"
);
const mensagemVazia = document.getElementById("mensagem-vazia");

const tabelaBody = document.querySelector(
    "#tabela-produtos tbody"
);

const botaoEnviar = document.getElementById("botao-enviar");
const botaoCancelar = document.getElementById("botao-cancelar");


// ==========================================
// FASE 4: FORMATAÇÃO DE VALORES
// ==========================================

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


// ==========================================
// FASE 5: SALVAR PRODUTOS
// ==========================================

function salvarNoLocalStorage() {
    const produtosParaSalvar = listaDeProdutos.map(
        function (produto) {
            return {
                nome: produto.nome,
                preco: produto.preco,
                quantidade: produto.quantidade
            };
        }
    );

    try {
        localStorage.setItem(
            CHAVE_STORAGE,
            JSON.stringify(produtosParaSalvar)
        );
    } catch (erro) {
        alert(
            "Não foi possível salvar os produtos neste navegador."
        );

        console.error("Erro ao salvar produtos:", erro);
    }
}


// ==========================================
// FASE 6: CARREGAR PRODUTOS SALVOS
// ==========================================

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (!dadosSalvos) {
        return;
    }

    try {
        const produtosSalvos = JSON.parse(dadosSalvos);

        if (!Array.isArray(produtosSalvos)) {
            throw new Error("Os dados salvos não são uma lista.");
        }

        produtosSalvos.forEach(function (dados) {
            try {
                const produto = new Produto(
                    dados.nome,
                    dados.preco,
                    dados.quantidade
                );

                listaDeProdutos.push(produto);
            } catch (erro) {
                console.warn(
                    "Produto inválido ignorado:",
                    erro.message
                );
            }
        });
    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
    }
}


// ==========================================
// FASE 7: ALTERAR O TEXTO DOS BOTÕES
// ==========================================

function atualizarBotaoFormulario() {
    if (indiceEdicao === null) {
        botaoEnviar.innerHTML = "<span>＋</span> Adicionar Produto";
        botaoCancelar.hidden = true;
    } else {
        botaoEnviar.textContent = "Salvar Alterações";
        botaoCancelar.hidden = false;
    }
}


// ==========================================
// FASE 8: GUARD CLAUSE E SUBMIT DO FORMULÁRIO
// ==========================================

formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    // Validação do nome

    const nome = campoNome.value.trim();

    if (nome === "") {
        alert("Por favor, informe o nome do produto.");
        campoNome.focus();
        return;
    }

    // Validação do preço

    const textoPreco = campoPreco.value.trim();
    const preco = Number(textoPreco);

    if (
        textoPreco === "" ||
        !Number.isFinite(preco) ||
        preco <= 0
    ) {
        alert("O preço deve ser um número maior que zero.");
        campoPreco.focus();
        return;
    }

    // Validação da quantidade

    const textoQuantidade = campoQuantidade.value.trim();
    const quantidade = Number(textoQuantidade);

    if (
        textoQuantidade === "" ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
    ) {
        alert(
            "A quantidade deve ser um número inteiro maior que zero."
        );

        campoQuantidade.focus();
        return;
    }

    // Criar o novo produto

    let novoProduto;

    try {
        novoProduto = new Produto(
            nome,
            preco,
            quantidade
        );
    } catch (erro) {
        alert(erro.message);
        return;
    }

    // Inclusão ou atualização

    if (indiceEdicao === null) {
        listaDeProdutos.push(novoProduto);
    } else {
        listaDeProdutos[indiceEdicao] = novoProduto;
    }

    // Salvar as alterações

    salvarNoLocalStorage();

    // Limpar o formulário e restaurar o estado

    formProduto.reset();
    indiceEdicao = null;

    atualizarBotaoFormulario();
    atualizarInterface();
});


// ==========================================
// FASE 9: PREPARAR A EDIÇÃO
// ==========================================

function prepararEdicao(index) {
    const produto = listaDeProdutos[index];

    if (!produto) {
        alert("Este produto não foi encontrado.");
        return;
    }

    campoNome.value = produto.nome;
    campoPreco.value = produto.preco;
    campoQuantidade.value = produto.quantidade;

    indiceEdicao = index;

    atualizarBotaoFormulario();

    formProduto.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    campoNome.focus();
}


// ==========================================
// FASE 10: CANCELAR A EDIÇÃO
// ==========================================

function cancelarEdicao() {
    formProduto.reset();

    indiceEdicao = null;

    atualizarBotaoFormulario();
}

botaoCancelar.addEventListener("click", cancelarEdicao);


// ==========================================
// FASE 11: REMOVER UM PRODUTO
// ==========================================

function removerProduto(index) {
    if (
        indiceEdicao !== null &&
        indiceEdicao === index
    ) {
        cancelarEdicao();
    } else if (
        indiceEdicao !== null &&
        indiceEdicao > index
    ) {
        indiceEdicao--;
    }

    listaDeProdutos.splice(index, 1);

    salvarNoLocalStorage();
    atualizarInterface();
}


// ==========================================
// FASE 12: LIMPAR TODO O ESTOQUE
// ==========================================

btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        alert("O estoque já está vazio.");
        return;
    }

    const confirmar = confirm(
        "Tem certeza de que deseja remover todos os produtos?"
    );

    if (!confirmar) {
        return;
    }

    listaDeProdutos.length = 0;

    localStorage.removeItem(CHAVE_STORAGE);

    cancelarEdicao();
    atualizarInterface();
});


// ==========================================
// FASE 13: ATUALIZAR O TOTAL DO ESTOQUE
// ==========================================

function atualizarTotalEstoque() {
    const total = listaDeProdutos.reduce(
        function (acumulador, produto) {
            return acumulador + produto.calcularSubtotal();
        },
        0
    );

    totalEstoqueEl.textContent = formatarMoeda(total);
}


// ==========================================
// FASE 14: ATUALIZAR OS CONTADORES
// ==========================================

function atualizarContadores() {
    const quantidade = listaDeProdutos.length;

    quantidadeProdutosEl.textContent = quantidade;

    contadorProdutosEl.textContent =
        quantidade === 1
            ? "1 produto cadastrado"
            : quantidade + " produtos cadastrados";

    mensagemVazia.hidden = quantidade !== 0;
}


// ==========================================
// FASE 15: RENDERIZAR A TABELA
// ==========================================

function renderizarTabela() {
    tabelaBody.innerHTML = "";

    listaDeProdutos.forEach(function (produto, index) {
        const linha = document.createElement("tr");

        // Nome do produto

        const colunaNome = document.createElement("td");
        colunaNome.textContent = produto.nome;

        // Preço unitário

        const colunaPreco = document.createElement("td");
        colunaPreco.textContent = formatarMoeda(produto.preco);

        // Quantidade

        const colunaQuantidade = document.createElement("td");
        colunaQuantidade.textContent = produto.quantidade;

        // Subtotal

        const colunaSubtotal = document.createElement("td");
        colunaSubtotal.textContent = formatarMoeda(
            produto.calcularSubtotal()
        );

        // Coluna de ações

        const colunaAcoes = document.createElement("td");

        const grupoBotoes = document.createElement("div");
        grupoBotoes.className = "acoes-produto";

        // Botão Editar

        const botaoEditar = document.createElement("button");

        botaoEditar.type = "button";
        botaoEditar.className = "btn-editar";
        botaoEditar.textContent = "✏️ Editar";

        botaoEditar.addEventListener("click", function () {
            prepararEdicao(index);
        });

        // Botão Remover

        const botaoRemover = document.createElement("button");

        botaoRemover.type = "button";
        botaoRemover.className = "btn-remover";
        botaoRemover.textContent = "🗑️ Remover";

        botaoRemover.addEventListener("click", function () {
            removerProduto(index);
        });

        // Separar os botões na tela

        grupoBotoes.appendChild(botaoEditar);
        grupoBotoes.appendChild(botaoRemover);

        colunaAcoes.appendChild(grupoBotoes);

        // Montar a linha completa

        linha.appendChild(colunaNome);
        linha.appendChild(colunaPreco);
        linha.appendChild(colunaQuantidade);
        linha.appendChild(colunaSubtotal);
        linha.appendChild(colunaAcoes);

        tabelaBody.appendChild(linha);
    });
}


// ==========================================
// FASE 16: ATUALIZAR A INTERFACE
// ==========================================

function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
    atualizarContadores();
}


// ==========================================
// FASE 17: INICIAR A APLICAÇÃO
// ==========================================

carregarDoLocalStorage();
atualizarInterface();
atualizarBotaoFormulario();