// routes/users.js

const express = require('express');
const router = express.Router();
const {
    verifyToken,
    verifyRole
} = require('../middlewares/authMiddleware');
const {createClient} = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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

// Endpoint pour que les utilisateurs mettent à jour leurs informations personnelles
router.put('/me', verifyToken, async(req, res) => {
    const {
        name,
        email,
        password,
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
    if (phone_number) updates.phone_number = phone_number;
    if (address) updates.address = address;
    if (profile_image) updates.profile_image = profile_image;
    if (description) updates.description = description;
    if (location) updates.location = location;
    if (social_links) updates.social_links = social_links;

    // Hash le mot de passe s'il est fourni
    if (password) {
        try {
            updates.password = await bcrypt.hash(password, 10);
        } catch (err) {
            return res.status(500).json({error: 'Erreur lors du hashage du mot de passe.'});
        }
    }

    try {
        const {
            data,
            error
        } = await supabase
            .from('users')
            .update(updates)
            .eq('id', req.user.id)
            .select();

        if (error) return res.status(400).json({error: error.message});

        res.status(200)
           .json({
               user: data[0],
               message: 'Informations mises à jour avec succès'
           });
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// Récupérer la liste des tattoo_artists
router.get('/', async(req, res) => {
    let query = supabase.from('users').select('*').eq('role', 'tattoo_artist');

    try {
        const {
            data,
            error
        } = await query;

        if (error) {
            return res.status(400).json({error: error.message});
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la récupération des utilisateurs.'});
    }
});

// Récupérer un tattoo_artist spécifique
router.get('/:id', async(req, res) => {
    const {id} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .eq('role', 'tattoo_artist')
            .single();

        if (error) return res.status(404).json({error: 'Tattoo artist non trouvé.'});

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la récupération du tattoo artist.'});
    }
});

// Endpoint pour que les administrateurs mettent à jour les informations d'un utilisateur spécifique
router.put('/:id', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {
        name,
        email,
        password,
        phone_number,
        address,
        profile_image,
        description,
        location,
        social_links,
        role
    } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone_number) updates.phone_number = phone_number;
    if (address) updates.address = address;
    if (profile_image) updates.profile_image = profile_image;
    if (description) updates.description = description;
    if (location) updates.location = location;
    if (social_links) updates.social_links = social_links;
    if (role) updates.role = role;

    // Hash le mot de passe s'il est fourni
    if (password) {
        try {
            updates.password = await bcrypt.hash(password, 10);
        } catch (err) {
            return res.status(500).json({error: 'Erreur lors du hashage du mot de passe.'});
        }
    }

    try {
        const {
            data,
            error
        } = await supabase
            .from('users')
            .update(updates)
            .eq('id', req.params.id)
            .select();

        if (error) return res.status(400).json({error: error.message});

        res.status(200)
           .json({
               user: data[0],
               message: 'Informations mises à jour avec succès'
           });
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// Supprimer un utilisateur (Admin uniquement)
router.delete('/:id', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {id} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        res.status(200).json({message: 'Utilisateur supprimé avec succès'});
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la suppression de l\'utilisateur.'});
    }
});

module.exports = router;
