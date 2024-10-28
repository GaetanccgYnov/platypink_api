// tattooArtist.js

const express = require('express');
const router = express.Router();
const {
    verifyToken,
    verifyRole
} = require('../middlewares/authMiddleware');
const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Créer un flash tattoo
router.post('/flashes', verifyToken, verifyRole(['tattoo_artist']), async(req, res) => {
    const {
        title,
        description,
        image_url,
        price
    } = req.body;

    const user_id = req.user.id; // ID de l'utilisateur connecté

    // Validation des entrées
    if (!user_id || !title || !price) {
        return res.status(400).json({error: 'Les champs user_id, title et price sont obligatoires.'});
    }

    try {
        const {
            data,
            error
        } = await supabase
            .from('flashtattoos')
            .insert([
                {
                    user_id,
                    title,
                    description,
                    image_url,
                    price
                }
            ])
            .select();

        if (error) {
            console.error('Erreur de Supabase:', error.message);
            return res.status(400).json({error: error.message});
        }

        res.status(201).json({
            message: 'Flash tattoo créé avec succès',
            flashTattoo: data[0]
        });
    } catch (error) {
        console.error('Erreur serveur:', error);
        res.status(500).json({error: 'Erreur serveur lors de la création du flash tattoo.'});
    }
});

// Modifier un flash tattoo
router.put('/flashes/:flashId', verifyToken, verifyRole(['tattoo_artist']), async(req, res) => {
    const {flashId} = req.params;
    const {
        title,
        description,
        price,
        image_url
    } = req.body;

    try {
        const {
            data,
            error
        } = await supabase
            .from('flashtattoos')
            .update({
                title,
                description,
                price,
                image_url
            })
            .eq('id', flashId)
            .select();

        if (error) {
            return res.status(400).json({error: error.message});
        }

        res.status(200).json({
            message: 'Flash tattoo modifié avec succès',
            flash: data[0]
        });
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la modification du flash tattoo.'});
    }
});

// Supprimer un flash tattoo
router.delete('/flashes/:flashId', verifyToken, verifyRole(['tattoo_artist']), async(req, res) => {
    const {flashId} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('flashtattoos')
            .delete()
            .eq('id', flashId)
            .select();

        if (error) {
            return res.status(400).json({error: error.message});
        }

        res.status(200).json({message: 'Flash tattoo supprimé avec succès'});
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la suppression du flash tattoo.'});
    }
});

module.exports = router;
