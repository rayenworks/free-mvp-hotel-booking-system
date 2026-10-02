const mongoconnect = require("mongoose");

const admin = new mongoconnect.Schema({
    email :{
        type: String,
        required: true,
        trim: true,
        unique:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:true,
        minlength:8,
    }
});


module.exports = mongoconnect.model("admin", admin);