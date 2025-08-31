const botaoMenu = document.getElementById("btn-menu");
const menuLateral = document.getElementById("menuLateral");

botaoMenu.addEventListener("click", () => {
  if (window.innerWidth <= 900) {
    menuLateral.classList.toggle("aberto");
  } else {
    menuLateral.classList.toggle("escondido");
  }
});

document.addEventListener("click", (e) => {
  if (window.innerWidth <= 900) {
    if (!menuLateral.contains(e.target) && !botaoMenu.contains(e.target)) {
      menuLateral.classList.remove("aberto");
    }
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    menuLateral.classList.remove("aberto");
    menuLateral.classList.remove("escondido");
  } else {
    menuLateral.classList.remove("escondido");
  }
});

function openTab(evt, tabId) {
  const contents = document.querySelectorAll(".tab-content");
  contents.forEach((c) => c.classList.remove("active"));

  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((t) => t.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  evt.target.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.querySelector(
    '.custom-file-upload input[type="file"]'
  );
  const fileName = document.querySelector(".file-name");

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      fileName.textContent =
        fileInput.files.length > 0
          ? fileInput.files[0].name
          : "Escolher arquivo";
    });
  }

  carregarDadosUsuario();
  carregarHistoricos();
});

// Função para carregar dados do usuário e preencher os campos (sem avatar/nome, pois agora comum)
async function carregarDadosUsuario() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("Usuário não autenticado.");
    return;
  }

  try {
    const response = await fetch(`/users/${userId}`);
    if (!response.ok) {
      throw new Error("Erro ao carregar dados do usuário.");
    }
    const user = await response.json();

    document.getElementById("nome-completo").value = user.nome || "";
    document.getElementById("ra").value = user.ra || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("telefone").value = user.telefone || "";
  } catch (error) {
    console.error(error);
    alert("Falha ao carregar informações pessoais.");
  }
}

// Função para carregar históricos de itens e requisições (com classes para status e wrap em .table-container)
async function carregarHistoricos() {
  const userId = localStorage.getItem("userId");
  const userTipo = localStorage.getItem("userTipo");
  if (!userId) return;

  const historicoItens = document.getElementById("historico-itens");
  historicoItens.innerHTML = "";

  if (userTipo === "admin") {
    try {
      const response = await fetch("/items");
      if (!response.ok) throw new Error("Erro ao carregar itens.");
      const itens = await response.json();

      const meusItens = itens.filter(
        (item) => item.id_usuario === parseInt(userId)
      );

      if (meusItens.length === 0) {
        historicoItens.innerHTML = "<p>Nenhum item cadastrado.</p>";
      } else {
        const tableContainer = document.createElement("div");
        tableContainer.classList.add("table-container");

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        thead.innerHTML =
          "<tr><th>Nome</th><th>Local</th><th>Data de Encontro</th><th>Status</th></tr>";
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        meusItens.forEach((item) => {
          const statusClass = `status-${item.status.toLowerCase()}`;
          const tr = document.createElement("tr");
          tr.innerHTML = `<td data-label="Nome">${item.nome}</td><td data-label="Local">${item.local}</td><td data-label="Data de Encontro">${item.data_encontro}</td><td data-label="Status"><span class="status-cell ${statusClass}">${item.status}</span></td>`;
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        historicoItens.appendChild(tableContainer);
      }
    } catch (error) {
      console.error(error);
      historicoItens.innerHTML = "<p>Erro ao carregar histórico de itens.</p>";
    }
  } else {
    historicoItens.innerHTML =
      "<p>Apenas administradores podem visualizar itens cadastrados.</p>";
  }

  const historicoRequisicoes = document.getElementById("historico-requisicoes");
  historicoRequisicoes.innerHTML = "";

  try {
    const response = await fetch(`/requisicoes?userId=${userId}`);
    if (!response.ok) throw new Error("Erro ao carregar requisições.");
    const requisicoes = await response.json();

    if (requisicoes.length === 0) {
      historicoRequisicoes.innerHTML = "<p>Nenhuma requisição enviada.</p>";
    } else {
      const tableContainer = document.createElement("div");
      tableContainer.classList.add("table-container");

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      thead.innerHTML =
        "<tr><th>ID do Item</th><th>Descrição</th><th>Status</th></tr>";
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      requisicoes.forEach((req) => {
        const statusClass = `status-${(req.status || "default").toLowerCase()}`;
        const tr = document.createElement("tr");
        tr.innerHTML = `<td data-label="ID do Item">${req.id_item}</td><td data-label="Descrição">${req.descricao}</td><td data-label="Status"><span class="status-cell ${statusClass}">${req.status || "Pendente"}</span></td>`;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableContainer.appendChild(table);
      historicoRequisicoes.appendChild(tableContainer);
    }
  } catch (error) {
    console.error(error);
    historicoRequisicoes.innerHTML =
      "<p>Erro ao carregar histórico de requisições.</p>";
  }
}

const formAlterarSenha = document.getElementById("form-alterar-senha");
formAlterarSenha.addEventListener("submit", async (e) => {
  e.preventDefault();

  const novaSenha = document.getElementById("nova-senha").value;
  const confirmarSenha = document.getElementById("confirmar-senha").value;
  const userId = localStorage.getItem("userId");

  if (novaSenha !== confirmarSenha) {
    alert("As senhas não coincidem.");
    return;
  }

  try {
    const response = await fetch(`/users/${userId}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha: novaSenha }),
    });

    if (!response.ok) throw new Error("Erro ao alterar senha.");
    alert("Senha alterada com sucesso!");
    formAlterarSenha.reset();
  } catch (error) {
    console.error(error);
    alert("Falha ao alterar senha.");
  }
});

const formInformacoes = document.getElementById("form-informacoes-pessoais");
formInformacoes.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome-completo").value;
  const email = document.getElementById("email").value;
  const telefone = document.getElementById("telefone").value;
  const userId = localStorage.getItem("userId");
  const imagemInput = document.getElementById("imagem");

  try {
    const responseInfo = await fetch(`/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, telefone }),
    });

    if (!responseInfo.ok) throw new Error("Erro ao atualizar informações.");

    if (imagemInput.files.length > 0) {
      const formData = new FormData();
      formData.append("imagem", imagemInput.files[0]);

      const responseUpload = await fetch(`/users/${userId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!responseUpload.ok) {
        const errorData = await responseUpload.json();
        throw new Error(errorData.message || "Erro ao fazer upload da imagem.");
      }
      const uploadData = await responseUpload.json();
      console.log("Caminho da imagem:", uploadData.path);

      // Atualizar avatar imediatamente após upload (substitui o span por img)
      const avatarElem = document.getElementById("avatar-usuario");
      if (avatarElem.tagName.toLowerCase() === "span") {
        avatarElem.outerHTML = `<img id="avatar-usuario" src="${uploadData.path}" alt="Avatar do usuário" class="avatar-usuario">`;
      } else {
        avatarElem.src = uploadData.path;
      }
    }

    alert("Informações atualizadas com sucesso!");
    document.getElementById("nome-usuario").textContent = nome;
    localStorage.setItem("userName", nome);

    imagemInput.value = "";
    document.querySelector(".file-name").textContent = "Escolher arquivo";
  } catch (error) {
    console.error(error);
    alert("Falha ao atualizar informações: " + error.message);
  }
});