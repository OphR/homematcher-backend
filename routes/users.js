var express = require('express');
var router = express.Router();
const User = require('../models/users');
const Realty = require('../models/realtys');
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

router.get('/filteredUsers', (req, res) => {
  const token = req.headers.authorization;
  const filters = req.query; // Les filtres sont envoyés dans le corps de la requête
  //Exemple : delay[$lt] :7 , financed : true ,  financialCapacity[$lt] : 100000
  filters.token = { $ne: token }; // ne pas avoir son profil
  User.find(filters).then(data => {
    if (data.length > 0) {
      res.json({
        result: true,
        message: `${data.length} Utilisateurs qui correspond à vos critères de recherche`,
        users: data
      });
    } else {
      res.json({
        result: false,
        message: 'Aucun Utilisateurs n\'a été trouvé en fonction des critères de recherche fournis'
      })
    }

  }).catch(err => {
    console.error(err);
    res.status(500).json({ result: false, error: "Erreur lors de la récupération des Utilisateurs." });
  });
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
    const { username, delay, financed, budget, description, selectedImage } = req.body; 
    try {
      const profil = await User.findOneAndUpdate({token} , { username, delay, budget, financed, description, selectedImage}, { new: true });
  
      if (!profil) {
         res.json({ message: "profil non trouvé" });
      }
  
       res.json(profil); // Retourne le document mis à jour
    } catch (error) {
      console.error(error);
       res.json({ message: "Erreur lors de la mise à jour du profil" });
    }
  });
  
  // Route pour gérer les notifications
    router.post('/notifications', async (req, res) => {
      const token = req.headers.authorization;
      try {
          const {realtyId, action, email } = req.body;
          //Exemple : token : rdj4_t625PhSLGrbnVh_QnlZNOO7S8-v , realtyId: 65eedb8381acc97e07b529b2 , action: realtyLike , email : email@gmail.com
          if (action === 'realtyLike') {
              const [user, realty] = await Promise.all([
                  User.findOne({ token: token }),
                  Realty.findById(realtyId)
              ]);
  
          if (!user || !realty) {
              return res.status(404).json({ message: 'Utilisateur ou réalité introuvable.' });
          }
  
          // Envoyer la notification à l'utilisateur de la réalité
          const notificationMessage = `${user.username} a aimé votre bien immobilier N°${realty._id} .`;
          
          realty.likedBy.push(user._id);
          await realty.save();
  
          return res.status(200).json({ message: 'Notification envoyée avec succès.' ,notificationMessage});
      } else if (action === 'profileLike') {
        
        const likingUser = await User.findOne({ token: token }); // l'utilisateur qui aime le profil (moi en tant que vendeur)
        const likedUser = await User.findOne({ email: email }); //l'utilisateur dont le profil a été aimé (l'acheteur potentiel)
  
        if (!likingUser || !likedUser) {
            return res.status(404).json({ message: 'Utilisateur introuvable.' });
        }
  
        const notificationMessage = `${likingUser.username} a aimé votre profil de ${likedUser.username}`;
        // Envoyer la notification à l'utilisateur dont le profil a été aimé
  
        likedUser.likedBy.push(likingUser._id);
          await likedUser.save();
  
  
        return res.status(200).json({ message: 'Notification envoyée avec succès.', notificationMessage });
    } else {
          return res.status(400).json({ message: 'Action non prise en charge.' });
      }
  } catch (error) {
      console.error('Erreur lors de la gestion des notifications :', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la gestion des notifications.' });
  }
  });

module.exports = router;
