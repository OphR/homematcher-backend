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
    const { realtyId, action, email } = req.body;
    // Exemple : token : rdj4_t625PhSLGrbnVh_QnlZNOO7S8-v , realtyId: 65eedb8381acc97e07b529b2 , action: realtyLike , email : email@gmail.com

// Rechercher l'utilisateur en fonction du token
const user = await User.findOne({ token });
if (!user) {
  return res.status(404).json({ message: 'Utilisateur introuvable' });
}

// Créer un objet de notification
let notificationMessage = '';
if (action === 'realtyLike') {
  // Rechercher la réalité associée à realtyId
  const realty = await Realty.findById(realtyId);
  if (!realty) {
    return res.status(404).json({ message: 'Réalité introuvable' });
  }

  // Ajouter l'utilisateur à la liste des utilisateurs aimant cette réalité
  realty.likedBy.push(user._id);
  await realty.save();

  // Créer le message de notification
  notificationMessage = `${user.username} a aimé votre bien immobilier ${realty.description}.`;

  // Ajouter la notification à l'utilisateur
  // Rechercher l'utilisateur dont le bien a été aimé
  const realtyOwner = await User.findById(realty.user);
  if (!realtyOwner) {
    return res.status(404).json({ message: 'Propriétaire de la réalité introuvable' });
  }

  // Ajouter la notification au propriétaire de la réalité
  realtyOwner.notifications.push({
    action: 'realtyLike',
    realtyId,
    notificationMessage
  });
  await realtyOwner.save();

} else if (action === 'profileLike') {
  // Rechercher l'utilisateur associé à l'email
  const likedUser = await User.findOne({ email });
  if (!likedUser) {
    return res.status(404).json({ message: 'Utilisateur dont le profil a été aimé introuvable' });
  }

  // Ajouter l'utilisateur à la liste des utilisateurs aimant ce profil
  likedUser.likedBy.push(user._id);
  await likedUser.save();

  // Créer le message de notification
  notificationMessage = `${user.username} a aimé votre profil .`;

  // Ajouter la notification à l'utilisateur dont le profil a été aimé
  likedUser.notifications.push({
    action: 'profileLike',
    notificationMessage
  });
  await likedUser.save();
} else {
  return res.status(400).json({ message: 'Action non prise en charge' });
}

// Enregistrer les modifications de l'utilisateur
await user.save();

return res.status(200).json({ message: 'Notification envoyée avec succès.', notificationMessage });
  } catch (error) {
    console.error('Erreur lors de la gestion des notifications :', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la gestion des notifications.' });
  }
});

// Route GET /notifications
router.get('/notifications/messages', async (req, res) => {
  try {
    // Récupérer l'utilisateur en fonction du token
    const user = await User.findOne({ token: req.headers.authorization });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    // Renvoyer les notifications de l'utilisateur
    const notificationMessages = user.notifications.map(notification => notification.notificationMessage);
    return res.status(200).json({ notificationMessages: notificationMessages  });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages de notification :', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des messages de notification.' });
  }
});

// Route DELETE /notifications/:id
router.delete('/notifications/:id', async (req, res) => {
  try {
    // Récupérer l'utilisateur en fonction du token
    const user = await User.findOne({ token: req.headers.authorization });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

// Convertir l'ID de la notification en un nombre entier
const index = parseInt(req.params.id);

// Vérifier si l'index est valide
if (index < 0 || index >= user.notifications.length) {
  return res.status(404).json({ message: "Index de notification invalide" });
}

// Supprimer la notification à l'index spécifié
user.notifications.splice(index, 1);

// Enregistrer les modifications dans la base de données
await user.save();

return res.status(200).json({ message: "Notification supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification :", error);
    res.status(500).json({ message: "Une erreur est survenue lors de la suppression de la notification" });
  }
});

// Route pour vérifier les "matches"
router.get('/match', async (req, res) => {
  try {

      // on recupere l'id de l'utilisateur
      const user1Id = req.query;

      //on recupere l'id de l'annonce qu'on viens de liker
      const realtyId = req.query;

      //------ on verifie que l'annonce appartient bien au user qui se trouve dans notre LikedBy-------//

      // on cherche les info de l'annonce en question:
          const realty = await Realty.findById(realtyId)

          //on se positionne sur la clé user et on prend la seul valeur qui est dedans 
          // qui corresond a l'id de l'utilisateur a qui appartient la maison/appart
          const realtyUser = realty.user[0]

      // -------------Vérifier si le user 1 a aimé le user 2------------------//

      // on recupere nos information utilisatreur
      const user1LikesUser2 = await User.findById(user1Id);

      /*on se postionne sur la clé LikedBy ou se situe tous les utilisateur 
      qui ont aimer notre profil*/
      const user1LikesUser2Ids = user1LikesUser2.likedBy
 
      /*on crée la condition qui va comparer l'id utilisateur a qui appartient le bien
      avec ce qui est contenu dans notre tableau likedBy*/
   if (user1LikesUser2Ids.includes(realtyUser)){

    //si c'est ok c'est match
      res.json({result: true, message: "it's a match !"})

      //sinon c'est pas bon
    } else {
      res.json({result: false, message: "No match found!"})
    }
  } catch (error) {
      console.error(error);
      res.json({ message: 'Une erreur s\'est produite lors de la récupération des realties.' });
  }
});   

module.exports = router;