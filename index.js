// index.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const {createClient} = require('@supabase/supabase-js');
const app = express();
const port = process.env.PORT || 5000;
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shops');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const tattooRoutes = require('./routes/tattoos');
const favoriteRoutes = require('./routes/favorites');

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

// Utiliser les routes
app.use('/auth', authRoutes);
app.use('/shops', shopRoutes);
app.use('/bookings', bookingRoutes);
app.use('/users', userRoutes);
app.use('/tattoos', tattooRoutes);
app.use('/favorites', favoriteRoutes);


// Route de test
app.get('/', (req, res) => {
    res.send('Bienvenue sur l\'API de Platyp’ink');
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
