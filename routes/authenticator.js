// authenticator.js

const express = require('express') // import libraries and functions
const User = require('../models/User')
const Post = require('../models/Post') //
const {registerValidate, loginValidate} = require('../middleware/validate')

const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')

const router = express.Router()

router.post('/register', async(req, res, next) => { // user registration
	//console.log(req.url)
	//res.send('api/register')
	console.log(registerValidate(req.body))
	const {error} = registerValidate(req.body)
	if (error){
		return res.status(400).send({message: error['details'][0]['message']});
		
	}
	
	// Check if user exists
	
	const userEmail = await User.findOne({email:req.body.email})
	if (userEmail){
		console.log(`Registration error, user already exists`)
		return res.status(400).send({message:'Registration error, user already exists'}); // email exists
	}
	
	// hash the password
	const salt = await bcryptjs.genSalt(5)
	const hashedPassword = await bcryptjs.hash(req.body.password, salt)
	
	// create a new user object
	const user = new User({
		username:req.body.username,
		email:req.body.email,
		password:hashedPassword
	})
	
	console.log(`Received register username: ${req.body.username}`);
	
	try{
		const savedUser = await user.save() // save is a mongoose function
		res.send(savedUser) // returns json response
		console.log(`Saved user: ${savedUser}`) // debugging
	} catch(err){
		res.status(400).send({message:err}) // sends the error as json
	}
	
	next()
})

router.post('/login', async(req, res, next) => {
	console.log(req.url)
	
	console.log(loginValidate(req.body))
	// validate the request data
	const {error} = loginValidate(req.body)
	if (error){
		return res.status(400).send({message: error['details'][0]['message']});
		
	}
	
	// Check if user exists
	
	const user = await User.findOne({email:req.body.email})
	if (!user){
		console.log(`Can't find user`)
		return res.status(400).send({message:'User doesn\'t exist'}); // no email exists
	}
	
	// Check user password by comparing to the salted pass
	const passwordValidation = await bcryptjs.compare(req.body.password, user.password)
	if (passwordValidation){ // password is correct
		
		//console.log(`Login successful! (${req.body.password} : ${user.password})`);
		const token = jsonwebtoken.sign({_id:user._id}, process.env.TOKEN_SECRET) // the id for the token is the user id from mongodb
		
		res.status(200).send({message: 'Sucess login!', 'auth-token': token});
		// can only do 1 send otherwise it crashes the server
		
	} else {
		return res.status(400).send({message: 'Incorrect password!'});
		console.log(`Bad password`)
	}
	next()

})

router.get('/', async(req, res) => {
	console.log(req.url)
	res.send('api/authenticator')
})

module.exports = router