var express = require('express');
var router = express.Router();
const Realty = require('../models/realtys');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');

// Route pour récupérer tous les biens immobiliers
router.get('/', async (req, res) => {
  try {
      const token = req.headers.authorization; // Récupérer le token depuis les headers
      // Rechercher l'utilisateur correspondant au token
      const user = await User.findOne({ token: token });
      // Rechercher toutes les annonces associées à cet utilisateur
      const realtys = await Realty.find({ user: user._id });
      res.json({ result: true, realtys });
  } catch (error) {
      res.json({ message: error.message });
  }
});

module.exports = router;

  // Route pour ajouter un nouveau bien immobilier
  router.post('/addRealtys', async (req, res) => {
    //console.log("Requete reçue :", req.body);
    const { description, location, numberOfRooms, price, landArea, livingArea, propertyType, terrace } = req.body;
    const token = req.headers.authorization; // Récupérer le token depuis les headers
    console.log(token)
    if (!checkBody(req.body, [ 'description', 'location', 'numberOfRooms', 'price', 'landArea', 'livingArea', 'propertyType', 'terrace',])) {
      //console.log("Vérification des champs :", checkBody(req.body, ['description', 'location', 'numberOfRooms', 'price', 'landArea', 'livingArea', 'propertyType', 'terrace']));
      res.json({ result: false, error: 'Missing or empty fields' });
      return;
    }
    try {
      const user = await User.findOne({ token: token });
      // Créer un Realty avec les données reçues
      const realty = new Realty({
        user: user._id,
        description,
        location,
        numberOfRooms,
        price,
        landArea,
        livingArea,
        propertyType,
        terrace,
      });
  
      // Enregistrer Realty dans la base de données
      const savedRealty = await realty.save();
  
      res.json({result: true, savedRealty}); 
    } catch (error) {
      res.json({ message: error.message });
    }
  });

// Route pour mettre à jour un bien immobilier existant
router.put('/:id', async (req, res) => {
    // Récupération de l'identifiant du bien immobilier à mettre à jour depuis les paramètres de la requête
    const { id } = req.params;
    const  { description, location, numberOfRooms, price, landArea, livingArea, propertyType, terrace } = req.body; 
    
        try {
            const realty = await Realty.findByIdAndUpdate(id, { description, location, numberOfRooms, price, landArea, livingArea, propertyType, terrace }, { new: true });
        
            if (!realty) {
               res.json({ message: "realty non trouvé" });
            }
        
             res.json(realty); // Retourne le document mis à jour
          } catch (error) {
            console.error(error);
             res.json({ message: "Erreur lors de la mise à jour du realty" });
          }
        
    
});
// Route pour supprimer un bien immobilier
router.delete('/', async (req, res) => {
     // Suppression du bien immobilier avec l'identifiant spécifié
    Realty.deleteOne({ _id: req.params.id })
        .then(deletedRealty => {
          if(deletedRealty.deletedCount > 0) {
          //console.log(deletedRealty);
          res.status(200).json({ message: "Realty deleted successfully" });
          }else {
            res.status(200).json({ message: "Realty already delete"})
          }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: "An error occurred while deleting the realty" });
        });
});

router.delete('/delete', async (req, res) => {
  try {
      const token = req.headers.authorization; // Récupérer le token depuis les headers
      // Rechercher l'utilisateur correspondant au token
      const user = await User.findOne({ token: token });
      // Rechercher toutes les annonces associées à cet utilisateur
      const realtys = await Realty.find({ user: user._id });
      const deleteRealty = await Realty.deleteOne({realty: realtys })
      res.json({ result: true, deleteRealty });
  } catch (error) {
      res.json({ message: error.message });
  }
});

module.exports = router;
