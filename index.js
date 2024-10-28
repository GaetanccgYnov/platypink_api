// index.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const {createClient} = require('@supabase/supabase-js');
const authRoutes = require('./routes/auth');
const tattooArtistRoutes = require('./routes/tattooArtist');
const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Test de connexion à Supabase
supabase.from('users')
        .select('*')
        .then(({
                   data,
                   error
               }) => {
            if (error) {
                console.error('Erreur de connexion à la base de données:', error);
            } else {
                console.log('Connexion réussie à Supabase:', data);
            }
        });
supabase
    .from('flashtattoos')
    .select('*')
    .limit(1)
    .then(({
               data,
               error
           }) => {
        if (error) {
            console.error('Erreur lors de la connexion à Supabase :', error.message);
        } else {
            console.log('Connexion réussie, données de test:', data);
        }
    });

// Utiliser les routes
app.use('/api/auth', authRoutes);
app.use('/api/tattoo-artist', tattooArtistRoutes);

// Route de test
app.get('/', (req, res) => {
    res.send('Bienvenue sur l\'API de Platyp’ink');
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
