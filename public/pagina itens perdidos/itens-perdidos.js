// itens-perdidos.js (Frontend JavaScript atualizado com validação opcional para tipo de imagem)

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
  if (window.innerWidth > 900) {
    menuLateral.classList.remove("aberto");
    menuLateral.classList.remove("escondido"); // Garante que o menu fique visível no desktop
  } else {
    menuLateral.classList.remove("escondido");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Recuperar userId do localStorage (armazenado após login)
  let userId = localStorage.getItem("userId");
  if (userId) {
    userId = parseInt(userId); // Garante que seja número
  }
  // Não alert aqui - permite acesso à página sem login, só barra requisições

  const itemContainer = document.querySelector(".item-container");
  const contactContainer = document.querySelector(".contact-container");
  const overlay = document.querySelector(".overlay");
  const voltarButtons = document.querySelectorAll(".voltar");
  const contactLink = document.querySelector("#open-contact");
  const fileInput = document.getElementById("imagem");
  const contactFileInput = document.getElementById("contact-imagem");
  const fileNameSpan = document.querySelector(".item-container .file-name");
  const contactFileNameSpan = document.querySelector(
    ".contact-container .file-name"
  );
  const submitBtn = document.querySelector(".item-container button");
  const contactSubmitBtn = document.querySelector(".contact-container button");
  let items = []; // Armazenar itens do banco
  let currentItemId = null;

  // Função para formatar data YYYY-MM-DD para DD/MM/YYYY
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  }

  // Função para obter ícone baseado na categoria
  function getIconForCategory(cat) {
    const map = {
      Utensílios: "fa-mug-saucer",
      "Roupas e calçados": "fa-shirt",
      "Dispositivo eletrônico": "fa-mobile-screen",
      "Material escolar": "fa-pencil",
      Acessórios: "fa-glasses",
      Chaves: "fa-key",
      "Bolsas e Mochilas": "fa-briefcase",
      Documentos: "fa-address-card",
      Outros: "fa-box-archive",
    };
    return map[cat] || "fa-question";
  }

  // Buscar itens do banco e gerar cards dinamicamente
  fetch("/items")
    .then((res) => res.json())
    .then((data) => {
      items = data;
      const lostItems = items.filter((item) => item.status === "PENDENTE");
      const grid = document.querySelector(".grid-container");
      lostItems.forEach((item) => {
        const card = document.createElement("div");
        card.classList.add("card");
        const icon = getIconForCategory(item.categoria);
        card.innerHTML = `
          <i class="fa-solid ${icon} card-icon"></i>
          <div class="card-title">${item.nome}</div>
          <div class="card-desc">Encontrado em ${item.local}</div>
          <div class="category-label">${item.categoria}</div>
          <div class="card-date">${formatDate(item.data_encontro)}</div>
        `;
        card.dataset.id = item.id;
        grid.appendChild(card);
      });

      // Após gerar cards, adicionar eventos de clique
      const cards = document.querySelectorAll(".card");
      cards.forEach((card) => {
        card.addEventListener("click", () => {
          currentItemId = card.dataset.id;
          const item = items.find((i) => i.id == currentItemId);
          if (item) {
            const icon = getIconForCategory(item.categoria);
            itemContainer.querySelector("h2").innerHTML = `
              <i class="fa-solid ${icon} card-icon"></i>
              ${item.nome}
            `;
            itemContainer.querySelector(
              ".item-local"
            ).innerHTML = `<strong>Local:</strong> ${item.local}`;
            itemContainer.querySelector(
              ".item-data"
            ).innerHTML = `<strong>Data:</strong> ${formatDate(
              item.data_encontro
            )}`;
            itemContainer.querySelector(
              ".item-categoria"
            ).innerHTML = `<strong>Categoria:</strong> ${item.categoria}`;
          }
          itemContainer.classList.add("active");
          overlay.style.display = "block";
        });
      });

      // Atualizar applyAllFilters para funcionar com cards dinâmicos
      applyAllFilters(); // Aplicar filtros iniciais se houver
    })
    .catch((err) => console.error("Erro ao buscar itens:", err));

  // Abrir contact-container ao clicar em "Entre em contato aqui"
  contactLink.addEventListener("click", (e) => {
    e.preventDefault();
    contactContainer.classList.add("active", "item-desconhecido");
    overlay.style.display = "block";
  });

  // Fechar containers ao clicar no botão Voltar
  voltarButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      itemContainer.classList.remove("active");
      contactContainer.classList.remove("active", "item-desconhecido");
      overlay.style.display = "none";
    });
  });

  // Fechar ao clicar no overlay
  overlay.addEventListener("click", () => {
    itemContainer.classList.remove("active");
    contactContainer.classList.remove("active", "item-desconhecido");
    overlay.style.display = "none";
  });

  // Exibir o nome do arquivo selecionado para item-container
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      fileNameSpan.textContent = file.name;
    } else {
      fileNameSpan.textContent = "Escolher arquivo";
    }
  });

  // Exibir o nome do arquivo selecionado para contact-container
  contactFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      contactFileNameSpan.textContent = file.name;
    } else {
      contactFileNameSpan.textContent = "Escolher arquivo";
    }
  });

  // Enviar requisição ao clicar em "Enviar" no item-container
  submitBtn.addEventListener("click", () => {
    const desc = itemContainer.querySelector("textarea").value.trim();
    if (!desc) {
      alert("Descreva o item com detalhes.");
      return;
    }
    if (!userId) {
      alert("Você precisa estar logado para fazer requisições.");
      return;
    }
    const file = fileInput.files[0];
    if (file && !file.type.startsWith("image/")) {
      alert("Por favor, selecione uma imagem válida.");
      return;
    }
    const formData = new FormData();
    formData.append("id_item", currentItemId);
    formData.append("id_usuario", userId);
    formData.append("descricao", desc);
    if (file) {
      formData.append("imagem", file);
    }
    fetch("/requisicoes", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        alert(data.message);
        // Limpar formulário e fechar container
        itemContainer.querySelector("textarea").value = "";
        fileInput.value = "";
        fileNameSpan.textContent = "Escolher arquivo";
        itemContainer.classList.remove("active");
        overlay.style.display = "none";
      })
      .catch((err) => {
        console.error("Erro ao enviar requisição:", err);
        alert("Erro ao enviar. Tente novamente.");
      });
  });

  // Enviar requisição ao clicar em "Enviar" no contact-container
  contactSubmitBtn.addEventListener("click", () => {
    const desc = contactContainer.querySelector("textarea").value.trim();
    if (!desc) {
      alert("Descreva o item com detalhes.");
      return;
    }
    if (!userId) {
      alert("Você precisa estar logado para fazer requisições.");
      return;
    }
    const category = contactContainer.querySelector(
      ".selects select:nth-child(1)"
    ).value;
    const local = contactContainer.querySelector(
      ".selects select:nth-child(2)"
    ).value;
    const date = contactContainer.querySelector(
      ".selects input[type='date']"
    ).value;
    let fullDesc = desc;
    if (category) fullDesc += `\nCategoria: ${category}`;
    if (local) fullDesc += `\nLocal: ${local}`;
    if (date) fullDesc += `\nData: ${date}`;
    const file = contactFileInput.files[0];
    if (file && !file.type.startsWith("image/")) {
      alert("Por favor, selecione uma imagem válida.");
      return;
    }
    const formData = new FormData();
    formData.append("id_item", ""); // Vazio para null
    formData.append("id_usuario", userId);
    formData.append("descricao", fullDesc);
    if (file) {
      formData.append("imagem", file);
    }
    fetch("/requisicoes", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        alert(data.message);
        // Limpar formulário e fechar container
        contactContainer.querySelector("textarea").value = "";
        contactContainer.querySelector(
          ".selects select:nth-child(1)"
        ).selectedIndex = 0;
        contactContainer.querySelector(
          ".selects select:nth-child(2)"
        ).selectedIndex = 0;
        contactContainer.querySelector(".selects input[type='date']").value =
          "";
        contactFileInput.value = "";
        contactFileNameSpan.textContent = "Escolher arquivo";
        contactContainer.classList.remove("active", "item-desconhecido");
        overlay.style.display = "none";
      })
      .catch((err) => {
        console.error("Erro ao enviar requisição:", err);
        alert("Erro ao enviar. Tente novamente.");
      });
  });

  // Selecionar o ícone de filtro e a div de filtros
  const filterIcon = document.querySelector(".icon-filter");
  const filtrosDiv = document.querySelector(".filtros");

  // Função para posicionar a div .filtros ao lado do ícone
  function posicionarFiltros() {
    const rect = filterIcon.getBoundingClientRect();
    const margem = 5; // Margem entre o ícone e a div
    const filtrosWidth = 220; // Largura da div .filtros, conforme CSS
    // Verifica se há espaço à direita
    if (rect.right + filtrosWidth + margem <= window.innerWidth) {
      filtrosDiv.style.left = `${rect.right + window.scrollX + margem}px`; // À direita do ícone
    } else {
      filtrosDiv.style.left = `${
        rect.left + window.scrollX - filtrosWidth - margem
      }px`; // À esquerda do ícone
    }
    filtrosDiv.style.top = `${rect.top + window.scrollY}px`; // Alinha ao topo do ícone
  }

  // Evento de clique no ícone de filtro
  filterIcon.addEventListener("click", (e) => {
    e.stopPropagation(); // Evita que o clique no ícone feche a div imediatamente
    filtrosDiv.classList.toggle("active"); // Alterna a visibilidade
    if (filtrosDiv.classList.contains("active")) {
      posicionarFiltros(); // Posiciona a div quando ela é mostrada
    }
  });

  // Fechar a div .filtros ao clicar fora dela
  document.addEventListener("click", (e) => {
    if (!filtrosDiv.contains(e.target) && !filterIcon.contains(e.target)) {
      filtrosDiv.classList.remove("active");
    }
  });

  // Reposicionar a div .filtros ao redimensionar a janela
  window.addEventListener("resize", () => {
    if (filtrosDiv.classList.contains("active")) {
      posicionarFiltros();
    }
  });

  // Reposicionar a div .filtros ao rolar a página
  window.addEventListener("scroll", () => {
    if (filtrosDiv.classList.contains("active")) {
      posicionarFiltros();
    }
  });

  // Funcionalidade de busca e filtros integrada
  const searchInput = document.querySelector(".input-wrapper input"); // Input de busca
  const searchButton = document.querySelector(".icon-search"); // Ícone de busca
  const categorySelect = document.querySelector(".filtros select:nth-child(1)"); // Select de categoria
  const locationSelect = document.querySelector(".filtros select:nth-child(2)"); // Select de local
  const dateInput = document.querySelector(".filtros #filtro-data"); // Input de data
  const clearButton = document.querySelector(".filtros button"); // Botão de limpar filtros

  // Função auxiliar para remover acentos e normalizar strings
  function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Função para aplicar todos os filtros (busca + categoria + local + data)
  function applyAllFilters() {
    const allCards = document.querySelectorAll(".card"); // Cards dinâmicos
    const query = searchInput.value.trim().toLowerCase();
    const normalizedQuery = removeAccents(query);

    allCards.forEach((card) => {
      let show = true;

      // Verifica busca (se query não vazio)
      if (query) {
        const title = card
          .querySelector(".card-title")
          .textContent.toLowerCase();
        const normalizedTitle = removeAccents(title);
        if (!normalizedTitle.includes(normalizedQuery)) {
          show = false;
        }
      }

      // Verifica categoria (se selecionada algo além da opção default)
      if (categorySelect.selectedIndex > 0) {
        const selectedCat = categorySelect.value.trim();
        const cardCat = card
          .querySelector(".category-label")
          .textContent.trim();
        if (cardCat.toLowerCase() !== selectedCat.toLowerCase()) {
          show = false;
        }
      }

      // Verifica local (se selecionado algo além da opção default)
      if (locationSelect.selectedIndex > 0) {
        const selectedLoc = locationSelect.value.trim().toLowerCase();
        const desc = card.querySelector(".card-desc").textContent.toLowerCase();
        const normalizedLoc = removeAccents(selectedLoc);
        const normalizedDesc = removeAccents(desc);
        if (!normalizedDesc.includes(normalizedLoc)) {
          show = false;
        }
      }

      // Verifica data (se valor selecionado)
      if (dateInput.value) {
        const selectedDate = new Date(dateInput.value);
        const cardDateStr = card.querySelector(".card-date").textContent.trim();
        const [dd, mm, yyyy] = cardDateStr.split("/");
        const cardDate = new Date(`${yyyy}-${mm}-${dd}`);
        if (cardDate.getTime() !== selectedDate.getTime()) {
          show = false;
        }
      }

      card.style.display = show ? "block" : "none";
    });
  }

  // Evento de clique no ícone de busca
  searchButton.addEventListener("click", applyAllFilters);

  // Evento de tecla Enter no input de busca
  searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      applyAllFilters();
    }
  });

  // Eventos para aplicar filtros ao mudar as seleções
  categorySelect.addEventListener("change", applyAllFilters);
  locationSelect.addEventListener("change", applyAllFilters);
  dateInput.addEventListener("change", applyAllFilters);

  // Evento para limpar filtros
  clearButton.addEventListener("click", () => {
    categorySelect.selectedIndex = 0;
    locationSelect.selectedIndex = 0;
    dateInput.value = "";
    applyAllFilters(); // Aplica novamente para mostrar todos (considerando busca, se aplicada)
  });
});
