document.addEventListener("DOMContentLoaded", () => {
  const cadastrarBtn = document.getElementById("cadastrarBtn");

  cadastrarBtn.addEventListener("click", async () => {
    const nome = document.getElementById("nome").value;
    const ra = document.getElementById("ra").value;
    const email = document.getElementById("email").value;
    const telefone = document.getElementById("telefone").value;
    const senha = document.getElementById("senha").value;

    if (!nome || !ra || !email || !senha) {
      alert("Todos os campos obrigatórios devem ser preenchidos.");
      return;
    }

    // Verificação do e-mail
    let emailDomain;
    if (ra.startsWith("0001")) {
      // Aluno
      emailDomain = "@senaimgaluno.com.br";
    } else {
      // Docente
      emailDomain = "@senaimgdocente.com.br";
    }

    if (!email.endsWith(emailDomain)) {
      alert(`Por favor, insira um e-mail do domínio ${emailDomain}`);
      return;
    }

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, ra, email, telefone, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        // Redirecionar para a área de login
        window.location.href = "http://localhost:3000/login";
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      alert(
        "Ocorreu um erro ao tentar cadastrar. Verifique sua conexão ou tente novamente."
      );
    }
  });
});
