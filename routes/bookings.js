const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middlewares/authMiddleware');
const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Créer une réservation
router.post('/', verifyToken, async(req, res) => {
    const {
        flash_tattoo_id,
        tattoo_artist_id,
        shop_id,
        date,
        time
    } = req.body;

    try {
        const {
            data,
            error
        } = await supabase
            .from('Bookings')
            .insert([
                {
                    client_id: req.user.id,
                    flash_tattoo_id,
                    tattoo_artist_id,
                    shop_id,
                    date,
                    time,
                    status: 'pending'
                }
            ])
            .select();

        if (error) return res.status(400).json({error: error.message});

        res.status(201).json({booking: data[0]});
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// Obtenir toutes les réservations de l'utilisateur connecté
router.get('/my-bookings', verifyToken, async(req, res) => {
    try {
        const {
            data,
            error
        } = await supabase
            .from('Bookings')
            .select('*')
            .eq('client_id', req.user.id);

        if (error) return res.status(400).json({error: error.message});

        res.status(200).json({bookings: data});
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

module.exports = router;
