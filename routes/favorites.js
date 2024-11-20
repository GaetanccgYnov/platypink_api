const express = require('express');
const router = express.Router();
const {
    verifyToken,
    verifyRole
} = require('../middlewares/authMiddleware');
const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// GET - Récupérer les favoris d'un client
router.get('/', verifyToken, verifyRole(['client']), async(req, res) => {
    try {
        const {
            data: favorites,
            error
        } = await supabase
            .from('favorites')
            .select(`
                id,
                flash_tattoo_id,
                tattoo_artist_id,
                shop_id,
                flashtattoos (
                    title, 
                    image_url, 
                    price
                ),
                tattoo_artist:users!favorites_tattoo_artist_id_fkey (
                    name, 
                    profile_image
                ),
                shop:shops (
                    name, 
                    location
                )
            `)
            .eq('client_id', req.user.id);

        if (error) {
            return res.status(400).json({error: error.message});
        }

        res.status(200).json({favorites});
    } catch (err) {
        console.error('Erreur serveur lors de la récupération des favoris :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// GET - Vérifier si un favori appartient à l'utilisateur
router.get('/:id/check', verifyToken, verifyRole(['client']), async(req, res) => {
    const {id} = req.params;

    try {
        // Vérification dans la base de données
        const {
            data,
            error
        } = await supabase
            .from('favorites')
            .select('id')
            .eq('id', id)
            .eq('client_id', req.user.id)
            .single();

        if (error || !data) {
            return res.status(404).json({checked: false});
        }

        res.status(200).json({checked: true});
    } catch (err) {
        console.error('Erreur serveur lors de la vérification du favori :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// POST - Ajouter un élément aux favoris
router.post('/', verifyToken, verifyRole(['client']), async(req, res) => {
    const {
        flash_tattoo_id,
        tattoo_artist_id
    } = req.body;

    if (!flash_tattoo_id && !tattoo_artist_id) {
        return res.status(400).json({error: 'Un type de favori (flash_tattoo, tattoo_artist) est requis.'});
    }

    try {
        // Vérification du rôle de l'utilisateur si tattoo_artist_id est fourni
        if (tattoo_artist_id) {
            const {
                data: artist,
                error: artistError
            } = await supabase
                .from('users')
                .select('id, role')
                .eq('id', tattoo_artist_id)
                .eq('role', 'tattoo_artist')
                .single();

            if (artistError || !artist) {
                return res.status(400).json({error: 'L\'ID fourni n\'est pas associé à un artiste tatoueur valide.'});
            }
        }

        // Ajout du favori
        const {
            data,
            error
        } = await supabase
            .from('favorites')
            .insert({
                client_id: req.user.id,
                flash_tattoo_id,
                tattoo_artist_id
            })
            .select();

        if (error) return res.status(400).json({error: error.message});

        res.status(201).json({
            message: 'Favori ajouté avec succès.',
            favorite: data[0]
        });
    } catch (err) {
        console.error('Erreur serveur lors de l\'ajout du favori :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// DELETE - Supprimer un favori
router.delete('/:id', verifyToken, verifyRole(['client']), async(req, res) => {
    const {id} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('favorites')
            .delete()
            .eq('id', id)
            .eq('client_id', req.user.id);

        if (error) return res.status(400).json({error: error.message});

        res.status(200).json({message: 'Favori supprimé avec succès.'});
    } catch (err) {
        console.error('Erreur serveur lors de la suppression du favori :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

module.exports = router;
