var express = require('express');
var router = express.Router();
const Realty = require('../models/realtys');
const { checkBody } = require('../modules/checkBody');
const cloudinary = require('cloudinary').v2
const uniqid = require('uniqid')
const fs = require('fs')
const User = require('../models/users')

// Route pour récupérer tous les biens immobiliers
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization; // Récupérer le token depuis les headers
    // Rechercher l'utilisateur correspondant au token
    const user = await User.findOne({ token: token });
    // Rechercher toutes les annonces associées à cet utilisateur
    const realtys = await Realty.find({ user: user._id });
    if (realtys === null) {
      res.json({ result: false, error: "Il n' a pas de bien ajouté" });
    } else {
      res.json({ result: true, realtys });
    }

  } catch (error) {
    res.json({ message: error.message });
  }
});

// Route pour récupérer Uniquement les biens immobiliers Qui correspond à nos critères de recherche
router.get('/filteredRealtys', (req, res) => {
  const filters = req.query; // Les filtres sont envoyés dans le corps de la requête
  //Exemple : price[$gt] :1200000
  Realty.find(filters).then(data => {
    if (data.length > 0) {
      res.json({
        result: true,
        message: `${data.length} bien(s) immobiliers qui correspond à vos critères de recherche`,
        realty: data
      });
    } else {
      res.json({
        result: false,
        message: 'Aucun bien immobilier n\'a été trouvé en fonction des critères de recherche fournis'
      })
    }

  }).catch(err => {
    console.error(err);
    res.status(500).json({ result: false, error: "Erreur lors de la récupération des biens immobiliers." });
  });
});



module.exports = router;

// Route pour ajouter un nouveau bien immobilier
router.post('/addRealtys', async (req, res) => {
  //console.log("Requete reçue :", req.body);
  const {description, price, livingArea, outdoorArea, rooms, location,terrace,typeOfRealty,delay,budget,financed, imageUrl, realtyId,} = req.body;
  const token = req.headers.authorization; // Récupérer le token depuis les headers
  console.log(token)
  if (!checkBody(req.body, ['description', 'price', 'livingArea', 'outdoorArea', 'rooms', 'location', 'terrace', 'typeOfRealty', 'delay', 'budget', 'financed',])) {
    //console.log("Vérification des champs :", checkBody(req.body, ['description', 'location', 'numberOfRooms', 'price', 'landArea', 'livingArea', 'propertyType', 'terrace']));
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  try {
    const user = await User.findOne({ token: token });
    // Créer un Realty avec les données reçues
    const realty = new Realty({user: user._id, description, price, livingArea, outdoorArea, rooms, location,terrace,typeOfRealty,delay,budget,financed, imageUrl, realtyId,});

    // Enregistrer Realty dans la base de données
    const savedRealty = await realty.save();

    res.json({ result: true, savedRealty });
  } catch (error) {
    res.json({ message: error.message });
  }
});
// Route pour mettre à jour un bien immobilier existant
router.put('/:id', async (req, res) => {
  // Récupération de l'identifiant du bien immobilier à mettre à jour depuis les paramètres de la requête
  const { id } = req.params;
  const {description, price, livingArea, outdoorArea, rooms, location,terrace,typeOfRealty,delay,budget,financed, imageUrl, realtyId, } = req.body;

  try {
    const realty = await Realty.findByIdAndUpdate(id, {description, price, livingArea, outdoorArea, rooms, location,terrace,typeOfRealty,delay,budget,financed, imageUrl, realtyId,}, { new: true });

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
router.delete('/delete/:realtyId', async (req, res) => {
  try {
    const realtyId = req.params.realtyId; // Récupérer l'ID de la propriété immobilière depuis les paramètres de l'URL
    // Suppression du bien immobilier avec l'identifiant spécifié
    const realty = await Realty.deleteOne({ _id: realtyId });
    res.json({ result: true, realty });
  } catch (error) {
    res.json({ message: error.message });
  }
});

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: 'YOUR_CLOUD_NAME',
  api_key: 'YOUR_API_KEY',
  api_secret: 'YOUR_API_SECRET'
});
router.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.photoFromFront) {
      throw new Error('Aucun fichier trouvé');
    }

    const photoPath = `./tmp/${uniqid()}.jpg`;
    await req.files.photoFromFront.mv(photoPath);

    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    fs.unlinkSync(photoPath);

    res.json({ result: true, url: resultCloudinary.secure_url });
  } catch (error) {
    console.error('Erreur lors du téléchargement de la photo :', error);
    res.status(500).json({ result: false, error: error.message });
  }
});



module.exports = router;
