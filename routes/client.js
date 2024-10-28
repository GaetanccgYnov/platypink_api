// client.js
const express = require('express');
const router = express.Router();
const {
    verifyToken,
    verifyRole
} = require('../middlewares/authMiddleware');
const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Consulter le profil client
router.get('/profile', verifyToken, verifyRole(['client']), async(req, res) => {
    const user_id = req.user.id;

    try {
        const {
            data,
            error
        } = await supabase
            .from('users')
            .select('*')
            .eq('id', user_id)
            .single();

        if (error) {
            return res.status(404).json({error: 'Profil client non trouvé.'});
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la récupération du profil client.'});
    }
});

// Mettre à jour le profil client
router.put('/profile', verifyToken, verifyRole(['client']), async(req, res) => {
    const user_id = req.user.id;
    const {
        name,
        address,
        phone,
        image
    } = req.body;

    try {
        const {
            data,
            error
        } = await supabase
            .from('users')
            .update({
                name,
                address,
                phone,
                image
            })
            .eq('id', user_id)
            .select();

        if (error) {
            return res.status(400).json({error: error.message});
        }
        res.status(200)
           .json({
               message: 'Profil client mis à jour avec succès',
               client: data[0]
           });
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la mise à jour du profil client.'});
    }
});

// Supprimer le profil client
router.delete('/profile', verifyToken, verifyRole(['client']), async(req, res) => {
    const user_id = req.user.id;

    try {
        const {error} = await supabase
            .from('users')
            .delete()
            .eq('id', user_id);

        if (error) {
            return res.status(400).json({error: error.message});
        }
        res.status(200).json({message: 'Profil client supprimé avec succès'});
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la suppression du profil client.'});
    }
});

// Poster un avis
router.post('/reviews', verifyToken, verifyRole(['client']), async(req, res) => {
    const {
        tattoo_artist_id,
        rating,
        comment
    } = req.body;
    const client_id = req.user.id;

    try {
        const {
            data,
            error
        } = await supabase
            .from('reviews')
            .insert([
                {
                    client_id,
                    tattoo_artist_id,
                    rating,
                    comment
                }
            ])
            .select();

        if (error) {
            return res.status(400).json({error: error.message});
        }
        res.status(201).json({
            message: 'Avis posté avec succès',
            review: data[0]
        });
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la publication de l\'avis.'});
    }
});

// Consulter les avis
router.get('/reviews', verifyToken, verifyRole(['client']), async(req, res) => {
    const user_id = req.user.id;

    try {
        const {
            data,
            error
        } = await supabase
            .from('reviews')
            .select('*')
            .eq('client_id', user_id);

        if (error) {
            return res.status(400).json({error: error.message});
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la récupération des avis.'});
    }
});

// Supprimer un avis
router.delete('/reviews/:reviewId', verifyToken, verifyRole(['client']), async(req, res) => {
    const {reviewId} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId)
            .select();

        if (error) {
            return res.status(400).json({error: error.message});
        }
        res.status(200).json({message: 'Avis supprimé avec succès'});
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la suppression de l\'avis.'});
    }
});


// Afficher les favoris
router.get('/favorites', verifyToken, verifyRole(['client']), async(req, res) => {
    const user_id = req.user.id;

    try {
        const {
            data,
            error
        } = await supabase
            .from('favorites')
            .select('*')
            .eq('client_id', user_id);

        if (error) {
            return res.status(400).json({error: error.message});
        }
        res.status(201).json({
            message: 'Tous mes favoris',
            favorite: data[0]
        });
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la récupération des favoris.'});
    }
});

// Ajouter aux favoris
router.post('/favorites', verifyToken, verifyRole(['client']), async(req, res) => {
    const {
        tattoo_artist_id,
        flash_tattoo_id
    } = req.body;
    const client_id = req.user.id;

    try {
        const {
            data,
            error
        } = await supabase
            .from('favorites')
            .insert([
                {
                    client_id,
                    tattoo_artist_id,
                    flash_tattoo_id
                }
            ])
            .select();

        if (error) {
            return res.status(400).json({error: error.message});
        }
        res.status(201).json({
            message: 'Tatoueur ajouté aux favoris',
            favorite: data[0]
        });
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de l\'ajout aux favoris.'});
    }
});

// Supprimer des favoris
router.delete('/favorites/:favoriteId', verifyToken, verifyRole(['client']), async(req, res) => {
    const {favoriteId} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('favorites')
            .delete()
            .eq('id', favoriteId)
            .select();

        if (error) {
            return res.status(400).json({error: error.message});
        }
        res.status(200).json({message: 'Favori supprimé avec succès'});
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la suppression du favori.'});
    }
});

// Consulter les rendez-vous
router.get('/reservations', verifyToken, verifyRole(['client']), async(req, res) => {
    const user_id = req.user.id;

    try {
        const {
            data,
            error
        } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', user_id);

        if (error) {
            return res.status(400).json({error: error.message});
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la récupération des rendez-vous.'});
    }
});

// Envoyer une demande de réservation
router.post('/reservations', verifyToken, verifyRole(['client']), async(req, res) => {
    const {
        tattoo_artist_id,
        date
    } = req.body;
    const client_id = req.user.id;

    try {
        const {
            data,
            error
        } = await supabase
            .from('bookings')
            .insert([
                {
                    client_id,
                    tattoo_artist_id,
                    date,
                    status: 'pending'
                }
            ])
            .select();

        if (error) {
            return res.status(400).json({error: error.message});
        }

        res.status(201).json({
            message: 'Demande de réservation envoyée',
            appointment: data[0]
        });
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la création de la réservation.'});
    }
});


module.exports = router;
