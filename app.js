const express = require("express");
const app = express();
// const http = require("http").Server(app);
const bodyParser = require("body-parser");
const multer = require("multer");

/**DB connection */
const {db} = require("./db");

/**Middleare */
const {middleware} = require("./middleware");


const port = process.env.PORT || 4000;
const uplods = multer({dest : './uploads'});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));



/** API Calls */

app.post('/signup',
uplods.single('file'),
middleware.validateSignupContent,
middleware.checkIfUserExist,
middleware.getprofilePicUploadDetails,
middleware.generatePassword,
middleware.saveUser,
middleware.getToken,
(req,res)=>{ res.status(200).send({token:req.accessToken});})

app.post('/login',
middleware.checkUser,
middleware.getToken,
(req,res)=>{res.status(200).send({token:req.accessToken});})

app.get('/userprofile',
middleware.authenticate,
middleware.getProfileDetails,
(req,res)=>{ res.status(200).send(req.user_details); })

app.get('/userprofile/:filename',
middleware.authenticate,
middleware.getProfilePicture,
(req,res)=>{ res.status(200).sendFile(req.profile_pic); })

const server = app.listen(port,()=>{
    console.log('Server running on port ',server.address().port)
})