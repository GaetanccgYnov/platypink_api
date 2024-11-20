const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
    verifyToken,
    verifyRole
} = require('../middlewares/authMiddleware');
const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// GET - Récupérer la liste des utilisateurs
router.get('/users', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {
        role,
        name,
        email
    } = req.query; // Optionnel : filtres
    let query = supabase.from('users').select('*');

    // Appliquer les filtres si présents
    if (role) query = query.eq('role', role);
    if (name) query = query.ilike('name', `%${name}%`);
    if (email) query = query.ilike('email', `%${email}%`);

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

// GET - Récupérer un utilisateur par ID
router.get('/users/:id', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {id} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({error: 'Utilisateur non trouvé.'});
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la récupération de l\'utilisateur.'});
    }
});

// POST - Créer un utilisateur
router.post('/users', verifyToken, verifyRole(['admin']), async(req, res) => {
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

    if (!name || !email || !password || !role) {
        return res.status(400).json({error: 'Les champs name, email, password et role sont requis.'});
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const {
            data,
            error
        } = await supabase
            .from('users')
            .insert([
                {
                    name,
                    email,
                    password: hashedPassword,
                    phone_number,
                    address,
                    profile_image,
                    description,
                    location,
                    social_links,
                    role
                }
            ])
            .select();

        if (error) return res.status(400).json({error: error.message});

        res.status(201).json({
            message: 'Utilisateur créé avec succès.',
            user: data[0]
        });
    } catch (error) {
        console.error('Erreur serveur lors de la création de l\'utilisateur :', error);
        res.status(500).json({error: 'Erreur serveur lors de la création de l\'utilisateur.'});
    }
});

// PUT - Mettre à jour un utilisateur
router.put('/users/:id', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {id} = req.params;
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
            .eq('id', id)
            .select();

        if (error) return res.status(400).json({error: error.message});

        res.status(200).json({
            message: 'Utilisateur mis à jour avec succès.',
            user: data[0]
        });
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la mise à jour de l\'utilisateur.'});
    }
});

// DELETE - Supprimer un utilisateur
router.delete('/users/:id', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {id} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) return res.status(400).json({error: error.message});

        res.status(200).json({message: 'Utilisateur supprimé avec succès.'});
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la suppression de l\'utilisateur.'});
    }
});

