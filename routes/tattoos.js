const express = require('express');
const router = express.Router();
const {
    verifyToken,
    verifyRole,
    optionalVerifyToken
} = require('../middlewares/authMiddleware');
const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({storage});

// CREATE - Ajouter un nouveau flash tattoo
router.post('/', verifyToken, verifyRole(['tattoo_artist']), upload.single('image'), async(req, res) => {
    const {
        title,
        description,
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

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
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

        res.status(201)
           .json({
               message: 'Flash tattoo créé avec succès',
               tattoo: data[0]
           });
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la création du flash tattoo.'});
    }
});


router.get('/', optionalVerifyToken, async(req, res) => {
    const {
        user_id,
        available,
        min_price,
        max_price,
        size,
        color,
        favorites
    } = req.query;

    let query = supabase.from('flashtattoos').select('*');

    // Appliquer les autres filtres
    if (user_id) query = query.eq('user_id', user_id);
    if (available) query = query.eq('available', available === 'true');
    if (min_price) query = query.gte('price', parseFloat(min_price));
    if (max_price) query = query.lte('price', parseFloat(max_price));
    if (size) query = query.eq('size', size);
    if (color !== undefined) query = query.eq('color', color === 'true');

    // Gestion des favoris
    if (favorites && favorites.toLowerCase() === 'true') {
        if (!req.user || !req.user.id) {
            return res.status(200).json([]);
        }

        try {
            const {
                data: favoritesData,
                error: favoritesError
            } = await supabase
                .from('favorites')
                .select('flash_tattoo_id')
                .eq('client_id', req.user.id);

            if (favoritesError) return res.status(400).json({error: favoritesError.message});

            const favoriteTattooIds = favoritesData.map(fav => fav.flash_tattoo_id);

            if (favoriteTattooIds.length > 0) {
                query = query.in('id', favoriteTattooIds);
            } else {
                // Aucun favori trouvé, retourner un tableau vide
                return res.status(200).json([]);
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des favoris :', err);
            return res.status(500).json({error: 'Erreur serveur lors de la récupération des favoris.'});
        }
    }

    // Récupération des tatouages après application des filtres
    try {
        const {
            data,
            error
        } = await query;

        if (error) return res.status(400).json({error: error.message});

        const tattoosWithFullImageUrl = data.map((tattoo) => ({
            ...tattoo,
            image_url: tattoo.image_url ? `http://localhost:5000/public${tattoo.image_url}` : null
        }));

        res.status(200).json(tattoosWithFullImageUrl);
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

        // Ajouter l'URL complète de l'image
        if (data) {
            data.image_url = data.image_url ? `http://localhost:5000/public${data.image_url}` : null;
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la récupération du flash tattoo.'});
    }
});

// Check si un flash tattoo est dans mes favoris
router.get('/:id/favorite', verifyToken, async(req, res) => {
    const {id} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('favorites')
            .select('id')
            .eq('flash_tattoo_id', id)
            .eq('client_id', req.user.id)
            .single();

        res.status(200).json({
            checked: !!data,
            favorite_id: data?.id
        });
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la vérification du favori.'});
    }
});

router.put('/:id', verifyToken, verifyRole(['tattoo_artist']), upload.single('image'), async(req, res) => {
    const {id} = req.params;
    const {
        title,
        description,
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
    if (price) updates.price = price;
    if (color !== undefined) updates.color = color;
    if (size) updates.size = size;
    if (available !== undefined) updates.available = available;

    if (req.file) {
        updates.image_url = `/uploads/${req.file.filename}`;
    }

    try {
        const {
            data: existingTattoo,
            error: fetchError
        } = await supabase
            .from('flashtattoos')
            .select('image_url')
            .eq('id', id)
            .eq('user_id', req.user.id)
            .single();

        if (fetchError || !existingTattoo) {
            return res.status(404).json({error: 'Flash tattoo non trouvé ou non autorisé.'});
        }

        if (updates.image_url && existingTattoo.image_url) {
            // Supprimer l'ancienne image
            const oldImagePath = path.join(__dirname, '../public', existingTattoo.image_url);
            fs.unlink(oldImagePath, (err) => {
                if (err) console.error('Erreur lors de la suppression de l\'ancienne image :', err);
            });
        }

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

        res.status(200)
           .json({
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
