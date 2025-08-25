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
