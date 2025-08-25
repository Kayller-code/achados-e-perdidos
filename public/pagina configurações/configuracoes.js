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

function openTab(evt, tabId) {
  const contents = document.querySelectorAll(".tab-content");
  contents.forEach((c) => c.classList.remove("active"));

  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((t) => t.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  evt.target.classList.add("active");
}

// Mostrar nome do arquivo escolhido no botão de upload
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.querySelector(
    '.custom-file-upload input[type="file"]'
  );
  const fileName = document.querySelector(".file-name");

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      fileName.textContent =
        fileInput.files.length > 0 ? fileInput.files[0].name : "";
    });
  }
});
