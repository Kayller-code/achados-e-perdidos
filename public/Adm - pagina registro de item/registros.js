// TCC/public/Adm - pagina registro de item/registros.js

let registros = []; // Agora vazio, será preenchido via fetch
let paginaAtual = 1;
let itensPorPagina = 9;

// Ajustar itens por página baseado no tamanho da tela
function ajustarItensPorPagina() {
  if (window.innerWidth <= 500) {
    itensPorPagina = 5;
  } else if (window.innerWidth <= 900) {
    itensPorPagina = 7;
  } else {
    itensPorPagina = 9;
  }
}

function formatarDataParaYYYYMMDD(dataString) {
  const data = new Date(dataString);
  if (isNaN(data.getTime())) {
    return null; // Data inválida
  }
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function filtrarRegistros() {
  const nome = document.getElementById("filtro-nome").value.toLowerCase();
  const local = document.getElementById("filtro-local").value;
  const categoria = document.getElementById("filtro-categoria").value;
  const data = document.getElementById("filtro-data").value;
  const status = document.getElementById("filtro-status").value;

  return registros.filter(
    (r) =>
      (nome === "" || r.nome.toLowerCase().includes(nome)) &&
      (local === "" || r.local === local) &&
      (categoria === "" || r.categoria === categoria) &&
      (data === "" || formatarDataParaYYYYMMDD(r.data_encontro) === data) && // Comparação formatada para YYYY-MM-DD
      (status === "" || r.status === status)
  );
}

function renderTabela() {
  const tbody = document.querySelector("#tabela-registros tbody");
  tbody.innerHTML = "";

  const filtrados = filtrarRegistros();
  atualizarContador(filtrados.length);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const pagina = filtrados.slice(inicio, fim);

  // Renderizar tabela (para desktop)
  pagina.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${r.id}</td> <!-- Usar id (mapeado de id_item) -->
            <td>${r.nome}</td>
            <td>${r.local}</td>
            <td>${r.categoria}</td>
            <td>${new Date(r.data_encontro).toLocaleDateString(
              "pt-BR"
            )}</td> <!-- Usar data_encontro -->
            <td>${r.status}</td>
            <td class="detalhes" data-id="${r.id}">VER MAIS</td>
        `;
    tbody.appendChild(tr);
  });

  // Renderizar cards (para mobile)
  renderCardsRegistros(pagina);

  renderPaginacao(filtrados.length);
  adicionarEventosDetalhes();
}

function renderCardsRegistros(registros) {
  const container = document.querySelector(".registros-cards");
  if (!container) return;

  container.innerHTML = "";

  registros.forEach((r) => {
    const card = document.createElement("div");
    card.className = "registro-card";
    card.innerHTML = `
            <div class="registro-card-item">
                <span class="registro-card-label">ID:</span>
                <span class="registro-card-value">${r.id}</span>
            </div>
            <div class="registro-card-item">
                <span class="registro-card-label">Nome:</span>
                <span class="registro-card-value">${r.nome}</span>
            </div>
            <div class="registro-card-item">
                <span class="registro-card-label">Local:</span>
                <span class="registro-card-value">${r.local}</span>
            </div>
            <div class="registro-card-item">
                <span class="registro-card-label">Categoria:</span>
                <span class="registro-card-value">${r.categoria}</span>
            </div>
            <div class="registro-card-item">
                <span class="registro-card-label">Data:</span>
                <span class="registro-card-value">${new Date(
                  r.data_encontro
                ).toLocaleDateString("pt-BR")}</span>
            </div>
            <div class="registro-card-item">
                <span class="registro-card-label">Status:</span>
                <span class="registro-card-value">${r.status}</span>
            </div>
            <div class="registro-card-detalhes">
                <span class="detalhes" data-id="${
                  r.id
                }">VER MAIS DETALHES</span>
            </div>
        `;
    container.appendChild(card);
  });
}

function renderPaginacao(totalItens) {
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);
  const paginacao = document.getElementById("paginacao");
  paginacao.innerHTML = "";

  if (totalPaginas <= 1) return;

  // Botão anterior
  if (paginaAtual > 1) {
    const voltar = document.createElement("span");
    voltar.textContent = "<";
    voltar.classList.add("pagination-btn");
    voltar.onclick = () => {
      paginaAtual--;
      renderTabela();
    };
    paginacao.appendChild(voltar);
  }

  // Lógica para mostrar páginas com ellipsis quando necessário
  const maxBotoesVisiveis = window.innerWidth <= 500 ? 3 : 5;
  let inicioPagina = Math.max(
    1,
    paginaAtual - Math.floor(maxBotoesVisiveis / 2)
  );
  let fimPagina = Math.min(totalPaginas, inicioPagina + maxBotoesVisiveis - 1);

  if (fimPagina - inicioPagina + 1 < maxBotoesVisiveis) {
    inicioPagina = Math.max(1, fimPagina - maxBotoesVisiveis + 1);
  }

  // Botão primeira página
  if (inicioPagina > 1) {
    const primeira = document.createElement("span");
    primeira.textContent = "1";
    primeira.onclick = () => {
      paginaAtual = 1;
      renderTabela();
    };
    paginacao.appendChild(primeira);

    if (inicioPagina > 2) {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      ellipsis.classList.add("pagination-ellipsis");
      paginacao.appendChild(ellipsis);
    }
  }

  // Botões numéricos de página
  for (let i = inicioPagina; i <= fimPagina; i++) {
    const span = document.createElement("span");
    span.textContent = i;
    if (i === paginaAtual) span.classList.add("ativo");
    span.onclick = () => {
      paginaAtual = i;
      renderTabela();
    };
    paginacao.appendChild(span);
  }

  // Botão última página
  if (fimPagina < totalPaginas) {
    if (fimPagina < totalPaginas - 1) {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      ellipsis.classList.add("pagination-ellipsis");
      paginacao.appendChild(ellipsis);
    }

    const ultima = document.createElement("span");
    ultima.textContent = totalPaginas;
    ultima.onclick = () => {
      paginaAtual = totalPaginas;
      renderTabela();
    };
    paginacao.appendChild(ultima);
  }

  // Botão próximo
  if (paginaAtual < totalPaginas) {
    const avancar = document.createElement("span");
    avancar.textContent = ">";
    avancar.classList.add("pagination-btn");
    avancar.onclick = () => {
      paginaAtual++;
      renderTabela();
    };
    paginacao.appendChild(avancar);
  }
}

document
  .querySelectorAll(
    "#filtro-nome, #filtro-local, #filtro-categoria, #filtro-data, #filtro-status"
  )
  .forEach((el) =>
    el.addEventListener("input", () => {
      paginaAtual = 1;
      renderTabela();
    })
  );

// Sidebar Functionality
const botaoMenu = document.getElementById("btn-menu");
const menuLateral = document.getElementById("menuLateral");

botaoMenu.addEventListener("click", () => {
  if (window.innerWidth <= 900) {
    // Mobile: abre/fecha menu lateral sobre o conteúdo
    menuLateral.classList.toggle("aberto");
  } else {
    // Desktop: mostra/esconde menu lateral
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
  ajustarItensPorPagina();
  renderTabela();

  if (window.innerWidth > 900) {
    menuLateral.classList.remove("aberto");
    menuLateral.classList.remove("escondido"); // Garante que o menu fique visível no desktop
  } else {
    menuLateral.classList.remove("escondido");
    if (!menuLateral.classList.contains("aberto")) {
      menuLateral.classList.add("escondido");
    }
  }
});

function adicionarEventosDetalhes() {
  const detalhes = document.querySelectorAll(".detalhes");
  detalhes.forEach((d) => {
    d.addEventListener("click", () => {
      const id = d.getAttribute("data-id");
      const registro = registros.find((r) => r.id === parseInt(id)); // Parse id to number
      if (registro) {
        document.getElementById("popup-nome").textContent = registro.nome;
        document.getElementById("popup-local").textContent = registro.local;
        document.getElementById("popup-categoria").textContent =
          registro.categoria;
        document.getElementById("popup-descricao").textContent =
          registro.descricao ||
          "Descrição detalhada do item " + registro.nome.toLowerCase();
        document.getElementById("popup-data").textContent = new Date(
          registro.data_encontro
        ).toLocaleDateString("pt-BR");
        document.getElementById("popup").style.display = "flex";
      }
    });
  });
}

document.getElementById("fechar-popup").addEventListener("click", () => {
  document.getElementById("popup").style.display = "none";
});

function atualizarContador(total) {
  const contador = document.getElementById("contador-itens");
  contador.textContent = `${total} registros encontrados`;
}

// Inicialização assíncrona para buscar dados do backend
async function init() {
  try {
    const response = await fetch("/items");
    if (!response.ok) {
      throw new Error("Erro ao buscar itens do servidor");
    }
    registros = await response.json();
    ajustarItensPorPagina();
    renderTabela();
  } catch (error) {
    console.error("Erro na inicialização:", error);
    // Opcional: Mostrar mensagem de erro na UI
  }
}

init();