// CREATE - Ajouter un flash tattoo (admin peut spécifier l'utilisateur propriétaire)
router.post('/tattoos', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {
        title,
        description,
        image_url,
        price,
        color,
        size,
        available,
        user_id
    } = req.body;

    if (!title || !price || !size || !user_id) {
        return res.status(400).json({error: 'Les champs titre, prix, taille et user_id sont requis.'});
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
                    user_id
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

// READ - Récupérer tous les flash tattoos ou un seul par ID
router.get('/tattoos', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {
        user_id,
        available,
        min_price,
        max_price,
        size,
        color
    } = req.query;

    let query = supabase
        .from('flashtattoos')
        .select(`
            *,
            artist:users!flashtattoos_user_id_fkey(name)
        `);

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

        // Mapper les données pour inclure directement le nom de l'artiste dans la réponse
        const result = data.map((tattoo) => ({
            ...tattoo,
            artist_name: tattoo.artist ? tattoo.artist.name : 'Non renseigné'
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error('Erreur serveur lors de la récupération des flash tattoos :', error);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

router.get('/tattoos/:id', verifyToken, verifyRole(['admin']), async(req, res) => {
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

// UPDATE - Mettre à jour un flash tattoo (admin peut modifier n'importe quel tattoo)
router.put('/tattoos/:id', verifyToken, verifyRole(['admin']), async(req, res) => {
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
            .select();

        if (error) return res.status(400).json({error: error.message});

        if (!data || data.length === 0) {
            return res.status(404).json({error: 'Flash tattoo non trouvé.'});
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
router.delete('/tattoos/:id', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {id} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('flashtattoos')
            .delete()
            .eq('id', id);

        if (error) return res.status(400).json({error: error.message});

        res.status(200).json({message: 'Flash tattoo supprimé avec succès'});
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur lors de la suppression du flash tattoo.'});
    }
});

// GET - Récupérer toutes les réservations ou par filtres
router.get('/bookings', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {
        client_id,
        tattoo_artist_id,
        status
    } = req.query;

    let query = supabase
        .from('bookings')
        .select(`
            *,
            flash_tattoo:flashtattoos!bookings_flash_tattoo_id_fkey(title, image_url),
            client:users!bookings_client_id_fkey(name),
            tattoo_artist:users!bookings_tattoo_artist_id_fkey(name)
        `);

    if (client_id) query = query.eq('client_id', client_id);
    if (tattoo_artist_id) query = query.eq('tattoo_artist_id', tattoo_artist_id);
    if (status) query = query.eq('status', status);

    try {
        const {
            data,
            error
        } = await query;

        if (error) return res.status(400).json({error: error.message});

        const bookings = data.map((booking) => ({
            id: booking.id,
            client_name: booking.client?.name || 'N/A',
            artist_name: booking.tattoo_artist?.name || 'N/A',
            tattoo_title: booking.flash_tattoo?.title || 'N/A',
            date: booking.date,
            time: booking.time,
            status: booking.status
        }));

        res.status(200).json({bookings});
    } catch (err) {
        console.error('Erreur serveur lors de la récupération des réservations :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// GET - Récupérer une réservation par ID
router.get('/bookings/:id', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {id} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('bookings')
            .select(`
                *,
                flash_tattoo:flashtattoos!bookings_flash_tattoo_id_fkey(title, image_url),
                client:users!bookings_client_id_fkey(name, email),
                tattoo_artist:users!bookings_tattoo_artist_id_fkey(name, email)
            `)
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({error: 'Réservation non trouvée.'});
        }

        res.status(200).json(data);
    } catch (err) {
        console.error('Erreur serveur lors de la récupération de la réservation :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// POST - Créer une réservation
router.post('/bookings', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {
        client_id,
        flash_tattoo_id,
        tattoo_artist_id,
        date,
        time,
        status
    } = req.body;

    if (!client_id || !tattoo_artist_id || !date || !time) {
        return res.status(400).json({error: 'Les champs client_id, tattoo_artist_id, date, et time sont obligatoires.'});
    }

    try {
        const {
            data,
            error
        } = await supabase
            .from('bookings')
            .insert({
                client_id,
                flash_tattoo_id,
                tattoo_artist_id,
                date,
                time,
                status: status || 'pending'
            })
            .select();

        if (error) return res.status(400).json({error: error.message});

        res.status(201).json({
            message: 'Réservation créée avec succès.',
            booking: data[0]
        });
    } catch (err) {
        console.error('Erreur serveur lors de la création de la réservation :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// PUT - Mettre à jour une réservation
router.put('/bookings/:id', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {id} = req.params;
    const {
        client_id,
        flash_tattoo_id,
        tattoo_artist_id,
        date,
        time,
        status
    } = req.body;

    const updates = {};
    if (client_id) updates.client_id = client_id;
    if (flash_tattoo_id) updates.flash_tattoo_id = flash_tattoo_id;
    if (tattoo_artist_id) updates.tattoo_artist_id = tattoo_artist_id;
    if (date) updates.date = date;
    if (time) updates.time = time;
    if (status) updates.status = status;

    try {
        const {
            data,
            error
        } = await supabase
            .from('bookings')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) return res.status(400).json({error: error.message});

        if (!data || data.length === 0) {
            return res.status(404).json({error: 'Réservation non trouvée.'});
        }

        res.status(200).json({
            message: 'Réservation mise à jour avec succès.',
            booking: data[0]
        });
    } catch (err) {
        console.error('Erreur serveur lors de la mise à jour de la réservation :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// DELETE - Supprimer une réservation
router.delete('/bookings/:id', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {id} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);

        if (error) return res.status(400).json({error: error.message});

        res.status(200).json({message: 'Réservation supprimée avec succès.'});
    } catch (err) {
        console.error('Erreur serveur lors de la suppression de la réservation :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// GET - Récupérer tous les favoris ou par filtre
router.get('/favorites', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {
        client_id,
        tattoo_artist_id,
        shop_id,
        flash_tattoo_id
    } = req.query;

    let query = supabase.from('favorites').select(`
        id,
        client:users!favorites_client_id_fkey (name, email),
        flash_tattoo:flashtattoos(title, image_url, price),
        tattoo_artist:users!favorites_tattoo_artist_id_fkey (name, profile_image),
        shop:shops(name, location)
    `);

    if (client_id) query = query.eq('client_id', client_id);
    if (tattoo_artist_id) query = query.eq('tattoo_artist_id', tattoo_artist_id);
    if (shop_id) query = query.eq('shop_id', shop_id);
    if (flash_tattoo_id) query = query.eq('flash_tattoo_id', flash_tattoo_id);

    try {
        const {
            data,
            error
        } = await query;

        if (error) return res.status(400).json({error: error.message});

        res.status(200).json({favorites: data});
    } catch (err) {
        console.error('Erreur serveur lors de la récupération des favoris :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// POST - Ajouter un favori pour un utilisateur
router.post('/favorites', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {
        client_id,
        flash_tattoo_id,
        tattoo_artist_id,
        shop_id
    } = req.body;

    if (!client_id || (!flash_tattoo_id && !tattoo_artist_id && !shop_id)) {
        return res.status(400).json({
            error: 'Les champs client_id et au moins un type de favori (flash_tattoo_id, tattoo_artist_id, shop_id) sont requis.'
        });
    }

    try {
        // Vérification du rôle si tattoo_artist_id est fourni
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
                client_id,
                flash_tattoo_id,
                tattoo_artist_id,
                shop_id
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

// DELETE - Supprimer un favori par ID
router.delete('/favorites/:id', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {id} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('favorites')
            .delete()
            .eq('id', id);

        if (error) return res.status(400).json({error: error.message});

        res.status(200).json({message: 'Favori supprimé avec succès.'});
    } catch (err) {
        console.error('Erreur serveur lors de la suppression du favori :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// GET - Récupérer tous les avis ou filtrer par cible (tattoo_artist_id ou shop_id)
router.get('/reviews', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {
        tattoo_artist_id,
        shop_id
    } = req.query;

    let query = supabase.from('reviews').select(`
        *,
        client:users!reviews_client_id_fkey (name, email)
    `);

    if (tattoo_artist_id) query = query.eq('tattoo_artist_id', tattoo_artist_id);
    if (shop_id) query = query.eq('shop_id', shop_id);

    try {
        const {
            data,
            error
        } = await query;

        if (error) return res.status(400).json({error: error.message});

        res.status(200).json({reviews: data});
    } catch (err) {
        console.error('Erreur serveur lors de la récupération des avis :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// POST - Ajouter un avis pour un utilisateur ou une boutique
router.post('/reviews', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {
        client_id,
        tattoo_artist_id,
        shop_id,
        rating,
        comment
    } = req.body;

    if (!client_id || (!tattoo_artist_id && !shop_id) || !rating) {
        return res.status(400).json({
            error: 'Les champs client_id, rating, et une cible (tattoo_artist_id ou shop_id) sont requis.'
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({error: 'La note doit être comprise entre 1 et 5.'});
    }

    try {
        const {
            data,
            error
        } = await supabase
            .from('reviews')
            .insert({
                client_id,
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

// PUT - Mettre à jour un avis
router.put('/reviews/:id', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {id} = req.params;
    const {
        rating,
        comment
    } = req.body;

    if (!rating && !comment) {
        return res.status(400).json({error: 'Au moins un champ (rating ou comment) doit être fourni.'});
    }

    if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({error: 'La note doit être comprise entre 1 et 5.'});
    }

    try {
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
            .select();

        if (error) return res.status(400).json({error: error.message});

        if (!data || data.length === 0) {
            return res.status(404).json({error: 'Avis non trouvé.'});
        }

        res.status(200).json({
            message: 'Avis mis à jour avec succès.',
            review: data[0]
        });
    } catch (err) {
        console.error('Erreur serveur lors de la mise à jour de l\'avis :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// DELETE - Supprimer un avis
router.delete('/reviews/:id', verifyToken, verifyRole(['admin']), async(req, res) => {
    const {id} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);

        if (error) return res.status(400).json({error: error.message});

        res.status(200).json({message: 'Avis supprimé avec succès.'});
    } catch (err) {
        console.error('Erreur serveur lors de la suppression de l\'avis :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

module.exports = router;
