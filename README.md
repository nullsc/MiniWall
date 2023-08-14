# MiniWall
## Facebook REST API clone


The MiniWall application is made using Node.js, Express.js and MongoDB. It has multiple endpoints that allow a user to create, read, update, delete, like and comment on posts and it also has endpoints to allow users to register accounts and to login. The system requires a user to login to a valid account before they can access the system. The registration system uses a library to salt and hash passwords so they are not kept in plaintext form which helps with security. When a user logs into an account they are given a JWT which acts as a session to authenticate them.

Every user has a unique ID that is used to identify who create a post and who comments or likes other posts. This means the system can prevent users from commenting on their own posts etc. it also means that the system prevents users from deleting other users posts which they are not authorized to do so. When a user logs in successfully the users ID is added to the JWT, this is added to enable user verification and avoids adding sensitive information such as username or passwords to a client sided token.


### Register users

curl -X POST localhost:3000/api/user/register -H "Content-type:application/json" -d "{\"username\": \"olga\", \"email\":\"olga@example.com\", \"password\":\"123456789\"}"

### Users login

curl -X POST localhost:3000/api/user/login -H "Content-type:application/json" -d "{\"email\":\"olga@example.com\", \"password\":\"123456789\"}"

### Create a new post

curl -X POST localhost:3000/api/posts/post -H "Content-type:application/json" -H "auth-token:<>" -d "{\"title\": \"JWT post\", \"description\":\"here is a new post made by Olga\", \"date\":\"0\"}"
