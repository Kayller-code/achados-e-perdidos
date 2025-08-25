// Backend Server Code (sem mudanças)

const fastify = require("fastify")();
const fastifyStatic = require("@fastify/static");
const path = require("path");
const db = require("./database");

// Rota para cadastro de usuários
fastify.post("/register", async (request, reply) => {
  const { nome, ra, email, telefone, senha } = request.body;

  // Validação simples
  if (!nome || !ra || !email || !senha) {
    return reply
      .status(400)
      .send({ message: "Todos os campos são obrigatórios." });
  }

  // Classificar tipo de usuário baseado no RA
  const tipo_usuario = ra.startsWith("0001") ? "usuario" : "admin";

  // Inserir usuário no banco de dados
  const query =
    "INSERT INTO usuarios (nome, ra, email, telefone, senha, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?)";

  try {
    await new Promise((resolve, reject) => {
      db.query(
        query,
        [nome, ra, email, telefone, senha, tipo_usuario],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
    return reply
      .status(201)
      .send({ message: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro ao inserir usuário:", err);
    return reply.status(500).send({
      message:
        "Erro ao cadastrar usuário. Verifique se o RA ou email já existe (devem ser únicos).",
    });
  }
});

// Nova rota para login
fastify.post("/login", async (request, reply) => {
  const { email, senha } = request.body;

  // Validação simples
  if (!email || !senha) {
    return reply
      .status(400)
      .send({ success: false, message: "Email e senha são obrigatórios." });
  }

  // Query para verificar credenciais
  const query = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, [email, senha], (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });

    if (results.length > 0) {
      // Usuário encontrado e senha correta
      return reply.send({
        success: true,
        tipo: results[0].tipo_usuario,
        id_usuario: results[0].id_usuario, // Opcional: pode usar para armazenar no frontend
        nome: results[0].nome,
      });
    } else {
      // Credenciais inválidas
      return reply
        .status(401)
        .send({ success: false, message: "Credenciais inválidas." });
    }
  } catch (err) {
    console.error("Erro ao verificar login:", err);
    return reply
      .status(500)
      .send({ success: false, message: "Erro no servidor." });
  }
});

// Nova rota para cadastro de itens (backend do cadastro de itens)
fastify.post("/items", async (request, reply) => {
  const {
    nome,
    local,
    data_encontro,
    categoria,
    descricao,
    id_usuario,
    tipo_usuario,
  } = request.body;

  // Validação simples
  if (
    !nome ||
    !local ||
    !data_encontro ||
    !categoria ||
    !descricao ||
    !id_usuario ||
    !tipo_usuario
  ) {
    return reply.status(400).send({
      message:
        "Todos os campos são obrigatórios, incluindo id_usuario e tipo_usuario.",
    });
  }

  // Verificar se o usuário é admin
  if (tipo_usuario !== "admin") {
    return reply.status(403).send({
      message: "Acesso negado: Apenas administradores podem cadastrar itens.",
    });
  }

  // Inserir item no banco de dados (imagem é NULL por enquanto, status default 'perdido')
  const query =
    "INSERT INTO itens (id_usuario, nome, local, data_encontro, categoria, descricao, imagem) VALUES (?, ?, ?, ?, ?, ?, NULL)";

  try {
    await new Promise((resolve, reject) => {
      db.query(
        query,
        [id_usuario, nome, local, data_encontro, categoria, descricao],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });
    return reply.status(201).send({ message: "Item cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro ao inserir item:", err);
    return reply.status(500).send({
      message:
        "Erro ao cadastrar item. Verifique se o id_usuario é válido (deve referenciar um usuário admin existente).",
    });
  }
});

// Nova rota para cadastro de requisições
fastify.post("/requisicoes", async (request, reply) => {
  const { id_item, id_usuario, descricao } = request.body;

  // Validação simples
  if (!id_item || !id_usuario || !descricao) {
    return reply.status(400).send({
      message: "ID do item, ID do usuário e descrição são obrigatórios.",
    });
  }

  // Inserir requisição no banco de dados (imagem NULL, status default 'pendente')
  const query =
    "INSERT INTO requisicoes (id_item, id_usuario, descricao, imagem) VALUES (?, ?, ?, NULL)";

  try {
    await new Promise((resolve, reject) => {
      db.query(query, [id_item, id_usuario, descricao], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
    return reply
      .status(201)
      .send({ message: "Requisição enviada com sucesso!" });
  } catch (err) {
    console.error("Erro ao inserir requisição:", err);
    return reply.status(500).send({
      message:
        "Erro ao enviar requisição. Verifique se os IDs são válidos (id_item e id_usuario devem referenciar registros existentes).",
    });
  }
});

// Nova rota para buscar itens do banco de dados
fastify.get("/items", async (request, reply) => {
  const query = "SELECT * FROM itens"; // Para "Meus Registros", ajuste para filtrar por id_usuario quando adicionar autenticação (ex: WHERE id_usuario = ?)

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    // Mapear status do banco ('perdido' -> 'PENDENTE', 'encontrado' -> 'ENCONTRADO')
    const mappedResults = results.map((item) => ({
      ...item,
      id: item.id_item, // Usar id_item como 'id' no frontend
      status: item.status === "perdido" ? "PENDENTE" : "ENCONTRADO",
    }));

    return reply.send(mappedResults);
  } catch (err) {
    console.error("Erro ao buscar itens:", err);
    return reply.status(500).send({ message: "Erro ao buscar itens." });
  }
});

fastify.get("/itens-perdidos", (request, reply) => {
  reply.sendFile("pagina itens perdidos/itens-perdidos.html");
});

fastify.get("/meus-registros", (request, reply) => {
  reply.sendFile("Adm - pagina registro de item/meus-registros.html");
});

fastify.get("/cadastrar-item", (request, reply) => {
  reply.sendFile("Adm - pagina cadastrar item/cadastrar-item.html");
});

fastify.get("/login", (request, reply) => {
  reply.sendFile("pagina login/login.html");
});

fastify.get("/cadastro", (request, reply) => {
  reply.sendFile("pagina cadastro/cadastro.html");
});

fastify.get("/configuracao", (request, reply) => {
  reply.sendFile("/pagina configurações/configuracoes.html");
});

fastify.get("/contato", (request, reply) => {
  reply.sendFile("/Contato/contato.html");
});

fastify.get("/como_funciona", (request, reply) => {
  reply.sendFile("/pagina como funciona/como_funciona.html");
});

// Serve arquivos estáticos a partir da pasta public (depois das rotas custom)
fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/", // Prefixo para acessar os arquivos
});

// Iniciar o servidor
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    console.error("Erro ao iniciar o servidor:", err);
    process.exit(1);
  }
  console.log(`Servidor rodando: http://localhost:3000/cadastro`);
});
