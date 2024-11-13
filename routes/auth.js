const express = require('express');
const router = express.Router();
const {
    verifyToken,
    verifyRole
} = require('../middlewares/authMiddleware');
const {createClient} = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Consulter le profil personnel
router.get('/me', verifyToken, async(req, res) => {
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
            return res.status(404).json({error: 'Profil utilisateur non trouvé.'});
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la récupération du profil utilisateur.'});
    }
});

// Mettre à jour le profil personnel
router.put('/me', verifyToken, async(req, res) => {
    const user_id = req.user.id;
    const {
        name,
        address,
        phone_number,
        profile_image,
        description,
        location,
        social_links
    } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (address) updates.address = address;
    if (phone_number) updates.phone_number = phone_number;
    if (profile_image) updates.profile_image = profile_image;
    if (description) updates.description = description;
    if (location) updates.location = location;
    if (social_links) updates.social_links = social_links;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({error: 'Aucune donnée de mise à jour fournie.'});
    }

    try {
        const {
            data,
            error
        } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user_id)
            .select();

        if (error) {
            return res.status(400).json({error: error.message});
        }
        res.status(200).json({
            message: 'Profil utilisateur mis à jour avec succès',
            user: data[0]
        });
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la mise à jour du profil utilisateur.'});
    }
});

// Supprimer le profil personnel
router.delete('/me', verifyToken, async(req, res) => {
    const user_id = req.user.id;

    try {
        const {error} = await supabase
            .from('users')
            .delete()
            .eq('id', user_id);

        if (error) {
            return res.status(400).json({error: error.message});
        }
        res.status(200).json({message: 'Profil utilisateur supprimé avec succès'});
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la suppression du profil utilisateur.'});
    }
});

// Mettre à jour le profil d'un autre utilisateur (Admin uniquement)
router.put('/:id', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {id} = req.params;
    const {
        name,
        email,
        role,
        phone_number,
        address,
        profile_image,
        description,
        location,
        social_links
    } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (phone_number) updates.phone_number = phone_number;
    if (address) updates.address = address;
    if (profile_image) updates.profile_image = profile_image;
    if (description) updates.description = description;
    if (location) updates.location = location;
    if (social_links) updates.social_links = social_links;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({error: 'Aucune donnée de mise à jour fournie.'});
    }

    try {
        const {
            data,
            error
        } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(400).json({error: error.message});
        }
        if (!data || data.length === 0) {
            return res.status(404).json({error: 'Utilisateur non trouvé.'});
        }
        res.status(200).json({
            message: 'Utilisateur mis à jour avec succès',
            user: data[0]
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({error: 'Erreur serveur lors de la mise à jour de l\'utilisateur.'});
    }
});

module.exports = router;
