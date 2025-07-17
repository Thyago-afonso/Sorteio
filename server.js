require('dotenv').config();

user: process.env.DB_USER


require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve o index.html

// Config SQL Server
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool;
sql.connect(config).then(p => {
  pool = p;
  console.log('Conectado ao SQL Server');
}).catch(err => {
  console.error('Erro ao conectar ao banco:', err);
});


// Verifica senha do admin
app.post('/auth-admin', (req, res) => {
  const { senha } = req.body;
  if (senha === process.env.ADMIN_PASSWORD) {
    return res.json({ autorizado: true });
  } else {
    return res.status(401).json({ autorizado: false });
  }
});

app.post('/participantes', async (req, res) => {
  const { nome, telefone } = req.body;
  if (!nome || !telefone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
  }

  try {
    // Verifica se o telefone já existe
    const checar = await pool.request()
      .input('Telefone', sql.NVarChar, telefone)
      .query('SELECT * FROM Participantes WHERE Telefone = @Telefone');

    if (checar.recordset.length > 0) {
      return res.status(409).json({ error: 'Este telefone já está cadastrado.' });
    }

    await pool.request()
      .input('Nome', sql.NVarChar, nome)
      .input('Telefone', sql.NVarChar, telefone)
      .query('INSERT INTO Participantes (Nome, Telefone) VALUES (@Nome, @Telefone)');

    res.json({ message: 'Participante cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar participante' });
  }
});

// Listar participantes (admin)
app.get('/participantes', async (req, res) => {
  try {
    const result = await pool.request()
      .query('SELECT * FROM Participantes ORDER BY DataCadastro DESC');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar participantes' });
  }
});

app.get('/sorteio', async (req, res) => {
  try {
    const sorteio = await pool.request()
      .query('SELECT TOP 1 * FROM Participantes ORDER BY NEWID()');

    if (sorteio.recordset.length === 0) {
      return res.status(404).json({ error: 'Nenhum participante cadastrado' });
    }

    const participante = sorteio.recordset[0];

    // Salvar sorteio no histórico
    await pool.request()
      .input('ParticipanteId', sql.Int, participante.Id)
      .query('INSERT INTO Sorteios (ParticipanteId) VALUES (@ParticipanteId)');

    res.json(participante);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao realizar sorteio' });
  }
});

app.get('/historico', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT s.Id, s.DataSorteio, p.Nome, p.Telefone
      FROM Sorteios s
      INNER JOIN Participantes p ON p.Id = s.ParticipanteId
      ORDER BY s.DataSorteio DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

const { Parser } = require('json2csv'); // instale com: npm install json2csv

app.get('/exportar-csv', async (req, res) => {
  try {
    const result = await pool.request()
      .query('SELECT Nome, Telefone, DataCadastro FROM Participantes');

    const parser = new Parser();
    const csv = parser.parse(result.recordset);

    res.setHeader('Content-Disposition', 'attachment; filename=participantes.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (error) {
    res.status(500).send('Erro ao exportar CSV');
  }
});
