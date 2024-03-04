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
    res.json({ result: false, error: 'Missing or empty email field' });
    return;
  }

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.json({ result: false, error: 'User not found' });
      return;
    }

    const recoveryToken = uid2(32);
    user.recoveryToken = recoveryToken;
    await user.save();

    sendRecoveryEmail(user.email, recoveryToken);

    res.json({ result: true, message: 'Password recovery email sent successfully' });
  } catch (error) {
    console.error(error);
    res.json({ result: false, error: 'An error occurred while processing the request' });
  }
});



// Récupère tous les utilisateurs de la base de données
router.get('/', (req, res) => {
  User.find().then(data => {
    res.json({ result: true, User: data })
  });
  
  });
  // Inscription d'un nouvel utilisateur
  router.post('/signup', (req, res) => {
    if (!checkBody(req.body, ['email', 'password'])) {
      res.json({ result: false, error: 'Missing or empty fields' });
      return;
    }
  
   
    User.findOne({ email: req.body.email }).then(data => {
      if (data === null) {
        const hash = bcrypt.hashSync(req.body.password, 10);
        if (!validator.isEmail(req.body.email)) {
          return res.json("Veuillez fournir une adresse e-mail valide.");
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
        res.json({ result: false, error: 'User already exists' });
      }
    });
  });

// Connexion d'un utilisateur existant
  router.post('/signin', (req, res) => {
    if (!checkBody(req.body, ['email', 'password'])) {
      res.json({ result: false, error: 'Missing or empty fields' });
      return;
    }
  
    User.findOne({ email: req.body.email }).then(data => {
      if (!validator.isEmail(req.body.email)) {
        return res.json("Veuillez fournir une adresse e-mail valide.");
    }
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true, user: data });
      } else {
        res.json({ result: false, error: 'User not found or wrong password' });
      }
    });
  });
  
// Mise à jour du profil d'un utilisateur
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, age, prosituation, financialCapacity, desciption  } = req.body; 
    if (!checkBody(req.body, ['firstname', 'lastname', 'age', 'prosituation', 'financialCapacity', 'desciption' ])) {
      res.json({ result: false, error: 'Missing or empty fields' });
      return;
    }
    try {
      const profil = await User.findByIdAndUpdate(id, { firstname, lastname, age, prosituation, financialCapacity, desciption }, { new: true });
  
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
