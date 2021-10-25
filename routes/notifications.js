const express = require('express');
const router = express.Router();
const {sendNotification} = require('../functions/send_notification');
const fs = require('firebase-admin');

const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATEKEY_ID,
  "private_key": `-----BEGIN PRIVATE KEY-----\n${process.env.FIREBASE_PRIVATE_KEY_1}\n${process.env.FIREBASE_PRIVATE_KEY_2}\nHlej9fmrDlKjEaswljicWqj4KDKxetV/3Xj77d/GAReofHxcB/J876/50LxwkW7e\njuH8diOBL/xtadA3AhxfvS7Z4rQSMwEyhaSIf8/cE/QVfoFCXaYvhQIt3W8hiVzH\n2tDOQ0KrROrJBSW79heGgqZ069sCEf2A+Tb6tzJC46GrvNxOjLsoPP/jwcWVJlAr\nrvlzrZL1AG+7dDk0zybddUuDDXnly1TelmypVCckSAkDVIE+YRECUnBRffE7rA4w\nRHDd6pJPAgMBAAECgf9RlUi0IjSsPyYLibVHdP2+JYo5jHUdZcHhiVgOYd6IOpLt\nfMoqxzCpiFLfmGN4B4NnKTh9k549hMSSOxFGvedcJxVa3cwMZYQTCSBYGPRONWDT\nakcdnNmrhgKN957DlOv/RhKzMsYnGhZ2dstiqkY9YRY0n02Wbqodz81Q8fspB8xi\nQAGJLGmswZV3qUQWnkGdt5V7FQVALWthpYx2LJ/Z63QOiAnKnQDhkCh2p42ommzq\n3xJKzyfnvptbp8xNihW6Y8Ks551IVxXGHqwsnGKuaOYWZ1A7aU86+GoAKOV4zbJH\nopUhOQuJnpcn0mDzFiDyZNG2HqNtz3CmcJJO32kCgYEA2A90AwiXr5IcT/2wq86W\n7/eMzsQNY+oEZYqqqJtsQalkY838RemmUcWB7MiH3ycpUjSoFOopVUWyzRjqxCpH\nThux1FPGPjIvr+sr5KDq6kAVb9mB93rB5uJnYv9i6m/hn3XJgQVxhh/0RwcCdmk4\nRynX+tdtm1RbWjvXtbbWAGMCgYEAwn7xjXZ3QjJE6pNP+pTi6YJOLG1tFpbChaJH\nzxpyHbTtS0TeIkjTJvODJMeBqSuYvkIzZLR+0OYdWCF5o2I4mApflkD9xl+3Cv+C\nj5mL3HPaAGdjspp+lNw/zSuGF1X6DG8UITkjSScVmLIl9WKHANRAKVadBtSMknz+\n5ih+rCUCgYAkI6GSCFPm6BeYQaTVd/7DMLL6usxKlBAcM++LuEOJUB4cm43A2+4X\n62NqCbjAWLqOp4Qdy3UScFASAkLygOfgZr19+G1GZfqYAEwdN9VTTVjIlqcoj/3y\n8pe8dV9EO2aP15HW5OQyPRIM910wFTV2occgi/wnaRrGow/XszdkZQKBgCo71IoK\nWnU2Yz6oxGo+YFOiZwVAsbqA/DZ2ea9gJ72Jpyl8B9xcAfXoVObsp5wrilxuFajd\nhNgpz99uTXKMBowFXKJM9I5aBG5P83LpPbSeN4105fJHmAsNFJGhzNlOYyDGEhHw\nzVe6M/dXX+S8A2LLtC8Fzs1H5Ep+9/7UdkU9AoGADXITP/IcZtPIA38xOG6zgG/3\nl0H8RG4fU+9rnwStAqYhA6ICer4xxfHeS4LTo1cfBIV252RXG651aviwDr3d51Ie\nngyOz/UaYq9pU501W2otdep3dAmNPUQTUcYz6bbZ1fcLBSsvPZroecDuX1RGOj3y\nMukEVaoUQnn6UxALB7I=\n-----END PRIVATE KEY-----\n`,
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.FIREBASE_CERT_URL
};


fs.initializeApp({
  credential: fs.credential.cert(serviceAccount)
 });

router.post('/sendNotificationsForAddressActivity/:userID/:playerID',async  (req, res) => { 

      try{
         const db = fs.firestore(); 

         const from = await db.doc(`Users/${req.params.userID}/EthAccounts/${req.body.fullTransaction.from}`).get();

         const to = await db.doc(`Users/${req.params.userID}/EthAccounts/${req.body.fullTransaction.to}`).get();

         if(from.exists || to.exists){
            playerID = req.params.playerID;
        
            var message = { 
              content_available: true,
              app_id: process.env.ONESIGNAL_APP_ID,
              headings: {"en": "Transaction mined: "}, 
              contents: {"en": `${req.body.fullTransaction.hash}`},
              include_player_ids: [playerID.toString()],
            };
            
            sendNotification(message);
            res.status(200).send('sent');
         }else{
            res.status(200).send('not sent');  
         }
      
        
      
      }catch(error){
        console.log(error.message);  
        res.status(500).send({
            "error" : error.message
        });
      }
  
  });
  

  module.exports = router;