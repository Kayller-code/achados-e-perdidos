const botaoMenu = document.getElementById("btn-menu");
const menuLateral = document.getElementById("menuLateral");
const gridContainer = document.getElementById("grid-container");
const analiseContainer = document.getElementById("analise-container");
const overlay = document.querySelector(".overlay");
const voltarButtons = document.querySelectorAll(".voltar");
const filterIcon = document.querySelector(".icon-filter");
const filtrosDiv = document.querySelector(".filtros");
const ordenarPor = document.getElementById("ordenar-por");
const analiseTitulo = document.getElementById("analise-titulo");
const analiseLocal = document.getElementById("analise-local");
const analiseData = document.getElementById("analise-data");
const analiseCategoria = document.getElementById("analise-categoria");
const analiseDescricao = document.getElementById("analise-descricao");
const analiseImagem = document.getElementById("analise-imagem");
const solicitacoesContainer = document.getElementById("solicitacoes-container");
const searchInput = document.querySelector(".input-wrapper input");
const filtroCategoria = document.querySelector(".filtros select:nth-child(1)");
const filtroLocal = document.querySelector(".filtros select:nth-child(2)");
const filtroData = document.getElementById("filtro-data");
const botaoLimparFiltros = document.querySelector(".filtros button");

// Função para buscar itens com contagem de solicitações do backend
async function fetchItens() {
  try {
    const response = await fetch("/admin/items-with-requests");
    if (!response.ok) throw new Error("Erro ao buscar itens");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Função para buscar detalhes de um item e suas solicitações
async function fetchItemDetails(itemId) {
  try {
    const response = await fetch(`/admin/item/${itemId}/requests`);
    if (!response.ok) throw new Error("Erro ao buscar detalhes do item");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Função para aprovar uma solicitação
async function approveRequest(itemId, reqId) {
  try {
    const response = await fetch(`/admin/request/${reqId}/approve`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Erro ao aprovar");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Função para reprovar uma solicitação
async function rejectRequest(itemId, reqId) {
  try {
    const response = await fetch(`/admin/request/${reqId}/reject`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Erro ao reprovar");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Função para filtrar itens com base nos critérios
function filtrarItens(itens, termoPesquisa, categoria, local, data) {
  return itens.filter((item) => {
    const termoMatch =
      termoPesquisa === "" ||
      item.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      item.descricao.toLowerCase().includes(termoPesquisa.toLowerCase());
    const categoriaMatch =
      categoria === "Selecione a categoria" ||
      !categoria ||
      item.categoria === categoria;
    const localMatch =
      local === "Selecione o local" || !local || item.local === local;
    const dataMatch = !data || item.data_encontro.split("T")[0] === data;

    return termoMatch && categoriaMatch && localMatch && dataMatch;
  });
}

// Função para renderizar os cards na página
async function renderizarCards(criterio = "solicitacoes") {
  let itens = await fetchItens();
  const termoPesquisa = searchInput.value.trim();
  const categoria = filtroCategoria.value;
  const local = filtroLocal.value;
  const data = filtroData.value;

  itens = filtrarItens(itens, termoPesquisa, categoria, local, data);
  itens = ordenarItens(itens, criterio);
  gridContainer.innerHTML = "";

  itens.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = item.id_item;

    let cardHTML = `
      <i class="${getIconeByCategoria(item.categoria)} card-icon"></i>
      <div class="card-title">${item.nome}</div>
      <div class="card-desc">${item.descricao}</div>
      <div class="category-label">${item.categoria}</div>
      <div class="card-date">${formatDate(item.data_encontro)}</div>
    `;

    if (item.solicitacoes > 0) {
      cardHTML += `<div class="notificacao-badge">${item.solicitacoes}</div>`;
    }

    card.innerHTML = cardHTML;
    gridContainer.appendChild(card);
  });

  // Adicionar event listeners aos cards
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", async () => {
      const itemId = card.dataset.id;
      const itemDetails = await fetchItemDetails(itemId);
      if (itemDetails) {
        carregarSolicitacoes(itemDetails);
        analiseContainer.classList.add("active");
        overlay.style.display = "block";
      }
    });
  });
}

// Função para carregar as solicitações de um item
function carregarSolicitacoes(item) {
  analiseTitulo.innerHTML = `<i class="${getIconeByCategoria(
    item.categoria
  )}"></i> ${item.nome} - Solicitações`;
  analiseLocal.innerHTML = `<strong>Local:</strong> ${item.local}`;
  analiseData.innerHTML = `<strong>Data:</strong> ${formatDate(
    item.data_encontro
  )}`;
  analiseCategoria.innerHTML = `<strong>Categoria:</strong> ${item.categoria}`;
  analiseDescricao.innerHTML = `<strong>Descrição Original:</strong> ${item.descricao}`;

  if (item.imagem) {
    analiseImagem.src = item.imagem;
    analiseImagem.style.display = "block";
  } else {
    analiseImagem.style.display = "none";
  }

  if (item.solicitacoes === 0) {
    solicitacoesContainer.innerHTML =
      '<div class="sem-solicitacoes">Nenhuma solicitação para este item</div>';
    return;
  }

  let html = "";
  item.solicitacoesDetalhes.forEach((solicitacao, index) => {
    html += `
      <div class="solicitacao" data-index="${index}" data-req-id="${
      solicitacao.id_requisicao
    }">
        <div class="solicitacao-info">
          <p><strong>Usuário:</strong> ${solicitacao.usuario_nome}</p>
          <p><strong>Data da solicitação:</strong> ${formatDate(
            solicitacao.criado_em
          )}</p>
        </div>
        <div class="solicitacao-descricao">
          <strong>Descrição:</strong> ${solicitacao.descricao}
        </div>
        ${
          solicitacao.imagem
            ? `<img src="${solicitacao.imagem}" alt="Imagem do item enviada pelo usuário" class="solicitacao-imagem" onerror="this.style.display='none'">`
            : ""
        }
        <div class="solicitacao-acoes">
          <button class="btn-aprovar" data-item="${
            item.id_item
          }" data-req-id="${solicitacao.id_requisicao}">Aprovar</button>
          <button class="btn-reprovar" data-item="${
            item.id_item
          }" data-req-id="${solicitacao.id_requisicao}">Reprovar</button>
        </div>
      </div>
    `;
  });

  solicitacoesContainer.innerHTML = html;

  // Adicionar event listeners aos botões
  document.querySelectorAll(".btn-aprovar").forEach((btn) => {
    btn.addEventListener("click", handleAprovar);
  });

  document.querySelectorAll(".btn-reprovar").forEach((btn) => {
    btn.addEventListener("click", handleReprovar);
  });
}

// Função para ordenar os itens
function ordenarItens(itens, criterio) {
  const itensOrdenados = [...itens];

  switch (criterio) {
    case "solicitacoes":
      return itensOrdenados.sort((a, b) => b.solicitacoes - a.solicitacoes);
    case "data-recente":
      return itensOrdenados.sort(
        (a, b) => new Date(b.data_encontro) - new Date(a.data_encontro)
      );
    case "data-antiga":
      return itensOrdenados.sort(
        (a, b) => new Date(a.data_encontro) - new Date(b.data_encontro)
      );
    case "alfabetica":
      return itensOrdenados.sort((a, b) => a.nome.localeCompare(b.nome));
    default:
      return itensOrdenados;
  }
}

// Manipular aprovação de solicitação
async function handleAprovar(e) {
  const itemId = e.target.dataset.item;
  const reqId = e.target.dataset.reqId;

  if (await approveRequest(itemId, reqId)) {
    alert("Solicitação aprovada! Outras foram rejeitadas.");
    await renderizarCards(ordenarPor.value);
    const itemDetails = await fetchItemDetails(itemId);
    carregarSolicitacoes(itemDetails);
  } else {
    alert("Erro ao aprovar solicitação.");
  }
}

// Manipular reprovação de solicitação
async function handleReprovar(e) {
  const itemId = e.target.dataset.item;
  const reqId = e.target.dataset.reqId;

  if (await rejectRequest(itemId, reqId)) {
    alert("Solicitação reprovada!");
    await renderizarCards(ordenarPor.value);
    const itemDetails = await fetchItemDetails(itemId);
    carregarSolicitacoes(itemDetails);
  } else {
    alert("Erro ao reprovar solicitação.");
  }
}

// Função auxiliar para formatar data (YYYY-MM-DD para DD/MM/YYYY)
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR");
}

// Função auxiliar para obter ícone baseado na categoria
function getIconeByCategoria(categoria) {
  const icones = {
    "Dispositivo eletrônico": "fa-solid fa-mobile-screen",
    Utensílios: "fa-solid fa-mug-saucer",
    "Roupas e calçados": "fa-solid fa-shirt",
    "Material escolar": "fa-solid fa-pencil",
    Acessórios: "fa-solid fa-glasses",
    Chaves: "fa-solid fa-key",
    "Bolsas e Mochilas": "fa-solid fa-briefcase",
    Documentos: "fa-solid fa-id-card",
    Outros: "fa-solid fa-question",
  };
  return icones[categoria] || "fa-solid fa-question";
}

// Função para limpar os filtros
function limparFiltros() {
  searchInput.value = "";
  filtroCategoria.selectedIndex = 0;
  filtroLocal.selectedIndex = 0;
  filtroData.value = "";
  renderizarCards(ordenarPor.value);
}

// Inicializar a página
document.addEventListener("DOMContentLoaded", () => {
  // Verificar se o usuário está logado e é admin (já feito em comum.js)
  const userName = localStorage.getItem("userName");
  const userTipo = localStorage.getItem("userTipo");

  if (userName && userTipo === "admin") {
    // Prosseguir com a inicialização apenas se logado e admin
    inicializarPagina();
  }
  // O redirecionamento para /login ou /itens-perdidos é tratado no comum.js
});

function inicializarPagina() {
  // Renderizar cards inicialmente
  renderizarCards("solicitacoes");

  // Event listener para o select de ordenação
  ordenarPor.addEventListener("change", () => {
    renderizarCards(ordenarPor.value);
  });

  // Event listeners para os filtros
  searchInput.addEventListener("input", () => {
    renderizarCards(ordenarPor.value);
  });

  filtroCategoria.addEventListener("change", () => {
    renderizarCards(ordenarPor.value);
  });

  filtroLocal.addEventListener("change", () => {
    renderizarCards(ordenarPor.value);
  });

  filtroData.addEventListener("change", () => {
    renderizarCards(ordenarPor.value);
  });

  botaoLimparFiltros.addEventListener("click", limparFiltros);

  // Menu lateral
  botaoMenu.addEventListener("click", () => {
    if (window.innerWidth <= 900) {
      menuLateral.classList.toggle("aberto");
    } else {
      menuLateral.classList.toggle("escondido");
    }
  });

  // Fecha menu lateral mobile ao clicar fora dele
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 900) {
      if (!menuLateral.contains(e.target) && !botaoMenu.contains(e.target)) {
        menuLateral.classList.remove("aberto");
      }
    }
  });

  // Ajusta o menu lateral no redimensionamento da janela
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      menuLateral.classList.remove("aberto");
      menuLateral.classList.remove("escondido");
    } else {
      menuLateral.classList.remove("escondido");
    }
  });

  // Fechar container ao clicar no botão Voltar
  voltarButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      analiseContainer.classList.remove("active");
      overlay.style.display = "none";
    });
  });

  // Fechar ao clicar no overlay
  overlay.addEventListener("click", () => {
    analiseContainer.classList.remove("active");
    overlay.style.display = "none";
  });

  // Função para posicionar a div .filtros ao lado do ícone
  function posicionarFiltros() {
    const rect = filterIcon.getBoundingClientRect();
    const margem = 5;
    const filtrosWidth = 220;

    if (rect.right + filtrosWidth + margem <= window.innerWidth) {
      filtrosDiv.style.left = `${rect.right + window.scrollX + margem}px`;
    } else {
      filtrosDiv.style.left = `${
        rect.left + window.scrollX - filtrosWidth - margem
      }px`;
    }
    filtrosDiv.style.top = `${rect.top + window.scrollY}px`;
  }

  // Evento de clique no ícone de filtro
  filterIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    filtrosDiv.classList.toggle("active");
    if (filtrosDiv.classList.contains("active")) {
      posicionarFiltros();
    }
  });

  // Fechar a div .filtros ao clicar fora dela
  document.addEventListener("click", (e) => {
    if (!filtrosDiv.contains(e.target) && !filterIcon.contains(e.target)) {
      filtrosDiv.classList.remove("active");
    }
  });

  // Reposicionar a div .filtros ao redimensionar/rolar a página
  window.addEventListener("resize", () => {
    if (filtrosDiv.classList.contains("active")) {
      posicionarFiltros();
    }
  });

  window.addEventListener("scroll", () => {
    if (filtrosDiv.classList.contains("active")) {
      posicionarFiltros();
    }
  });
}
