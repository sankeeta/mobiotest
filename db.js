const mongoose = require("mongoose");

const db = mongoose.connect('mongodb+srv://mobiotestUser:GlMGjuQsmlEnpjTn@cluster0.z4gj0.mongodb.net/mobiotestDB').then((msg)=>{
        console.log('DB Connection success');
    }).catch(err=>{
        console.log('DB Connection error',err);
    })

module.exports = {
    db: db
}

