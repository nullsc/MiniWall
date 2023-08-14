// validate.js
'use strict';
const joi = require('joi');


function registerValidate(data){
	const jsonValidate = joi.object({
		username: joi.string().required().min(3).max(50),
		email: joi.string().required().min(3).max(100).email(),
		password: joi.string().required().min(8).max(50),
		date: joi.date()
	})
	return jsonValidate.validate(data) // boolean
}

function loginValidate(data){
	const jsonValidate = joi.object({
		email: joi.string().required().min(3).max(100).email(),
		password: joi.string().required().min(8).max(50)
	})
	return jsonValidate.validate(data) // boolean	
}

function postValidate(data){ //
	const jsonValidate = joi.object({
		title: joi.string().required().min(3).max(100),
		description: joi.string().required().min(3).max(1000),
		date: joi.date()
	})
	return jsonValidate.validate(data) // boolean		
}

function editpostValidate(data){ //
	const jsonValidate = joi.object({
		title: joi.string().required().min(3).max(100),
		description: joi.string().required().min(3).max(1000),
		date: joi.date()
	})
	return jsonValidate.validate(data) // boolean		
}

function commentValidate(data){ //
	const jsonValidate = joi.object({
		comment: joi.string().required().min(3).max(1000),
		date: joi.date()
	})
	return jsonValidate.validate(data) // boolean		
}
/*
https://stackoverflow.com/questions/57658864/how-to-validate-for-objectid

*/

module.exports.registerValidate = registerValidate
module.exports.loginValidate = loginValidate
module.exports.editpostValidate = editpostValidate
module.exports.postValidate = postValidate
module.exports.commentValidate = commentValidate

