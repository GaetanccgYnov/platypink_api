// index.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const {createClient} = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Test de connexion dans index.js ou auth.js
supabase.from('users')
        .select('*')
        .then(({
                   data,
                   error
               }) => {
            console.log('Test de connexion:', data, error);
        });

// Utiliser les routes d'authentification
app.use('/api/auth', authRoutes);

// Route de test
app.get('/', (req, res) => {
    res.send('Bienvenue sur l\'API de Platyp’ink');
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});

