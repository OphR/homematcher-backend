var express = require('express');
var router = express.Router();
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const {sendRecoveryEmail} = require('../modules/sendRecoveryEmail')
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const validator = require('validator');



// Route pour envoyer un e-mail de récupération de mot de passe à l'utilisateur
router.post('/forgotpassword', async (req, res) => {
  if (!checkBody(req.body, ['email'])) {
    res.json({ result: false, error: 'Champs manquants ou vides' });
    return;
  }

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.json({ result: false, error: 'Utilisateur non trouvé' });
      return;
    }

    const recoveryToken = uid2(32);
    user.recoveryToken = recoveryToken;
    await user.save();

    sendRecoveryEmail(user.email, recoveryToken);

    res.json({ result: true, message: 'Email de récupération de mot de passe envoyé avec succès' });
  } catch (error) {
    console.error(error);
    res.json({ result: false, error: 'Une erreur s\'est produite lors du traitement de la requête' });
  }
});



// Récupère un utilisateurs precis grâce a son tokende la base de données
router.get('/', async (req, res) => {
  try{
    const token = req.headers.authorization; // Récupérer le token depuis les headers
// Rechercher l'utilisateur correspondant au token
    const user = await User.findOne({ token: token });

    res.json({result: true, user})
  } catch (error) {
    res.json({ message: error.message });
  }
});
 
  // Inscription d'un nouvel utilisateur
  router.post('/signup', (req, res) => {
    if (!checkBody(req.body, ['email', 'password'])) {
      res.json({ result: false, error: 'Champs manquants ou vides' });
      return;
    }
  
   
    User.findOne({ email: req.body.email }).then(data => {
      if (data === null) {
        const hash = bcrypt.hashSync(req.body.password, 10);
        if (!validator.isEmail(req.body.email)) {
          return res.json({result: false, error: "Veuillez fournir une adresse e-mail valide."});
      }
        const newUser = new User({
          email: req.body.email,
          password: hash,
          token: uid2(32),
        });
  
        newUser.save().then(newDoc => {
          res.json({ result: true, user: newDoc });
        });
      } else {
        // User already exists in database
        res.json({ result: false, error: 'L\'utilisateur existe déjà' });
      }
    });
  });

// Connexion d'un utilisateur existant
  router.post('/signin', (req, res) => {
    if (!checkBody(req.body, ['email', 'password'])) {
      res.json({ result: false, error: 'Champs manquants ou vides' });
      return;
    }
  
    User.findOne({ email: req.body.email }).then(data => {
      if (!validator.isEmail(req.body.email)) {
        return res.json({result: false, error:"Veuillez fournir une adresse e-mail valide."});
    }
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true, user: data });
      } else {
        res.json({ result: false, error: 'Utilisateur non trouvé ou mot de passe incorrect' });
      }
    });
  });
  
// Mise à jour du profil d'un utilisateur
  router.put('/update', async (req, res) => {
    const token = req.headers.authorization; //"50L-TX6qq3OrtIBQkB0tMXKkMVxqMdrh" // Récupérer le token depuis les headers
    const { email,username, delay, financed, financialCapacity, description } = req.body; 
    try {
      const profil = await User.findOneAndUpdate({token} , {  email,username, delay, financed, financialCapacity, description}, { new: true });
  
      if (!profil) {
         res.json({ message: "profil non trouvé" });
      }
  
       res.json(profil); // Retourne le document mis à jour
    } catch (error) {
      console.error(error);
       res.json({ message: "Erreur lors de la mise à jour du profil" });
    }
  });
  
module.exports = router;
