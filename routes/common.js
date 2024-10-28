// common.js

const express = require('express');
const router = express.Router();
const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Récupérer un flash tattoo par son ID
router.get('/flash/:flashId', async(req, res) => {
    const {flashId} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('flashtattoos')
            .select('*')
            .eq('id', flashId)
            .single();

        if (error) {
            return res.status(404).json({error: 'Flash tattoo non trouvé.'});
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la récupération du flash tattoo.'});
    }
});

// Récupérer tous les flash tattoos
router.get('/flashes', async(req, res) => {
    try {
        const {
            data,
            error
        } = await supabase
            .from('flashtattoos')
            .select('*');

        if (error) {
            return res.status(400).json({error: error.message});
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la récupération des flash tattoos.'});
    }
});

module.exports = router;
