const fastify = require("fastify")();
const fastifyStatic = require("@fastify/static");
const path = require("path");
const fs = require("fs");
const db = require("./database");
const multipart = require("@fastify/multipart");

fastify.register(multipart, {
  attachFieldsToBody: true,
  limits: {
    fileSize: 10000000, // 10MB
  },
});

// Rota para cadastro de usuários (sem mudanças)
fastify.post("/register", async (request, reply) => {
  const { nome, ra, email, telefone, senha } = request.body;

  if (!nome || !ra || !email || !senha) {
    return reply
      .status(400)
      .send({ message: "Todos os campos são obrigatórios." });
  }

  const tipo_usuario = ra.startsWith("0001") ? "usuario" : "admin";

  const query =
    "INSERT INTO usuarios (nome, ra, email, telefone, senha, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?)";

  try {
    await new Promise((resolve, reject) => {
      db.query(
        query,
        [nome, ra, email, telefone, senha, tipo_usuario],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
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
        "Erro ao cadastrar usuário. Verifique se o RA ou email já existe.",
    });
  }
});

// Rota para login (sem mudanças)
fastify.post("/login", async (request, reply) => {
  const { email, senha } = request.body;

  if (!email || !senha) {
    return reply
      .status(400)
      .send({ success: false, message: "Email e senha são obrigatórios." });
  }

  const query = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, [email, senha], (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });

    if (results.length > 0) {
      return reply.send({
        success: true,
        tipo: results[0].tipo_usuario,
        id_usuario: results[0].id_usuario,
        nome: results[0].nome,
      });
    } else {
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

// Rota para buscar dados de um usuário específico (adicionado 'imagem' ao SELECT)
fastify.get("/users/:id", async (request, reply) => {
  const { id } = request.params;
  const query =
    "SELECT id_usuario, nome, ra, email, telefone, tipo_usuario, imagem FROM usuarios WHERE id_usuario = ?";

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, [id], (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });

    if (results.length === 0) {
      return reply.status(404).send({ message: "Usuário não encontrado." });
    }
    return reply.send(results[0]);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    return reply.status(500).send({ message: "Erro ao buscar usuário." });
  }
});

// Rota para atualizar informações pessoais (sem senha)
fastify.put("/users/:id", async (request, reply) => {
  const { id } = request.params;
  const { nome, email, telefone } = request.body;

  const query =
    "UPDATE usuarios SET nome = ?, email = ?, telefone = ? WHERE id_usuario = ?";

  try {
    await new Promise((resolve, reject) => {
      db.query(query, [nome, email, telefone, id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    return reply.send({ message: "Informações atualizadas com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    return reply
      .status(500)
      .send({ message: "Erro ao atualizar informações." });
  }
});

// Rota para alterar senha
fastify.put("/users/:id/password", async (request, reply) => {
  const { id } = request.params;
  const { senha } = request.body;

  if (!senha) {
    return reply.status(400).send({ message: "Nova senha é obrigatória." });
  }

  const query = "UPDATE usuarios SET senha = ? WHERE id_usuario = ?";

  try {
    await new Promise((resolve, reject) => {
      db.query(query, [senha, id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    return reply.send({ message: "Senha alterada com sucesso!" });
  } catch (err) {
    console.error("Erro ao alterar senha:", err);
    return reply.status(500).send({ message: "Erro ao alterar senha." });
  }
});

// Rota para cadastro de itens (sem mudanças)
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

  if (
    !nome ||
    !local ||
    !data_encontro ||
    !categoria ||
    !descricao ||
    !id_usuario ||
    !tipo_usuario
  ) {
    return reply
      .status(400)
      .send({ message: "Todos os campos são obrigatórios." });
  }

  if (tipo_usuario !== "admin") {
    return reply.status(403).send({
      message: "Acesso negado: Apenas administradores podem cadastrar itens.",
    });
  }

  const query =
    "INSERT INTO itens (id_usuario, nome, local, data_encontro, categoria, descricao, imagem) VALUES (?, ?, ?, ?, ?, ?, NULL)";

  try {
    await new Promise((resolve, reject) => {
      db.query(
        query,
        [id_usuario, nome, local, data_encontro, categoria, descricao],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
    return reply.status(201).send({ message: "Item cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro ao inserir item:", err);
    return reply.status(500).send({ message: "Erro ao cadastrar item." });
  }
});

// Rota para cadastro de requisições (sem mudanças)
fastify.post("/requisicoes", async (request, reply) => {
  const { id_item, id_usuario, descricao } = request.body;

  if (!id_item || !id_usuario || !descricao) {
    return reply.status(400).send({
      message: "ID do item, ID do usuário e descrição são obrigatórios.",
    });
  }

  const query =
    "INSERT INTO requisicoes (id_item, id_usuario, descricao, imagem) VALUES (?, ?, ?, NULL)";

  try {
    await new Promise((resolve, reject) => {
      db.query(query, [id_item, id_usuario, descricao], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    return reply
      .status(201)
      .send({ message: "Requisição enviada com sucesso!" });
  } catch (err) {
    console.error("Erro ao inserir requisição:", err);
    return reply.status(500).send({ message: "Erro ao enviar requisição." });
  }
});

// Rota para buscar requisições (com filtro opcional por userId)
fastify.get("/requisicoes", async (request, reply) => {
  const { userId } = request.query;
  let query = "SELECT * FROM requisicoes";
  const params = [];

  if (userId) {
    query += " WHERE id_usuario = ?";
    params.push(userId);
  }

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, params, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
    return reply.send(results);
  } catch (err) {
    console.error("Erro ao buscar requisições:", err);
    return reply.status(500).send({ message: "Erro ao buscar requisições." });
  }
});

// Rota para buscar itens (sem mudanças)
fastify.get("/items", async (request, reply) => {
  const query = "SELECT * FROM itens";

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const mappedResults = results.map((item) => ({
      ...item,
      id: item.id_item,
      status: item.status === "perdido" ? "PENDENTE" : "ENCONTRADO",
    }));

    return reply.send(mappedResults);
  } catch (err) {
    console.error("Erro ao buscar itens:", err);
    return reply.status(500).send({ message: "Erro ao buscar itens." });
  }
});

// Rota para upload de foto de perfil (com logging extra para depuração)
fastify.post("/users/:id/upload", async (request, reply) => {
  const { id } = request.params;

  try {
    const files = await request.saveRequestFiles();

    if (files.length === 0) {
      return reply.status(400).send({ message: "Nenhuma imagem enviada." });
    }

    const file = files[0];
    const originalName = file.filename;
    const ext = path.extname(originalName);
    const fileName = `profile-${id}${ext}`;

    const uploadDir = path.join(__dirname, "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`Pasta criada: ${uploadDir}`);
    }

    const targetPath = path.join(uploadDir, fileName);
    fs.renameSync(file.filepath, targetPath);
    console.log(`Arquivo movido para: ${targetPath}`);

    const dbPath = `/uploads/${fileName}`;

    const query = "UPDATE usuarios SET imagem = ? WHERE id_usuario = ?";

    await new Promise((resolve, reject) => {
      db.query(query, [dbPath, id], (err, results) => {
        if (err) {
          console.error("Erro no DB durante upload:", err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    return reply.send({
      message: "Foto de perfil atualizada com sucesso!",
      path: dbPath,
    });
  } catch (err) {
    console.error("Erro geral no upload:", err);
    return reply
      .status(500)
      .send({ message: "Erro ao atualizar foto. Verifique logs do servidor." });
  }
});

// Rotas de páginas estáticas (sem mudanças)
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

// Serve arquivos estáticos a partir da pasta public
fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

// Iniciar o servidor
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    console.error("Erro ao iniciar o servidor:", err);
    process.exit(1);
  }
  console.log(`Servidor rodando: http://localhost:3000/cadastro`);
});
