var express = require('express');
var router = express.Router();
const Realty = require('../models/realtys');
const { checkBody } = require('../modules/checkBody');

const cloudinary = require('cloudinary').v2
const uniqid = require('uniqid')
const fs = require('fs')

// Route pour récupérer tous les biens immobiliers
router.get('/', (req, res) => {
  Realty.find().then(data => {
    res.json({ result: true, realty: data })
  });
  });

  // Route pour ajouter un nouveau bien immobilier
router.post('/addRealtys', (req, res) => {
  if (!checkBody(req.body, ['description', 'area', 'numberOfRooms', 'price', 'delay', 'budget', 'financed', 'imageUrl'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
 // Création d'un nouveau bien immobilier avec les données reçues
  const newRealty = new Realty({
    description: req.body.description,
    area: req.body.area,
    rooms: req.body.rooms,
    price: req.body.price,
    delay: req.body.delay,
    budget : req.body.budget,
    financed: req.body.financed,
    imageUrl: req.body.imageUrl,
  });
  newRealty.save().then(newData => {
    res.json({ result: true, realty: newData });
  });
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
router.delete('/:id', async (req, res) => {
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

router.post('/upload', async (req, res) => {
  console.log(req.files.photoFromFront)
  // Définir le chemin en local du fichier
  const photoPath = `./tmp/${uniqid()}.jpg`
  console.log(photoPath)
  const resultMove = await req.files.photoFromFront.mv(photoPath)

  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath)
    res.json({ result: true, url: resultCloudinary.secure_url })

  } else {
    res.json ({ result: false, error: resultMove})
  }
    fs.unlinkSync(photoPath)
})
module.exports = router;
