const nodemailer = require('nodemailer');

// Fonction pour envoyer un e-mail de récupération
function sendRecoveryEmail(email, recoveryToken) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "homematcher.team@gmail.com",
      pass: "homeMatcher2024"
    }
  });

  let mailOptions = {
    from: "homematcher.team@gmail.com",
    to: email,
    subject: 'Récupération de mot de passe',
    text: `Bonjour,\n\nVoici votre lien de récupération de mot de passe : http://votre_site.com/resetpassword?token=${recoveryToken}\n\nCordialement,\nVotre application`
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail de récupération : ', error);
    } else {
      console.log('E-mail de récupération envoyé : ', info.response);
    }
  });
}

module.exports = { sendRecoveryEmail };