// comum.js (presente em todas as páginas, ajustado para forçar login em páginas restritas e esconder logout se não logado)

document.addEventListener("DOMContentLoaded", function () {
  const userName = localStorage.getItem("userName");

  // Forçar login para páginas restritas (exceto /login e /cadastro)
  const currentPath = window.location.pathname;
  if (!userName && currentPath !== "/login" && currentPath !== "/cadastro") {
    window.location.href = "/login";
    return; // Impede execução do resto se redirecionado
  }

  if (userName) {
    document.getElementById("nome-usuario").textContent = userName;
  }

  const userTipo = localStorage.getItem("userTipo");

  // Verificação de role para bloquear acesso com alerta e redirect (links continuam visíveis)
  if (currentPath === "/cadastrar-item" || currentPath === "/meus-registros") {
    if (userTipo !== "admin") {
      alert("Você precisa ser administrador para acessar esta área.");
      window.location.href = "/itens-perdidos"; // Redireciona para página de itens perdidos
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
      event.stopPropagation(); // Evita propagação
      logoutMenu.classList.toggle("active");
    });

    // Clique no logout executa a função
    btnLogout.addEventListener("click", function (event) {
      event.preventDefault();
      fazerLogout();
    });

    // Fecha o menu se clicar fora
    document.addEventListener("click", function (event) {
      if (
        !infoUsuario.contains(event.target) &&
        !logoutMenu.contains(event.target)
      ) {
        logoutMenu.classList.remove("active");
      }
    });
  } else if (logoutMenu) {
    // Esconder o menu se não logado
    logoutMenu.style.display = "none";
  }
});
