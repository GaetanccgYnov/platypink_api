const express = require('express');
const router = express.Router();
const {
    verifyToken,
    verifyRole
} = require('../middlewares/authMiddleware');
const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// CREATE - Ajouter un nouveau flash tattoo
router.post('/', verifyToken, verifyRole(['tattoo_artist']), async(req, res) => {
    const {
        title,
        description,
        image_url,
        price,
        color,
        size,
        available
    } = req.body;

    if (!title || !price || !size) {
        return res.status(400).json({error: 'Les champs titre, prix et taille sont requis.'});
    }

    if (![
        'petit',
        'moyen',
        'grand'
    ].includes(size)) {
        return res.status(400).json({error: 'La taille doit être "petit", "moyen" ou "grand".'});
    }

    try {
        const {
            data,
            error
        } = await supabase
            .from('flashtattoos')
            .insert([
                {
                    title,
                    description,
                    image_url,
                    price,
                    color: color ?? false,
                    size,
                    available: available ?? true,
                    user_id: req.user.id
                }
            ])
            .select();

        if (error) return res.status(400).json({error: error.message});

        res.status(201).json({
            message: 'Flash tattoo créé avec succès',
            tattoo: data[0]
        });
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la création du flash tattoo.'});
    }
});

// READ - Récupérer tous les flash tattoos ou un par ID
router.get('/', async(req, res) => {
    const {
        user_id,
        available,
        min_price,
        max_price,
        size,
        color
    } = req.query;

    let query = supabase.from('flashtattoos').select('*');

    if (user_id) query = query.eq('user_id', user_id);
    if (available) query = query.eq('available', available === 'true');
    if (min_price) query = query.gte('price', parseFloat(min_price));
    if (max_price) query = query.lte('price', parseFloat(max_price));
    if (size) query = query.eq('size', size);
    if (color !== undefined) query = query.eq('color', color === 'true');

    try {
        const {
            data,
            error
        } = await query;

        if (error) return res.status(400).json({error: error.message});

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la récupération des flash tattoos.'});
    }
});

router.get('/:id', async(req, res) => {
    const {id} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('flashtattoos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return res.status(404).json({error: 'Flash tattoo non trouvé.'});

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la récupération du flash tattoo.'});
    }
});

// UPDATE - Mettre à jour un flash tattoo
router.put('/:id', verifyToken, verifyRole(['tattoo_artist']), async(req, res) => {
    const {id} = req.params;
    const {
        title,
        description,
        image_url,
        price,
        color,
        size,
        available
    } = req.body;

    if (size && ![
        'petit',
        'moyen',
        'grand'
    ].includes(size)) {
        return res.status(400).json({error: 'La taille doit être "petit", "moyen" ou "grand".'});
    }

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (image_url) updates.image_url = image_url;
    if (price) updates.price = price;
    if (color !== undefined) updates.color = color;
    if (size) updates.size = size;
    if (available !== undefined) updates.available = available;

    try {
        const {
            data,
            error
        } = await supabase
            .from('flashtattoos')
            .update(updates)
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select();

        if (error) return res.status(400).json({error: error.message});

        if (!data || data.length === 0) {
            return res.status(404).json({error: 'Flash tattoo non trouvé ou non autorisé.'});
        }

        res.status(200).json({
            message: 'Flash tattoo mis à jour avec succès',
            tattoo: data[0]
        });
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la mise à jour du flash tattoo.'});
    }
});

// DELETE - Supprimer un flash tattoo
router.delete('/:id', verifyToken, verifyRole([
    'tattoo_artist',
    'admin'
]), async(req, res) => {
    const {id} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('flashtattoos')
            .delete()
            .eq('id', id);

        res.status(200).json({message: 'Flash tattoo supprimé avec succès'});
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la suppression du flash tattoo.'});
    }
});

module.exports = router;