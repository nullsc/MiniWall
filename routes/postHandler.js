// postHandler.js

const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post'); //
const jsonwebtoken = require('jsonwebtoken');
const mongoose = require('mongoose'); // for objectid

const verifyJWT = require('../middleware/verifyJWT');
const {postValidate, editpostValidate, commentValidate} = require('../middleware/validate');

const router = express.Router()

/* Create new post */
router.post('/post', verifyJWT, async(req, res, next) => { //
	//

	const {error} = postValidate(req.body);
	if (error){
		return res.status(400).send({message: error['details'][0]['message']});
		
	}
	const token = req.header('auth-token');
	const verify = jsonwebtoken.verify(token, process.env.TOKEN_SECRET);
	console.log(`Post owner: ${verify._id}`) // get user id
	
	const postowner = mongoose.Types.ObjectId(verify._id);
	console.log(`Post owner: ${postowner}`);
	
	const post = new Post({
		title:req.body.title,
		owner:postowner,
		description:req.body.description
	})
	
	console.log(`Received register username: ${req.body.username}`);
	
	try{
		const savedPost = await post.save() // save is a mongoose function
		res.send(savedPost) // returns json response
		console.log(`Saved post: ${savedPost}`) // debugging
	} catch(err){
		res.status(400).send({message:err}) // sends the error as json
	}
	
	next()
})

/* Delete post */
router.delete('/post/:id', verifyJWT, async(req, res, next) => { // works
	const id = req.params.id;
	console.log(`Requesting to delete post ID ${id}`);
	
	const post = await Post.findOne({_id:id})
	if (!post){
		console.log(`Can't find post`)
		return res.status(400).send({message:'Post doesn\'t exist'}); // no post exists
	}
	
	const token = req.header('auth-token');
	const verify = jsonwebtoken.verify(token, process.env.TOKEN_SECRET);
	
	const deleterID = mongoose.Types.ObjectId(verify._id);
	
	if (!post.owner.equals(deleterID)){ //
		return res.status(400).send({message:'Access denied'}); //
	}

	
	try{
		// find the post id and check if the owner posted it (auth)
		const deletePost = await Post.deleteOne({_id:id, owner: mongoose.Types.ObjectId(deleterID)}).exec(); // save is a mongoose function
		res.send(deletePost) // returns json response
		console.log(`Delete post: ${deletePost}`) // debugging
	} catch(err){
		res.status(400).send({message:err}) // sends the error as json
	}
	
	next()
})

/* Edit post */
router.patch('/post/:id', verifyJWT, async(req, res, next) => { // works
	const id = req.params.id;
	console.log(`Requesting to edit post ID ${id}`);
	const {error} = editpostValidate(req.body)
	if (error){
		return res.status(400).send({message: error['details'][0]['message']});
		
	}
	
	const post = await Post.findOne({_id:id})
	if (!post){
		console.log(`Can't find post`)
		return res.status(400).send({message:'Post doesn\'t exist'}); // no post exists
	}
	
	const token = req.header('auth-token');
	const verify = jsonwebtoken.verify(token, process.env.TOKEN_SECRET);
	
	const editerID = mongoose.Types.ObjectId(verify._id);
	console.log(`Editing with user ID: ${editerID}`);
	
	if (!post.owner.equals(editerID)){ //
		return res.status(400).send({message:'Access denied'}); //
	}
	
	try{
        const updatePostById = await Post.updateOne(
            {_id:req.params.id, owner: mongoose.Types.ObjectId(editerID)},
            {$set:{
                title:req.body.title,
				description:req.body.description
                }
            })
        res.send(updatePostById)
		console.log(`Edit post: ${updatePostById}`) // debugging
	} catch(err){
		res.status(400).send({message:err}) // sends the error as json
	}
	
	next()
})		

/* Like post by ID */
router.post('/like/:id', verifyJWT, async(req, res) => { //
	const id = req.params.id;
	console.log(`Requesting to like post ID ${id}`);
	
	const post = await Post.findOne({_id:id})
	if (!post){
		console.log(`Can't find post`)
		return res.status(400).send({message:'Post doesn\'t exist'}); // no post exists
	}
	
	
	const token = req.header('auth-token'); // get the token from the header
	const verify = jsonwebtoken.verify(token, process.env.TOKEN_SECRET);
	
	const likerID = mongoose.Types.ObjectId(verify._id);

	if (post.owner.equals(likerID)){ // compare objects (post.owner == likerID)
		console.log(`Can't like your own post (${post.owner} == ${likerID})`);
		return res.status(400).send({message:'You can\'t like your own post'}); //
	}
	console.log(`Test ${post.owner} : ${likerID}`)
	// check if user has already liked it
	const liked = await Post.findOne({_id:id, likes: mongoose.Types.ObjectId(likerID)}).exec() // need to search post id then like id
	console.log(`Like post: ${liked}`)
	
	if(liked){
		console.log(`Post already liked`)
		return res.status(400).send({message:'You have already liked this post!'}); //
	}
	
    try{
        const likePostById = await Post.updateOne(
            {_id:req.params.id},
            {$push:{
                likes: mongoose.Types.ObjectId(verify._id) // works 
                }
            })
        res.send(likePostById)
    }catch(err){
		console.log(err)
        res.send({message: err})
    } 

})


