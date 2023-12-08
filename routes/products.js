const express = require('express');
const router = express.Router();
const { Product } = require('../models/product');
const { Category } = require('../models/category');
const mongoose = require('mongoose');

//normal get without query
// router.get(`/`, async (req, res) => {
// 	try {
// 		const productList = await Product.find().select().populate('category');
// 		//to return specific data (see code above) - use DOT SELECT FOR THAT e.g. .select('name, image')
// 		res.send(productList);
// 	} catch (err) {
// 		if (!productList) {
// 			res.status(500).json({
// 				error: err,
// 				success: false,
// 			});
// 		}
// 	}
// });

//GET A LIST OF PRODUCTS
//FILTERING AND GETTING PRODUCTS BY CATEGORY REST API - by adding ?categories=category1,category2
router.get(`/`, async (req, res) => {
	try {
		let categoryList = {};

		if (req.query.categories) {
			categoryList = { category: req.query.categories.split(',') }; //using split para magamit yung comma sa url
		}

		const productListByCategory = await Product.find(categoryList).populate('category');
		//no query params means its empty so Product.find( will just act normally and return everything in the product .... if there's a params it will act as a filter - and will use categoryList na may laman
		res.send(productListByCategory);
	} catch (err) {
		if (!productListByCategory) {
			res.status(500).json({
				error: err,
				success: false,
			});
		}
	}
});

//GET A SPECIFIC PRODUCT ID
//display category and the product at the same time - .populate()
router.get(`/:id`, async (req, res) => {
	try {
		const product = await Product.findById(req.params.id).populate('category');

		if (!product) {
			res.status(404).json({ success: false, message: 'The product does not exist' });
		} else {
			res.status(200).send(product);
		}
	} catch (error) {
		return res.status(500).json({ success: false, message: error });
	}
});

//POST A NEW PRODUCT IN THE DATABASE
router.post(`/`, async (req, res) => {
	try {
		const category = await Category.findById(req.body.category);
		if (!category) return res.status(400).send('Invalid Category');

		let product = new Product({
			name: req.body.name,
			description: req.body.description,
			richDescription: req.body.richDescription,
			image: req.body.image,
			brand: req.body.brand,
			price: req.body.price,
			category: req.body.category,
			countInStock: req.body.countInStock,
			rating: req.body.rating,
			numReviews: req.body.numReviews,
			isFeatured: req.body.isFeatured,
		});

		product = await product.save();

		if (!product) {
			return res.status(500).send('the product has not been created!');
		} else {
			return res.status(201).json(product);
		}
	} catch (error) {
		return res.status(400).send(error);
	}
});

//update a product

router.put('/:id', async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).send('Invalid Product Id');
		}

		const category = await Category.findById(req.body.category);
		if (!category) return res.status(400).send('Invalid Category');

		const id = req.params.id;
		let product = await Product.findByIdAndUpdate(
			id,
			{
				name: req.body.name,
				description: req.body.description,
				richDescription: req.body.richDescription,
				image: req.body.image,
				brand: req.body.brand,
				price: req.body.price,
				category: req.body.category,
				countInStock: req.body.countInStock,
				rating: req.body.rating,
				numReviews: req.body.numReviews,
				isFeatured: req.body.isFeatured,
			},
			{ new: true }
		);

		if (!product) {
			res.status(404).json({ success: false, message: 'The product does not exist or may have already been deleted!' });
		} else {
			res.status(201).json(product);
		}
	} catch (error) {
		return res.status(400).json({ success: false, message: error });
	}
});

//delete a specific product

router.delete('/:id', async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).send('Invalid Product Id');
		} //this code validates the Id first

		const id = req.params.id;
		const product = await Product.findByIdAndDelete(id);
		// .select('name');

		if (product) {
			return res.status(201).json({ success: true, message: `The product with id of ${id} has been deleted!` });
		} else {
			return res
				.status(404)
				.json({ success: false, message: 'The product does not exist or may have already been deleted!' });
		}
	} catch (error) {
		return res.status(400).json({ success: false, message: error });
	}
});

//in mongoose we can for say get the total count of orders, total amoutninstock, etc.
//any statistics i may want on my frontend

// GET PRODUCT COUNT
router.get(`/get/count`, async (req, res) => {
	try {
		//countDocuments count the number of documents in the collection
		let productCount = await Product.countDocuments();

		if (!productCount) {
			return res.status(400).json({ success: false, message: 'There are no products' });
		} else {
			return res.json({ productCount: productCount });
		}
	} catch (error) {
		return res.status(500).json({ success: false, message: error });
	}
});

//GET FEATURED PRODUCTS REST API

router.get(`/get/featured/`, async (req, res) => {
	//if users pass count then have it as limit
	const countFeaturedLimit = 10; // bydefault
	//we need to find the featuredProducts only
	const featuredProducts = await Product.find({ isFeatured: true }).limit(countFeaturedLimit);

	if (featuredProducts) {
		return res.status(200).json(featuredProducts);
	} else {
		return res.status(404).json({ success: false, message: 'There are no featured products' });
	}
});

//with limit

router.get(`/get/featured/:count`, async (req, res) => {
	//if users pass count then have it as limit
	const count = req.params.count ? req.params.count : 0;
	//we need to find the featuredProducts only
	const featuredProducts = await Product.find({ isFeatured: true }).limit(+count);

	if (featuredProducts) {
		return res.status(200).json(featuredProducts);
	} else {
		return res.status(404).json({ success: false, message: 'There are no featured products' });
	}
});

module.exports = router;
