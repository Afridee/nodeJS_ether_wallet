const express = require('express');
const router = express.Router();
const {sendNotification} = require('../functions/send_notification');

router.post('/sendNotificationsForAddressActivity/:playerID',async  (req, res) => { 

      try{
        playerID = req.params.playerID;
    
        var message = { 
          content_available: true,
          app_id: process.env.ONESIGNAL_APP_ID,
          headings: {"en": "Transaction mined: "}, 
          contents: {"en": `${req.body.fullTransaction.hash}`},
          include_player_ids: [playerID.toString()],
        };
      // var message = { 
      //     content_available: true,
      //     app_id: process.env.ONESIGNAL_APP_ID,
      //     headings: {"en": "Address Activity"}, 
      //     contents: {"en": "one of your transactions has been made. please check..."},
      //     include_player_ids: [playerID.toString()],
      //   };
        
        sendNotification(message);
      
        res.status(200).send('ok');
      
      }catch(error){
        console.log(error.message);  
        res.status(500).send({
            "error" : error.message
        });
      }
  
  });
  

  module.exports = router;