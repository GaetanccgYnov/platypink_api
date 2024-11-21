// NON UTILISÉ DANS LE PROJET FINAL
// NON UTILISÉ DANS LE PROJET FINAL
// NON UTILISÉ DANS LE PROJET FINAL
// NON UTILISÉ DANS LE PROJET FINAL
// NON UTILISÉ DANS LE PROJET FINAL


const express = require('express');
const router = express.Router();
const {
    verifyToken,
    verifyRole
} = require('../middlewares/authMiddleware');
const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Créer un nouveau shop
router.post('/', verifyToken, verifyRole([
    'shop',
    'admin'
]), async(req, res) => {
    const {
        name,
        location,
        social_links
    } = req.body;

    try {
        const {
            data,
            error
        } = await supabase
            .from('Shops')
            .insert([
                {
                    user_id: req.user.id,
                    name,
                    location,
                    social_links
                }
            ])
            .select();

        if (error) return res.status(400).json({error: error.message});

        res.status(201).json({shop: data[0]});
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// Obtenir tous les shops
router.get('/', verifyToken, async(req, res) => {
    try {
        const {
            data,
            error
        } = await supabase.from('Shops').select('*');

        if (error) return res.status(400).json({error: error.message});

        res.status(200).json({shops: data});
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// Supprimer un shop (uniquement pour l'admin ou le propriétaire du shop)
router.delete('/:id', verifyToken, verifyRole([
    'admin',
    'shop'
]), async(req, res) => {
    const {id} = req.params;

    try {
        const {
            data,
            error
        } = await supabase
            .from('Shops')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.role === 'admin' ? undefined : req.user.id);

        if (error) return res.status(400).json({error: error.message});

        res.status(200).json({message: 'Shop supprimé avec succès'});
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

module.exports = router;
