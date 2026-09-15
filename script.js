//=======================================================================================
//FASE 1: modelagem dos dados (Classe Base)
//=======================================================================================

//A classe funciona como um molde para criar produtos
class Produto{
    //=======================================================================================
    //Desafio 1: Blindagem de Dados e Validação (Encapsulamento + Erros)
    //=======================================================================================
    //atributos privados
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {

        //validação do nome
        if (!nome || nome.trim() === "") {
            throw new Error("O nome do produto não pode ficar em branco.");
        }

        // Propriedades do objeto recebidas no momento da criação
        this.nome = nome;

        // Converte o texto do input para número decimal
        this.preco = parseFloat(preco);

        // Converte o texto do input para número inteiro
        this.quantidade = parseInt(quantidade);

        //validação do preço
        if (this.#preco <= 0 || isNaN(this.#preco)) {
            throw new Error("O preço deve ser maior que zero.");
        }

        //validação da quantidade
        if (this.#quantidade <= 0 || isNaN(this.#quantidade)) {
            throw new Error("A quantidade deve ser maior que zero.");
        }
    }

    // Permite que outras partes do código LEIAM o preço privado
    get preco() {
        return this.#preco;
    }

    // Permite alterar o preço, mas mantendo a validação
    set preco(novoPreco) {

        novoPreco = parseFloat(novoPreco);

        if (isNaN(novoPreco) || novoPreco <= 0) {
            throw new Error("O preço deve ser maior que zero.");
        }

        this.#preco = novoPreco;
    }

    // Permite que outras partes do código LEIAM a quantidade privada
    get quantidade() {
        return this.#quantidade;
    }

    // Permite alterar a quantidade, mas mantendo a validação
    set quantidade(novaQuantidade) {

        novaQuantidade = parseInt(novaQuantidade);

        if (isNaN(novaQuantidade) || novaQuantidade <= 0) {
            throw new Error("A quantidade deve ser maior que zero.");
        }

        this.#quantidade = novaQuantidade;
    }
 
    // Método que calcula o subtotal deste produto específico
    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}
//=======================================================================================
//FASE 2: Gerenciamento de Estado (memória)
//=======================================================================================

//Array global que guardará todas as instâncias da classe Produto

const listaDeProdutos = [];

//=======================================================================================
//FASE 3: Escuta de Eventos do DOM
//=======================================================================================

//Selecionamos o formulário pelo ID
const formProduto = document.getElementById("produto-form");

//adicionar um escutador de eventos para quando o formulário for enviado  
formProduto.addEventListener("submit",function(event){
    event.preventDefault();

    //1.captura dos valores digitados nos campos de input
    const nomeInput = document.getElementById("nome").value;
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;

    //2. Criar uma nova instância da classe Produto
    const novoProduto = new Produto(nomeInput,precoInput,quantidadeInput);


    //3.Adiciona o novo produto ao array
    listaDeProdutos.push(novoProduto);

    //4. atualiza a exibição da tabela e limpa o formulário
    renderizarTabela();
    formProduto.reset();
});

//=======================================================================================
//FASE 4: Renderização da Interface DOM
//=======================================================================================

//função responsável por desenhar na tela o estado
//atual do array listDeProdutos
function renderizarTabela(){
    //seleciona o corpo da tabela (tbody)
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    //limpa o conteúdo anterior da tabela
    tabelaBody.innerHTML = "";

    //percorre o array de produtos usando forEach
    listaDeProdutos.forEach((produto)=>{
        //criar uam linha tr dentro da tabela
        const linha = document.createElement("tr");

        //preenche o conteúdo da linha com os dados do objeto
        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-remover">Remover</button>
            </td>
        `;

        //insere a linha criada dentro do tbody da tabela
        tabelaBody.appendChild(linha);
    })
}

//=======================================================================================
//Desafio 2: Indicadores Financeiros do Estoque (Regra de Negócio + Reduce)
//=======================================================================================

function atualizarTotalEstoque(){
     // Usa o reduce para somar o preço multiplicado pela quantidade de cada item
    const valorTotal = listaDeProdutos.reduce((acumulador, produto) => {
        return acumulador + (produto.preco * produto.quantidade);
    }, 0);

    // Formata o valor para o padrão de moeda brasileira (R$)
    const valorFormatado = valorTotal.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    // Atualiza o texto do elemento HTML com id 'total-estoque'
    const elementoH3 = document.getElementById('total-estoque');
    if (elementoH3) {
        elementoH3.textContent = `Total em Estoque: ${valorFormatado}`;
    }
}
// Chame a função para atualizar a tela assim que necessário
atualizarTotalEstoque();

//=======================================================================================
//Desafio 3: Gestão Dinâmica (Remoção Individual e Limpeza Total)
//=======================================================================================

function renderizarTabela(){
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    tabelaBody.innerHTML = "";

    listaDeProdutos.forEach((produto, index)=>{
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-remover" onclick="removerProduto(${index})">Remover</button>
            </td>
        `;

        tabelaBody.appendChild(linha);
    });

    // Atualiza o total sempre que a tabela for renderizada
    atualizarTotalEstoque();
}
function removerProduto(index) {
    listaDeProdutos.splice(index, 1);

    renderizarTabela();
}
const botaoLimpar = document.getElementById("limpar-tabela");

botaoLimpar.addEventListener("click", function() {
    listaDeProdutos.length = 0;

    renderizarTabela();
});