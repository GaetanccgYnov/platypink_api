// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// Middleware pour vérifier le token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({error: 'Token requis'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({error: 'Token invalide ou expiré'});
    }
};

// Middleware pour vérifier le rôle de l'utilisateur
const verifyRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({error: 'Accès non autorisé pour ce rôle'});
        }
        next();
    };
};

module.exports = {
    verifyToken,
    verifyRole
};