/* Unlike post by ID */
router.post('/unlike/:id', verifyJWT, async(req, res) => { //
	const id = req.params.id;
	console.log(`Requesting to unlike post ID ${id}`);
	
	const post = await Post.findOne({_id:id})
	if (!post){
		console.log(`Can't find post`);
		return res.status(400).send({message:'Post doesn\'t exist'}); // no post exists
	}
	
	const token = req.header('auth-token')
	const verify = jsonwebtoken.verify(token, process.env.TOKEN_SECRET);
	console.log(`Verify ${verify._id}`) // get user id
	
	const likerID = mongoose.Types.ObjectId(verify._id);
	
	// check if user has already liked it
	// returns null if it can't find liked post, so you can't remove another persons like
	const liked = await Post.findOne({_id:id, likes: mongoose.Types.ObjectId(likerID)}).exec() // need to search post id then like id
	console.log(`Unlike post: ${liked}`)
	
	if(liked){
		
		try{
			const unlikePostById = await Post.updateOne(
				{_id:req.params.id},
				{$pull:{
					likes: mongoose.Types.ObjectId(likerID) // works 
					}
				})
				
			res.send(unlikePostById)
		}catch(err){
			console.log(err)
			res.send({message: err})
		} 
	
	} else {
		return res.status(400).send({message:'You haven\'t liked this post!'}); //

	}
	
})

/* Comment on a post via ID */
// https://stackoverflow.com/questions/11637353/comparing-mongoose-id-and-strings
router.post('/comment/:id', verifyJWT, async(req, res) => {
	console.log(req.url)
	
	const id = req.params.id;
	console.log(`Requesting to comment on post ID ${id}`);
	
	const {error} = commentValidate(req.body);
	if (error){
		return res.status(400).send({message: error['details'][0]['message']});
		
	}
	
	const post = await Post.findOne({_id:id})
	if (!post){
		console.log(`Can't find post`)
		return res.status(400).send({message:'Post doesn\'t exist'}); // no post exists
	}
	
	const token = req.header('auth-token')
	const verify = jsonwebtoken.verify(token, process.env.TOKEN_SECRET);
	console.log(`Verify ${verify._id}`) // get user id
	
	const commenterID = mongoose.Types.ObjectId(verify._id);
	console.log(`Commenter: ${commenterID}`);
	
	if (post.owner.equals(commenterID)){ // compare objects
		console.log(`Can't comment on your own post (${post.owner} == ${commenterID})`);
		return res.status(400).send({message:'You can\'t comment on your own post'}); //
	}
	
	try{
        const commentPostById = await Post.findByIdAndUpdate(
            {_id:req.params.id}, // 
            {$push:{
				comments: {comment: req.body.comment, user: verify._id, date: Date.now()}
                }
            })
        res.send(commentPostById)
    }catch(err){
		console.log(err)
        res.send({message: err})
    }
})

/* Uncomment on a post via ID */
router.delete('/comment/:id', verifyJWT, async(req, res) => { // works
	const id = req.params.id;
	console.log(`Requesting to uncomment on comment ID ${id}`);
	
	const token = req.header('auth-token');
	const verify = jsonwebtoken.verify(token, process.env.TOKEN_SECRET);
	console.log(`Verify ${verify._id}`) // get user id
	
	const commenterID = mongoose.Types.ObjectId(verify._id); //
	console.log(`Commenter: ${commenterID}`);
	
	try{
		
		const removecommentById = await Post.updateOne( //
			{comments: {$elemMatch: {user: mongoose.Types.ObjectId(commenterID), _id: mongoose.Types.ObjectId(id)}}}, // filter, find post with the comment
			{$pull:{
				comments: {_id: mongoose.Types.ObjectId(id)} // 
				}
			})
			
		res.send(removecommentById)
	}catch(err){
		console.log(err)
		res.send({message: err})
	} 
	
})

/* Edit comment on a post via comment ID */
router.patch('/comment/:id', verifyJWT, async(req, res) => { // works
	const id = req.params.id;
	console.log(`Requesting to edit comment on comment ID ${id}`);
	
	const {error} = commentValidate(req.body);
	if (error){
		return res.status(400).send({message: error['details'][0]['message']});
		
	}

	const token = req.header('auth-token')
	const verify = jsonwebtoken.verify(token, process.env.TOKEN_SECRET);
	console.log(`Verify ${verify._id}`) // get user id
	
	const editerID = mongoose.Types.ObjectId(verify._id); // might not need to do this twice
	console.log(`Commenter: ${editerID}`);
	
	try{
        const updateCommentById = await Post.updateOne(
            {comments: {$elemMatch: {user: mongoose.Types.ObjectId(editerID), _id: mongoose.Types.ObjectId(id)}}},
            {$set:{
                "comments.$.comment":req.body.comment
                }
            })
        res.send(updateCommentById)
		console.log(`Edit comment: ${updateCommentById}`) // debugging
	} catch(err){
		res.status(400).send({message:err}) // sends the error as json
	}
	
})

/* Read all posts */
// need to add auth and sort
router.get('/', verifyJWT, async(req, res) => { // output all posts
	console.log(req.url)
	// sort by multiple criteria https://stackoverflow.com/questions/13567953/mongoose-mongodb-query-multiple-sort
	try { // .sort({'date': -1, 'likes': -1})
		const posts = await Post.find().sort({'likes': -1}) // sort by number of likes
		res.send(posts) // json format
	} catch(err){
		res.status(400).send({message:err})
	}
})

/* Read specific post via ID */
router.get('/:id', verifyJWT, async(req, res) => { // works
	const id = req.params.id;
	console.log(`Requesting to read post by ID ${id}`);
	
	try{
		const post = await Post.findOne({_id:id})
		if (!post){
			console.log(`Can't find post`)
			return res.status(400).send({message:'Post doesn\'t exist'}); // no post exists
		} else {
			console.log(`Post: ${post._id}`); // if post id == jwt
			res.send(post);
		}
	
	} catch(err){
		res.status(400).send({message:err})
	}

})

module.exports = router