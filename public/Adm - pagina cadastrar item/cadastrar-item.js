const botaoMenu = document.getElementById("btn-menu");
const menuLateral = document.getElementById("menuLateral");
const content = document.querySelector(".formulario-cadastrar");

botaoMenu.addEventListener("click", (e) => {
  e.stopPropagation(); // Previne a propagação do evento
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
    menuLateral.classList.remove("aberto");
    content.classList.remove("expanded");
  }
});

// Preencher os selects dinamicamente com as categorias e locais atualizados
document.addEventListener("DOMContentLoaded", function () {
  // Dados atualizados para os selects
  const locais = [
    "Laboratório",
    "Biblioteca",
    "Sala 201",
    "Sala 202",
    "Corredor 01",
    "Corredor 02",
  ];
  const categorias = [
    "Dispositivo eletrônico",
    "Roupas e calçados",
    "Acessórios",
    "Utensílios",
    "Documentos",
    "Bolsas e Mochilas",
    "Chaves",
    "Material escolar",
    "Outros",
  ];

  const localSelect = document.getElementById("local");
  const categoriaSelect = document.getElementById("categoria");

  // Limpar options existentes e adicionar novas opções
  if (localSelect) {
    localSelect.innerHTML = '<option value="">Selecione um local</option>';
    locais.forEach((local) => {
      const option = document.createElement("option");
      option.textContent = local;
      option.value = local;
      localSelect.appendChild(option);
    });
  }

  if (categoriaSelect) {
    categoriaSelect.innerHTML =
      '<option value="">Selecione uma categoria</option>';
    categorias.forEach((categoria) => {
      const option = document.createElement("option");
      option.textContent = categoria;
      option.value = categoria;
      categoriaSelect.appendChild(option);
    });
  }

  // Validação e envio do formulário para o backend
  const form = document.querySelector(".formulario-cadastrar");
  if (form) {
    const submitButton = form.querySelector("button[type='submit']");

    if (submitButton) {
      submitButton.addEventListener("click", async function (e) {
        e.preventDefault();

        const nomeProduto = document.getElementById("nome-produto");
        const local = document.getElementById("local");
        const categoria = document.getElementById("categoria");
        const descricao = document.getElementById("descricao");
        const dataEncontro = document.getElementById("data-encontro");

        let isValid = true;

        // Validação simples
        if (!nomeProduto.value.trim()) {
          nomeProduto.style.borderColor = "red";
          isValid = false;
        } else {
          nomeProduto.style.borderColor = "#c0c0c0";
        }

        if (!local.value || local.selectedIndex === 0) {
          local.style.borderColor = "red";
          isValid = false;
        } else {
          local.style.borderColor = "#c0c0c0";
        }

        if (!categoria.value || categoria.selectedIndex === 0) {
          categoria.style.borderColor = "red";
          isValid = false;
        } else {
          categoria.style.borderColor = "#c0c0c0";
        }

        if (!descricao.value.trim()) {
          descricao.style.borderColor = "red";
          isValid = false;
        } else {
          descricao.style.borderColor = "#c0c0c0";
        }

        if (!dataEncontro.value) {
          dataEncontro.style.borderColor = "red";
          isValid = false;
        } else {
          dataEncontro.style.borderColor = "#c0c0c0";
        }

        if (isValid) {
          // Obter id_usuario e tipo_usuario do localStorage
          const id_usuario = localStorage.getItem("userId");
          const tipo_usuario = localStorage.getItem("userTipo");

          if (!id_usuario || tipo_usuario !== "admin") {
            alert(
              "Você precisa estar logado como administrador para cadastrar itens."
            );
            return;
          }

          // Preparar dados para envio
          const data = {
            nome: nomeProduto.value.trim(),
            local: local.value,
            data_encontro: dataEncontro.value,
            categoria: categoria.value,
            descricao: descricao.value.trim(),
            id_usuario,
            tipo_usuario,
          };

          try {
            const response = await fetch("/items", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            });

            if (response.ok) {
              alert("Item cadastrado com sucesso!");
              form.reset();
            } else {
              const error = await response.json();
              alert(error.message || "Erro ao cadastrar item.");
            }
          } catch (err) {
            console.error("Erro na requisição:", err);
            alert("Erro ao conectar com o servidor.");
          }
        } else {
          alert("Por favor, preencha todos os campos obrigatórios.");
        }
      });
    }
  }
});

// Melhorar a experiência em dispositivos móveis
document.addEventListener("DOMContentLoaded", function () {
  // Prevenir zoom em inputs em iOS
  if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
    const inputs = document.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.addEventListener("focus", function () {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
      });
    });
  }

  // Fechar teclado virtual ao rolar a página (melhoria para mobile)
  window.addEventListener("scroll", function () {
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
  });
});
