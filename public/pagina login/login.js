document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector("button");
  btn.addEventListener("click", async () => {
    const email = document.querySelector("input[type=email]").value.trim();
    const senha = document.querySelector("input[type=password]").value.trim();

    if (!email || !senha) {
      alert("Preencha email e senha.");
      return;
    }

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("userName", data.nome); // Novo: Salva o nome
        localStorage.setItem("userId", data.id_usuario);
        localStorage.setItem("userTipo", data.tipo);
        window.location.href = "/itens-perdidos";
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Erro ao logar:", err);
      alert("Erro ao conectar com o servidor.");
    }
  });
});
