import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';

const app = express();
const PORT = process.env.PORT || 3001;
const DB_FILE = './db.json';

app.use(cors());
app.use(express.json());

async function readData() {
  const data = await fs.readJson(DB_FILE);
  return data.alunos || [];
}

async function writeData(alunos) {
  await fs.writeJson(DB_FILE, { alunos }, { spaces: 2 });
}

app.get('/alunos', async (req, res) => {
  const alunos = await readData();
  res.json(alunos);
});

app.post('/alunos', async (req, res) => {
  const novoAluno = req.body;

  // Gera ID automaticamente
  novoAluno.id = Date.now().toString();

  // Define valorAdicional e descricaoAdicional como opcionais
  if (novoAluno.valorAdicional === undefined) novoAluno.valorAdicional = 0;
  if (novoAluno.descricaoAdicional === undefined) novoAluno.descricaoAdicional = "";

  const alunos = await readData();
  alunos.push(novoAluno);
  await writeData(alunos);
  res.status(201).json(novoAluno);
});

app.put('/alunos/:id', async (req, res) => {
  const { id } = req.params;
  const alunoAtualizado = req.body;
  const alunos = await readData();
  const index = alunos.findIndex((a) => a.id === id);
  if (index === -1) return res.status(404).send("Aluno não encontrado");
  alunos[index] = alunoAtualizado;
  await writeData(alunos);
  res.json(alunoAtualizado);
});

app.delete('/alunos/:id', async (req, res) => {
  const { id } = req.params;
  let alunos = await readData();
  alunos = alunos.filter((a) => a.id !== id);
  await writeData(alunos);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});