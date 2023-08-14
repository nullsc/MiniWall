// Post.js
// https://mongoosejs.com/docs/schematypes.html
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    title:{
        type:String,
        require:true,
        min:3,
        max:256
    },
    owner:{
        type:mongoose.Types.ObjectId, // holds the id of the User object
        require:true
    },
    description:{
        type:String,
        require:true,
        min:10,
        max:1024
    },
	likes:[ //
		{type: mongoose.Types.ObjectId, required: false}
	],
	comments:{ //
        type: [{
			user:mongoose.Types.ObjectId, //
			comment:String,
			date:Date
		}],
        require:false
    },
    date:{
        type:Date,
        default:Date.now
    }
})

module.exports=mongoose.model('posts',userSchema) //table name