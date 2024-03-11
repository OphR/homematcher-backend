var express = require('express');
var router = express.Router();

const Pusher = require('pusher');
const pusher = new Pusher({
    appId: process.env.PUSHER_APPID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
  });

  router.post('/message', (req, res) => {
    const message = req.body;
  
    pusher.trigger('Home Matcher', 'message', message);
  
    res.json({ result: true });
  });

module.exports = router;