const mongoclient = require('mongodb').MongoClient
const express = require('express');
const request = require('request');
const app = express();
const bodyparser=require('body-parser');
app.use(bodyparser.urlencoded({extended:true}));
require("dotenv").config();
const twilioClient = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const verificationSID = "VA4e1ea94f0bfa43728330287062d535b0"
app.set('view engine', 'ejs')


mongoclient.connect('mongodb+srv://ShivanshGupta:india@2006@blogdb.xowev.mongodb.net/test?retryWrites=true&w=majority', {
    useUnifiedTopology:true})



        
.then(client=>{
    console.log('Connected to database')
    const db = client.db('VaccineDB')
    const title = db.collection('Register')
    app.set('view engine','ejs')
    app.listen(3000,function(req,res){
       console.log('server is running')
   })
   app.get('/', (req, res) => {
    res.render('index', { data: null, error: null })
});
app.get('/verify', (req, res) => {
  res.render('verify', { data: null, error: null })
});
app.post('/', (req, res) => {

    let stateID = req.body.stateID
    let url = `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateID}`
    request(url, (error, response, body)=> {
        
        if (error) {
            res.render('index', { data: null, error: 'Error Please try again' })
        }
        else {
            data = JSON.parse(body);
            res.render('list', { data : data, error: null })
        }
    });

})
app.post('/save', (req, res) => {
    
    console.log(req.body)
    req.body.isVerified = false;
    title.insertOne(req.body)           
    twilioClient.verify
    .services(verificationSID)
    .verifications.create({ to: req.body.mail, channel: "email" })
    .then(verification => {
      res.render('save.ejs',{mail:req.body.mail})
      console.log("Verification email sent");
      
    })
    .catch(error => {
      console.log(error);
    });

})

   app.post("/check", (req, res) => {
            
    

    twilioClient.verify
      .services(verificationSID)
      .verificationChecks.create({ to: req.body.mail, code: req.body.code })
      .then(verification_check => {
        if (verification_check.status === "approved") {
          title.findOneAndUpdate(
              {"mail":req.body.mail},
              {$set:{"isVerified":true}}

          )
            .then((result) => {
              res.render('success.ejs')
            })
            .catch((error) => console.log(error));
        } else {
          res.render('fail.ejs')
        }
      })
      .catch(error => {
        console.log(error);
        res.render('fail.ejs')
      });
    
            });
            
               app.get('/findmyslots',function(req,res){
                res.render('findslots.ejs',{data:null, place:null})
               }) 
               app.get('/slots',function(req,res){
                res.render('slots.ejs',{data: null, place:null})
               }) 
  
               app.post('/findmyslots', (req, res) => {
                let pincode = req.body.pincode
                let date = req.body.date
                let url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${pincode}&date=${date}`
                request(url, (error, response, body)=> {
                   
                    if (error) {
                        res.render('slots.ejs', { data: null, error: 'Error Please try again' })
                    }
                    else {
                        data = JSON.parse(body);
                        console.log(data)
                        res.render('slots.ejs', { data: data, place:null, error: null })
                      
                    }
                });
            
                
            }) 
            app.post('/slots', (req, res) => {
              let place = req.body.place
              let pincode2 = req.body.pincode
              let date2 = req.body.date

              let url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${pincode2}&date=${date2}`
              request(url, (error, response, body)=> {
             
                  if (error) {
                      res.render('slots.ejs', { data: null, place:null, error: 'Error Please try again' })
                  }
                  else {
                      data = JSON.parse(body);
                      res.render('slots.ejs', { data: data, place:place, error: null })
                    
                      console.log(place)
                  }
              });
          
              
          }) 

})



