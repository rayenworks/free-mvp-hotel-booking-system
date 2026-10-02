const mongoconnect = require("mongoose");

const booking = new mongoconnect.Schema({
    guestName :{
        type : String,
        required : true,
    },
    phone:{
        type:String,
        required : true,
        trim : true,
    },
    checkIn:{
        required:true,
        type:Date,
    },
    checkOut:{
        type:Date,
        required:true,
    },
    guests :{
        type:Number,
        min: 1,
        required:true,
    },
      room: {
      type: mongoconnect.Schema.Types.ObjectId,
      ref: "room",
      required: true
  },
    status: {  // pending,confirmed,cancelled
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending"
},
})


module.exports = mongoconnect.model("booking", booking);