const express = require('express');
const router = express.Router();
const {
    verifyToken,
    verifyRole
} = require('../middlewares/authMiddleware');
const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);


router.post('/', verifyToken, verifyRole([
    'admin',
    'client'
]), async(req, res) => {
    const {
        tattoo_artist_id,
        shop_id,
        rating,
        comment
    } = req.body;

    // Vérifier les champs obligatoires
    if (!rating || (!tattoo_artist_id && !shop_id)) {
        return res.status(400).json({error: 'Un avis doit inclure une note et une cible (tattoo_artist ou shop).'});
    }

    try {
        // Vérifier que la note est valide
        if (rating < 1 || rating > 5) {
            return res.status(400).json({error: 'La note doit être comprise entre 1 et 5.'});
        }

        const {
            data,
            error
        } = await supabase
            .from('reviews')
            .insert({
                client_id: req.user.id,
                tattoo_artist_id,
                shop_id,
                rating,
                comment
            })
            .select();

        if (error) return res.status(400).json({error: error.message});

        res.status(201).json({
            message: 'Avis ajouté avec succès.',
            review: data[0]
        });
    } catch (err) {
        console.error('Erreur serveur lors de l\'ajout de l\'avis :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

router.get('/', async(req, res) => {
    const {
        tattoo_artist_id,
        shop_id
    } = req.query;

    if (!tattoo_artist_id && !shop_id) {
        return res.status(400).json({error: 'Un identifiant tattoo_artist ou shop est requis.'});
    }

    try {
        const {
            data,
            error
        } = await supabase
            .from('reviews')
            .select(`
                *,
                client:users!reviews_client_id_fkey (name, email)
            `)
            .eq(tattoo_artist_id ? 'tattoo_artist_id' : 'shop_id', tattoo_artist_id || shop_id);

        if (error) return res.status(400).json({error: error.message});

        res.status(200).json({reviews: data});
    } catch (err) {
        console.error('Erreur serveur lors de la récupération des avis :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

router.put('/:id', verifyToken, verifyRole([
    'admin',
    'client'
]), async(req, res) => {
    const {id} = req.params;
    const {
        rating,
        comment
    } = req.body;

    if (!rating && !comment) {
        return res.status(400).json({error: 'Au moins un champ (rating ou comment) doit être fourni.'});
    }

    try {
        // Vérification de la note si elle est modifiée
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({error: 'La note doit être comprise entre 1 et 5.'});
        }

        const {
            data,
            error
        } = await supabase
            .from('reviews')
            .update({
                rating,
                comment,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('client_id', req.user.id) // Vérifie que l'avis appartient bien au client connecté
            .select();

        if (error) return res.status(400).json({error: error.message});

        if (!data || data.length === 0) {
            return res.status(404).json({error: 'Avis non trouvé ou non autorisé.'});
        }

        res.status(200).json({
            message: 'Avis mis à jour avec succès.',
            review: data[0]
        });
    } catch (err) {
        console.error('Erreur serveur lors de la modification de l\'avis :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

router.delete('/:id', verifyToken, verifyRole([
    'admin',
    'client'
]), async(req, res) => {
    const {id} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id)
            .eq('client_id', req.user.id); // Vérifie que l'avis appartient bien au client connecté

        if (error) return res.status(400).json({error: error.message});

        res.status(200).json({message: 'Avis supprimé avec succès.'});
    } catch (err) {
        console.error('Erreur serveur lors de la suppression de l\'avis :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

module.exports = router;
