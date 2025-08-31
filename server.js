// Backend (Fastify atualizado com a rota /admin/request/:id/approve corrigida)

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

// Rota para cadastro de usuários
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

// Rota para login
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

// Rota para buscar dados de um usuário específico
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

// Rota para cadastro de itens
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

// Rota para cadastro de requisições
fastify.post("/requisicoes", async (request, reply) => {
  try {
    const data = await request.body;
    const id_item =
      data.id_item && data.id_item.value !== ""
        ? parseInt(data.id_item.value)
        : null;
    const id_usuario = parseInt(data.id_usuario?.value);
    const descricao = data.descricao?.value;
    const file = data.imagem ? await data.imagem.toBuffer() : null;
    let filePath = null;

    if (!id_usuario || !descricao) {
      return reply.status(400).send({
        message: "ID do usuário e descrição são obrigatórios.",
      });
    }

    if (file) {
      const originalName = data.imagem.filename;
      const ext = path.extname(originalName);
      const fileName = `requisicao-${Date.now()}${ext}`;
      const uploadDir = path.join(__dirname, "public/uploads");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`Pasta criada: ${uploadDir}`);
      }

      filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, file);
      filePath = `/uploads/${fileName}`;
      console.log(`Imagem salva em: ${filePath}`);
    }

    const query =
      "INSERT INTO requisicoes (id_item, id_usuario, descricao, imagem) VALUES (?, ?, ?, ?)";
    const params = [id_item, id_usuario, descricao, filePath];

    await new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) {
          console.error("Erro na query SQL:", err);
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
    console.error("Erro ao processar requisição:", err);
    return reply
      .status(500)
      .send({ message: "Erro ao enviar requisição.", error: err.message });
  }
});

// Rota para buscar requisições
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

// Rota para buscar itens
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

// Rota para listar itens com contagem de requisições pendentes (apenas status 'perdido')
fastify.get("/admin/items-with-requests", async (request, reply) => {
  const query = `
    SELECT i.*, COUNT(r.id_requisicao) AS solicitacoes
    FROM itens i
    LEFT JOIN requisicoes r ON i.id_item = r.id_item AND r.status = 'pendente'
    WHERE i.status = 'perdido'
    GROUP BY i.id_item
  `;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
    return reply.send(results);
  } catch (err) {
    console.error("Erro ao buscar itens com requests:", err);
    return reply.status(500).send({ message: "Erro ao buscar itens." });
  }
});

// Rota para detalhes do item e suas requisições pendentes
fastify.get("/admin/item/:id/requests", async (request, reply) => {
  const { id } = request.params;
  const itemQuery = "SELECT * FROM itens WHERE id_item = ?";
  const requestsQuery = `
    SELECT r.*, u.nome AS usuario_nome
    FROM requisicoes r
    JOIN usuarios u ON r.id_usuario = u.id_usuario
    WHERE r.id_item = ? AND r.status = 'pendente'
  `;

  try {
    const item = await new Promise((resolve, reject) => {
      db.query(itemQuery, [id], (err, res) => {
        if (err) reject(err);
        else resolve(res[0]);
      });
    });

    if (!item)
      return reply.status(404).send({ message: "Item não encontrado." });

    const solicitacoesDetalhes = await new Promise((resolve, reject) => {
      db.query(requestsQuery, [id], (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });

    return reply.send({
      ...item,
      solicitacoes: solicitacoesDetalhes.length,
      solicitacoesDetalhes,
    });
  } catch (err) {
    console.error("Erro ao buscar detalhes do item:", err);
    return reply.status(500).send({ message: "Erro ao buscar detalhes." });
  }
});

// Rota para aprovar requisição (corrigida)
fastify.post("/admin/request/:id/approve", async (request, reply) => {
  const { id } = request.params;
  const id_admin = 4; // Substitua por auth real

  try {
    await new Promise((resolve, reject) => {
      db.beginTransaction((err) => {
        if (err) reject(err);

        // Obter o id_item da requisição aprovada
        db.query(
          "SELECT id_item FROM requisicoes WHERE id_requisicao = ?",
          [id],
          (err, res) => {
            if (err) return db.rollback(() => reject(err));
            if (res.length === 0)
              return db.rollback(() =>
                reject(new Error("Requisição não encontrada"))
              );

            const id_item = res[0].id_item;

            // Aprovar a requisição selecionada
            db.query(
              "UPDATE requisicoes SET status = 'aprovado' WHERE id_requisicao = ?",
              [id],
              (err) => {
                if (err) return db.rollback(() => reject(err));

                // Inserir log de aprovação
                db.query(
                  "INSERT INTO logs (id_admin, id_requisicao, acao) VALUES (?, ?, 'aprovado')",
                  [id_admin, id],
                  (err) => {
                    if (err) return db.rollback(() => reject(err));

                    // Rejeitar as outras requisições pendentes para o mesmo item
                    db.query(
                      "UPDATE requisicoes SET status = 'reprovado' WHERE id_item = ? AND id_requisicao != ? AND status = 'pendente'",
                      [id_item, id],
                      (err) => {
                        if (err) return db.rollback(() => reject(err));

                        // Inserir logs para as requisições rejeitadas
                        db.query(
                          "INSERT INTO logs (id_admin, id_requisicao, acao) SELECT ?, id_requisicao, 'reprovado' FROM requisicoes WHERE id_item = ? AND id_requisicao != ? AND status = 'reprovado'",
                          [id_admin, id_item, id],
                          (err) => {
                            if (err) return db.rollback(() => reject(err));

                            // Atualizar o status do item para 'encontrado'
                            db.query(
                              "UPDATE itens SET status = 'encontrado' WHERE id_item = ?",
                              [id_item],
                              (err) => {
                                if (err) return db.rollback(() => reject(err));

                                db.commit((err) => {
                                  if (err)
                                    return db.rollback(() => reject(err));
                                  resolve();
                                });
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });

    return reply.send({ message: "Requisição aprovada com sucesso!" });
  } catch (err) {
    console.error("Erro ao aprovar:", err);
    return reply.status(500).send({ message: "Erro ao aprovar." });
  }
});

// Rota para rejeitar requisição
fastify.post("/admin/request/:id/reject", async (request, reply) => {
  const { id } = request.params;
  const id_admin = 4; // Substitua por auth real

  try {
    await new Promise((resolve, reject) => {
      db.query(
        "UPDATE requisicoes SET status = 'reprovado' WHERE id_requisicao = ?",
        [id],
        (err) => {
          if (err) reject(err);

          db.query(
            "INSERT INTO logs (id_admin, id_requisicao, acao) VALUES (?, ?, 'reprovado')",
            [id_admin, id],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        }
      );
    });

    return reply.send({ message: "Requisição reprovada com sucesso!" });
  } catch (err) {
    console.error("Erro ao reprovar:", err);
    return reply.status(500).send({ message: "Erro ao reprovar." });
  }
});

// Rota para upload de foto de perfil
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

// Rotas de páginas estáticas
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

fastify.get("/solicitacoes", (request, reply) => {
  reply.sendFile("/solicitacoes/solicitacoes.html");
});

fastify.get("/inicio", (request, reply) => {
  reply.sendFile("/pagina index/inicio.html");
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
