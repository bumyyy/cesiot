import Auth from '../model/auth.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const JWT_SECRET = '1234';

export const login = async (req, res) => {
  const { username, password } = req.body;

  const results = await Auth.checkPassword(username);
  
    // 2. Si l'utilisateur n'existe pas
    if (!results || results.length === 0) {
        return res.status(401).json({ message: 'Utilisateur ou mot de passe incorrect' });
    }

    const user = results[0];

    try {
        // 3. Comparaison du mot de passe
        const match = await bcrypt.compare(password, user.password);
        
        if (!match) {
            return res.status(401).json({ message: 'Utilisateur ou mot de passe incorrect' });
        }

        // 4. Création du Token
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // 5. Succès
        res.status(200).json({ 
            message: 'Login successful', 
            token: token,
            user: { username: user.username, role: user.role }
        });

    } catch (error) {
        // Si bcrypt ou jwt plante, on attrape l'erreur ici pour ne pas crasher
        console.error("Erreur Auth:", error);
        return res.status(500).json({ message: "Erreur lors de l'authentification" });
    };
};

export const addUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        
        if (!username || !password || !role) {
            return res.status(400).json({ message: "Tous les champs sont requis" });
        }

        await Auth.addUser(username, password, role);
        res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la création (Pseudo déjà pris ?)" });
    }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await Auth.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error("Erreur récupération users:", err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des utilisateurs" });
  }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params; //(/users/5)
        await Auth.deleteUser(id);
        res.json({ message: 'Utilisateur supprimé' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur suppression" });
    }
};

export const authenticateJWT = (req, res, next) => {
  // Get auth header - The Authorization header is commonly used to send authentication tokens
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user to request
    req.user = decoded;

    next();

  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeAdmin = (req, res, next) => {

  // authenticateJWT doit être exécuté avant
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  next();
};