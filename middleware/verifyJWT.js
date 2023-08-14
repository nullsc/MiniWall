// verifyJWT.js
const { send } = require('express/lib/response')
const jsonwebtoken = require('jsonwebtoken')

function auth(req, res, next){
	const token = req.header('auth-token');
	//console.log('Auth function called!')
	
	if(!token){ // no header set
		return res.status(401).send({message: 'Access Denied'})
	}
	
	try{
		const verified = jsonwebtoken.verify(token, process.env.TOKEN_SECRET)
		req.user = verified // custom variable of req
		next()
	}catch(err){
		return res.status(401).send({message: `Invalid Token: ${err}`})
	}
	//next()
}

module.exports = auth

// use firefox tools to add auth-token header