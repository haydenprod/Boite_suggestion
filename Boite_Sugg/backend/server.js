const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MySQL
const db = mysql.createConnection({
  host: 'localhost',       
  user: 'root',            
  password: '',  
  database: 'boite_suggestions'
});

// Connexion
db.connect((err) => {
  if (err) {
    console.error('❌ Erreur de connexion MySQL :', err);
    process.exit(1);
  }
  console.log('✅ Connecté à la base de données MySQL.');
});

// POST /suggestions : Envoi d’une suggestion
app.post('/suggestions', (req, res) => {
  const { nom, message } = req.body;
  const date = new Date();

  if (!message) {
    return res.status(400).json({ error: 'Le champ message est requis.' });
  }

  const sql = 'INSERT INTO suggestions (nom, message, date) VALUES (?, ?, ?)';
  db.query(sql, [nom || null, message, date], (err, result) => {
    if (err) {
      console.error('Erreur lors de l’insertion :', err);
      return res.status(500).json({ error: 'Erreur lors de l\'enregistrement.' });
    }
    res.status(201).json({ id: result.insertId, nom: nom || 'Anonyme', message, date });
  });
});

// GET /suggestions : Liste des suggestions
app.get('/suggestions', (req, res) => {
  db.query('SELECT * FROM suggestions ORDER BY date DESC', (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération :', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération.' });
    }

    const formatted = rows.map(row => ({
      id: row.id,
      nom: row.nom || 'Anonyme',
      message: row.message,
      date: row.date
    }));

    res.json(formatted);
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
