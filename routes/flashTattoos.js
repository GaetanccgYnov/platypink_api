const express = require('express');
const router = express.Router();
const {
    verifyToken,
    verifyRole
} = require('../middlewares/authMiddleware');
const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Créer un flash tattoo
router.post('/', verifyToken, verifyRole(['tattoo_artist']), async(req, res) => {
    const {
        title,
        description,
        image_url,
        price,
        available
    } = req.body;

    try {
        const {
            data,
            error
        } = await supabase
            .from('FlashTattoos')
            .insert([
                {
                    user_id: req.user.id,
                    title,
                    description,
                    image_url,
                    price,
                    available
                }
            ])
            .select();

        if (error) return res.status(400).json({error: error.message});

        res.status(201).json({flashTattoo: data[0]});
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// Obtenir tous les flash tattoos disponibles
router.get('/', async(req, res) => {
    try {
        const {
            data,
            error
        } = await supabase.from('FlashTattoos').select('*').eq('available', true);

        if (error) return res.status(400).json({error: error.message});

        res.status(200).json({flashTattoos: data});
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

module.exports = router;
