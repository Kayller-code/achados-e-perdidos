document.addEventListener("DOMContentLoaded", () => {
  const botaoMenu = document.getElementById("btn-menu");
  const menuLateral = document.getElementById("menuLateral");
  const content = document.querySelector(".content");
  const userInfo = document.querySelector(".info-usuario");
  const dropdownMenu = document.querySelector(".dropdown-menu");
  const logoutLink = document.querySelector(".logout");

  // Lógica para abrir/fechar o menu lateral
  botaoMenu.addEventListener("click", () => {
    if (window.innerWidth <= 900) {
      // Mobile: abre/fecha menu lateral sobre o conteúdo
      menuLateral.classList.toggle("aberto");
    } else {
      // Desktop: mostra/esconde menu lateral
      menuLateral.classList.toggle("escondido");
      content.classList.toggle("expanded");
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
      content.classList.remove("expanded");
    } else {
      menuLateral.classList.remove("escondido");
      content.classList.remove("expanded");
    }
  });

  // Mostrar/esconder dropdown ao clicar no nome do usuário
  userInfo.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("active");
  });

  // Fechar o dropdown ao clicar fora
  document.addEventListener("click", (e) => {
    if (!userInfo.contains(e.target)) {
      dropdownMenu.classList.remove("active");
    }
  });

  // Lógica de logout
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("userSession");
    window.location.href = "login.html";
  });
});
