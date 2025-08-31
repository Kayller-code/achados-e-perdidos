// comum.js
document.addEventListener("DOMContentLoaded", function () {
  const userName = localStorage.getItem("userName");

  // Forçar login para páginas restritas (exceto /login e /cadastro)
  const currentPath = window.location.pathname;
  if (!userName && currentPath !== "/login" && currentPath !== "/cadastro") {
    window.location.href = "/login";
    return; // Impede execução do resto se redirecionado
  }

  if (userName) {
    carregarAvatarENome(); // Carrega avatar e nome no header (comum a todas as páginas)
  }

  const userTipo = localStorage.getItem("userTipo");

  // Verificação de role para bloquear acesso com alerta e redirect
  if (
    currentPath === "/cadastrar-item" ||
    currentPath === "/meus-registros" ||
    currentPath === "/solicitacoes"
  ) {
    if (userTipo !== "admin") {
      alert("Você precisa ser administrador para acessar esta área.");
      window.location.href = "/itens-perdidos";
    }
  }

  // Função de logout (limpa localStorage e redireciona)
  function fazerLogout() {
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("userTipo");
    window.location.href = "/login";
  }

  // Torna .info-usuario clicável para toggle do menu apenas se logado
  const infoUsuario = document.querySelector(".info-usuario");
  const logoutMenu = document.getElementById("logout-menu");
  const btnLogout = document.getElementById("btn-logout");

  if (userName && infoUsuario && logoutMenu && btnLogout) {
    infoUsuario.addEventListener("click", function (event) {
      event.stopPropagation();
      logoutMenu.classList.toggle("active");
    });

    btnLogout.addEventListener("click", function (event) {
      event.preventDefault();
      fazerLogout();
    });

    document.addEventListener("click", function (event) {
      if (
        !infoUsuario.contains(event.target) &&
        !logoutMenu.contains(event.target)
      ) {
        logoutMenu.classList.remove("active");
      }
    });
  } else if (logoutMenu) {
    logoutMenu.style.display = "none";
  }
});

// Função para carregar avatar e nome no header
async function carregarAvatarENome() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  try {
    const response = await fetch(`/users/${userId}`);
    if (!response.ok) {
      throw new Error("Erro ao carregar dados do usuário.");
    }
    const user = await response.json();

    const nomeUsuario = document.getElementById("nome-usuario");
    if (nomeUsuario) {
      nomeUsuario.textContent = user.nome || "Usuário";
    }

    const avatarElem = document.getElementById("avatar-usuario");
    if (
      user.imagem &&
      avatarElem &&
      avatarElem.tagName.toLowerCase() === "span"
    ) {
      avatarElem.outerHTML = `<img id="avatar-usuario" src="${user.imagem}" alt="Avatar do usuário" class="avatar-usuario">`;
    }
  } catch (error) {
    console.error(error);
  }
}
