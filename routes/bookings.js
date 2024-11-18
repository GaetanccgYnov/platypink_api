// routes/bookings.js

const express = require('express');
const router = express.Router();
const {
    verifyToken,
    verifyRole
} = require('../middlewares/authMiddleware');
const {createClient} = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

router.post('/', verifyToken, verifyRole(['client']), async(req, res) => {
    const {
        flash_tattoo_id,
        tattoo_artist_id,
        date,
        time
    } = req.body;

    if (!date || !time || !tattoo_artist_id) {
        return res.status(400).json({error: 'Les champs date, time, et tattoo_artist_id sont obligatoires.'});
    }

    try {
        const {
            data,
            error
        } = await supabase
            .from('bookings')
            .insert({
                client_id: req.user.id,
                flash_tattoo_id,
                tattoo_artist_id,
                date,
                time,
                status: 'pending'
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

router.get('/client', verifyToken, verifyRole(['client']), async(req, res) => {
    try {


        // Récupérer les réservations du client
        const {
            data: bookings,
            error: bookingsError
        } = await supabase
            .from('bookings')
            .select('*')
            .eq('client_id', req.user.id);

        if (bookingsError) return res.status(400).json({error: bookingsError.message});

        const flashTattooIds = bookings.map((booking) => booking.flash_tattoo_id);

        // Récupérer les informations des flash tattoos liés
        const {
            data: flashTattoos,
            error: flashError
        } = await supabase
            .from('flashtattoos')
            .select('id, title, image_url')
            .in('id', flashTattooIds);

        if (flashError) return res.status(400).json({error: flashError.message});

        // Associer les données
        const enrichedBookings = bookings.map((booking) => {
            const tattoo = flashTattoos.find((ft) => ft.id === booking.flash_tattoo_id);
            return {
                ...booking,
                flash_tattoo: tattoo || null
            };
        });

        res.status(200).json({bookings: enrichedBookings});
    } catch (err) {
        console.error('Erreur serveur lors de la récupération des réservations :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

router.get('/artist', verifyToken, verifyRole(['tattoo_artist']), async(req, res) => {
    try {
        // Récupérer les réservations associées à l'artiste
        const {
            data: bookings,
            error: bookingsError
        } = await supabase
            .from('bookings')
            .select('*')
            .eq('tattoo_artist_id', req.user.id);

        if (bookingsError) return res.status(400).json({error: bookingsError.message});

        const clientIds = bookings.map((booking) => booking.client_id);
        const flashTattooIds = bookings.map((booking) => booking.flash_tattoo_id);

        // Récupérer les informations des clients liés
        const {
            data: clients,
            error: clientError
        } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', clientIds);

        if (clientError) return res.status(400).json({error: clientError.message});

        // Récupérer les informations des flash tattoos liés
        const {
            data: flashTattoos,
            error: flashError
        } = await supabase
            .from('flashtattoos')
            .select('id, title, image_url')
            .in('id', flashTattooIds);

        if (flashError) return res.status(400).json({error: flashError.message});

        // Associer les données
        const enrichedBookings = bookings.map((booking) => {
            const client = clients.find((c) => c.id === booking.client_id);
            const tattoo = flashTattoos.find((ft) => ft.id === booking.flash_tattoo_id);

            return {
                ...booking,
                client: client || null,
                flash_tattoo: tattoo || null
            };
        });

        res.status(200).json({bookings: enrichedBookings});
    } catch (err) {
        console.error('Erreur serveur lors de la récupération des réservations :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

router.put('/:id', verifyToken, verifyRole([
    'tattoo_artist',
    'admin'
]), async(req, res) => {
    const {id} = req.params;
    const {
        date,
        time,
        status
    } = req.body;
    const updates = {};

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

        res.status(200)
           .json({
               message: 'Réservation mise à jour avec succès.',
               booking: data[0]
           });
    } catch (err) {
        console.error('Erreur serveur lors de la mise à jour de la réservation :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

router.delete('/:id', verifyToken, verifyRole([
    'client',
    'tattoo_artist',
    'admin'
]), async(req, res) => {
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

        if (!data || data.length === 0) {
            return res.status(404).json({error: 'Réservation non trouvée.'});
        }

        res.status(200).json({message: 'Réservation supprimée avec succès.'});
    } catch (err) {
        console.error('Erreur serveur lors de la suppression de la réservation :', err);
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

module.exports = router;
