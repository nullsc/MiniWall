// app.js
'use strict';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

require('dotenv/config');
app.use(bodyParser.json());

const authRoute = require('./routes/authenticator');
const postRoute = require('./routes/postHandler');

app.use('/api/user', authRoute); // create the routes
app.use('/api/posts', postRoute);

app.disable('x-powered-by'); // remove header for security

mongoose.connect(process.env.DB_CONNECTOR, () => {
    console.log('DB is connected')
})

app.get('/', (req, res) => {
	res.send('Main Page')
})

app.get('*', (req, res) => { /* 404 error page, comes last */
	res.status(404).send('404: Page Not Found')
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})






