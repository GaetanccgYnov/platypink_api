// routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Route d'inscription
router.post('/register', async(req, res) => {
    const {
        email,
        password,
        role,
        name,
        phone_number,
        address
    } = req.body;

    if (!email || !password || !role || !name) {
        return res.status(400).json({error: 'Tous les champs requis ne sont pas fournis.'});
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insérer l'utilisateur dans la table 'users'
        const {
            data: userData,
            error: userError
        } = await supabase
            .from('users')
            .insert([
                {
                    email,
                    password: hashedPassword,
                    role,
                    name,
                    phone_number,
                    address
                }
            ])
            .select();

        if (userError) {
            return res.status(400).json({error: userError.message});
        }

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            user: userData[0]
        });
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

// Route de connexion
router.post('/login', async(req, res) => {
    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({error: 'Email et mot de passe sont requis.'});
    }

    try {
        const {
            data: users,
            error
        } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (error || users.length === 0) {
            return res.status(400).json({error: 'Utilisateur non trouvé.'});
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({error: 'Mot de passe incorrect.'});
        }

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200)
           .json({
               token,
               user
           });
    } catch (error) {
        res.status(500).json({error: 'Erreur serveur.'});
    }
});

module.exports = router;
