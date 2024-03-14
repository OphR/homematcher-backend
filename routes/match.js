var express = require('express');
var router = express.Router();
const User = require('../models/users');
const Realty = require('../models/realtys');

// Route pour vérifier les "matches"
router.get('/acheteur', async (req, res) => {
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
  
  router.get('/vendeur', async (req, res) => {
    try {
  
      // on recupere l'id de de notre bien
      const myRealtyId = req.query;
  
      //on recupere l'id de l'utilisateur qu'on viens de liker
      const user2Id = req.query
  
  // on récupere les information de l'utilisateur qu'on viens de liker
      const user = await User.findById(user2Id);
  
  // et on se positionne sur l'id pour récuperer son id 
      const idUser =  user._id;
      
  // on recupere les infos de notre annonce 
      const realty = await Realty.findById(myRealtyId);
  
  //et on se position sur le tableau des likes
  //afin de recuperer le tableau d'id se trouvant dedans 
      const liked = realty.likedBy;
  
    /*on crée la condition qui va comparer l'id utilisateur qu'on viens de liker
        avec le tableau likedBy de notre annonce*/
      if (liked.includes(idUser)) {
  
  //si c'est ok c'est match
        res.json({result: true, message: "it's a match !"})
  
        //sinon c'est pas bon
      } else {
        res.json({result: false, message: "No match found!"})
      }
      
   
    }catch (error) {
      console.error(error);
      res.json({ message: 'Une erreur s\'est produite lors de la récupération des realties.' });
  }
  });

module.exports = router;