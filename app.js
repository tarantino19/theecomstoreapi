const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

app.use(cors());
app.options('*', cors());

//middleware
app.use(express.json()); //for parsing application/json=we can res.send in a readable format
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);

//routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');

//env
const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

//mongoose connect before starting the server
mongoose
	.connect(process.env.CONNECTION_STRING)
	.then(() => {
		console.log('Database connection is ready');
	})
	.catch((err) => {
		console.log(`Error: ${err}`);
	});

//server
app.listen(3000, () => {
	console.log('Hi, Mom!');
	console.log('Server is running on port 3000');
});
