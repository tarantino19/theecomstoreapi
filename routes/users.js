const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//i can also create an API with only the fields i want revealed by doing dot select ('name email etc.')
//GET USER AND USER LIST EXCLUDING PASSWORD
router.get(`/`, async (req, res) => {
	const userList = await User.find().select('-passwordHash');

	if (!userList) {
		res.status(500).json({ success: false });
	}
	res.send(userList);
});

//GET A SINGLE USER
router.get(`/:id`, async (req, res) => {
	const user = await User.findById(req.params.id).select('-passwordHash');

	if (!user) {
		res.status(500).json({ success: false, message: `The user with id ${req.params.id} cannot be found!` });
	}
	res.send(user);
});

//POST/REGISTER a new user API
router.post(`/`, async (req, res) => {
	let user = new User({
		name: req.body.name,
		email: req.body.email,
		passwordHash: bcrypt.hashSync(req.body.password, 10),
		phone: req.body.phone,
		isAdmin: req.body.isAdmin,
		street: req.body.street,
		apartment: req.body.apartment,
		zip: req.body.zip,
		city: req.body.city,
		country: req.body.country,
	});

	user = await user.save();

	if (!user) {
		res.status(400).json({ success: false, message: 'The user cannot be created!' });
	}

	res.send(user);
});

//LOGIN A USER REST API AND CREATE A TOKEN

router.post('/login', async (req, res) => {
	const user = await User.findOne({
		email: req.body.email,
	});

	const secret = process.env.secret;

	if (!user) {
		return res.status(400).send('Invalid email or password');
	}

	if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
		const token = jwt.sign(
			{
				userId: user.id,
				isAdmin: user.isAdmin,
			},
			secret,
			{ expiresIn: '1d' }
		);
		res.status(200).send({ user: user.email, token: token });
	} else {
		res.status(400).send('Password is wrong');
	}
});

//register account api
router.post(`/register`, async (req, res) => {
	let user = new User({
		name: req.body.name,
		email: req.body.email,
		passwordHash: bcrypt.hashSync(req.body.password, 10),
		phone: req.body.phone,
		isAdmin: req.body.isAdmin,
		street: req.body.street,
		apartment: req.body.apartment,
		zip: req.body.zip,
		city: req.body.city,
		country: req.body.country,
	});

	user = await user.save();

	if (!user) {
		res.status(400).json({ success: false, message: 'User not created' });
	}

	res.send(user);
});

//GET USER COUNT REST API
router.get(`/get/count`, async (req, res) => {
	const userCount = await User.countDocuments();

	if (!userCount) {
		res.status(500).json({ success: false });
	}
	res.send({
		userCount: `Your store has ${userCount} customers including a few admins!`,
	});
});

//DELETE A USER REST API
router.delete(`/:id`, async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);

		if (user) {
			return res.status(200).json({ success: true, message: 'The user has been deleted!' });
		} else {
			return res
				.status(404)
				.json({ success: false, message: 'The user does not exist or may have already been deleted!' });
		}
	} catch (error) {
		return res.status(400).json({ success: false, message: error });
	}
});

module.exports = router;
