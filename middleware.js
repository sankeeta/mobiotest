const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const fs = require("fs")
const path = require('path');
const {User} = require("./user_module");
const {config} = require("./config");
const {libFunction} = require("./functions")


const middleware = {

    validateSignupContent : (req,res,next)=>{
        if(req.body.name && req.body.email && req.body.dob && req.body.password){
            console.log('req.body.dob  ',req.body.dob)
            var dob = Date.parse(req.body.dob);
            if (isNaN(dob) == false) {
                var d = new Date(dob);
                req.dob = d;
                next();
            }
            else { res.status(400).send('Invalid date of birth');}
            
        }
        else {  res.status(400).send('Some fields are mandetory');}
    },

    checkIfUserExist : (req,res,next) => {
        User.find({email:req.body.email,deleted:false}).then(u=>{
            if(u.length){
                return res.status(409).send('User already registered');
            }
            next();
        })
    },

    getprofilePicUploadDetails : (req,res,next)=>{
        if(req.file){
            const extArray = req.file.mimetype.split("/");
            const extension = extArray[extArray.length - 1];
            const new_filename = 'profilepic_' + req.file.filename + "." + extension;
            const old_path = path.join(__dirname,'./uploads/',req.file.filename);
            const new_path = path.join(__dirname,'./uploads/',new_filename);
            
            fs.renameSync( old_path, new_path);
           
            req.profile_pic = new_filename;
            next();
        }
    },

    generatePassword : (req,res,next)=>{
        bcrypt.hash(req.body.password, 10, function(err, hash) {
            console.log('hash : ',hash)
            if(!err){
                req.hash = hash;
                next();
            }
            else { res.status(500).send('There was some error ',err);}
        })
    },

    saveUser : (req,res,next)=>{
        var timestamp = parseInt(new Date().getTime()); 
        var user = new User({
            name : req.body.name,
            email:req.body.email,
            password : req.hash,
            dob : req.dob,
            profile_pic : req.profile_pic,
            timestamp:timestamp
        })
        user.save((err,u)=>{
            if(err) {
                console.log('saveUser : ',err)
                return res.status(500).send('There was some error ')
            }
            else{
                req.user = u
                next();
            }
        })
    },

    getToken : (req,res,next)=>{
        let timestamp = parseInt(new Date().getTime())
        let payload = {
            sub:req.user._id,
            iat: timestamp,
            exp: timestamp + 24*60*60*1000
        } 
        
        var accessTokenSecret = config.accessTokenSecret;
        const accessToken = jwt.sign(payload, accessTokenSecret);

        req.accessToken =accessToken;
        next();
    },

    checkUser : (req,res,next)=>{
        let {email,password} = req.body;
        password = (password).toString();
        User.find({email:email,deleted:false}).then((u)=>{
            if(u.length>1 || u.length==0) {
                res.status(403).send("Username or password incorrect");
            }
            else{
                const user = u[0];
                bcrypt.compare(password, user.password, function(err,r) {
                    console.log('err ',err)
                    console.log('r ',r)
                    if(r){
                        req.user = {_id:user._id,email:user.email};
                        next();
                    }
                    else{
                        console.log(err);
                        res.status(500).send('Invalid Credentials');
                    }
                })
            }
            
        }).catch(err=>{
            res.status(500).send('There was some error');
        })
    },

    authenticate : (req,res,next)=>{
        const auth = req.header('Authorization');
        if(auth){
            const token = auth.split(' ')[1];
            jwt.verify(token,config.accessTokenSecret,(err,usertoken)=>{
                if (err) {
                   return res.status(403).send('Unauthorized user'); 
                }
                req.usertoken = usertoken;
                next(); 
            })
        }
        else{
            res.status(401); 
        }
    },

    getProfileDetails : (req,res,next)=>{
        User.findById(req.usertoken.sub,{name:1,email:1,profile_pic:1,dob:1}).then((user)=>{
            let birthday_alert = "";
            let dob = user.dob;
            
            /** Check if birtday is in coming week */
            let b_date = new Date(dob).getDate();
            let b_month = new Date(dob).getMonth();
            let b_year = new Date(dob).getFullYear();
            let year = new Date().getFullYear();

            let birth_day = new Date(year,b_month,b_date);
            let today = new Date();
            let nextweek_date = new Date();
            nextweek_date.setDate(nextweek_date.getDate() + 7);

            if(today <= birth_day && birth_day <= nextweek_date){
                const birtday_time_diff = birth_day-today;
                const birtday_days = parseInt(parseInt(birtday_time_diff)/(1000*60*60*24))
                console.log("birthday coming in ",birtday_days )
                if(birtday_days>1)
                    birthday_alert = birtday_days + " days to go";
                else if(birtday_days==1)
                    birthday_alert = birtday_days + " day to go";
                else
                    birthday_alert = "Happy birthday";
            }
            
            req.user_details = {
                name : user.name,
                email:user.email,
                dob:new Date(b_year,b_month,b_date).toDateString(),
                birthday_alert:birthday_alert,
                profile_pic:user.profile_pic
            };

            next();
        }).catch(err=>{
            res.status(500).send('There was some error');
        })
    },

    getProfilePicture : async(req,res,next)=>{
        console.log("inside ",req.params.filename);
        
        let profile_pic = path.join(__dirname,'./uploads/', req.params.filename);
        console.log("profile_pic ",profile_pic);
        req.profile_pic = profile_pic;
        return next();
    }


}
module.exports = {
    middleware
}