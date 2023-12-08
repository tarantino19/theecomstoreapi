const express = require('express');
const router = express.Router();
const { Category } = require('../models/category');

//GET CATEGORIES AND CATEGORY DETAIL

router.get(`/`, async (req, res) => {
	const categoryList = await Category.find();

	if (!categoryList) {
		res.status(500).json({ success: false });
	}
	res.status(200).send(categoryList);
});

//GET A SPECIFIC CATEGORY ID
router.get(`/:id`, async (req, res) => {
	try {
		const categoryId = await Category.findById(req.params.id);

		if (!categoryId) {
			res.status(404).json({ success: false, message: 'The category does not exist or may have already been deleted!' });
		} else {
			res.status(200).send(categoryId);
		}
	} catch (error) {
		return res.status(400).json({ success: false, message: error });
	}
});

//UPDATE A CATEGORY

router.put('/:id', async (req, res) => {
	const id = req.params.id;
	const updatedCategory = await Category.findByIdAndUpdate(
		id,
		{
			name: req.body.name,
			icon: req.body.icon,
			color: req.body.color,
		},
		{ new: true }
	);

	try {
		if (!updatedCategory) {
			res.status(404).json({ success: false, message: 'The category does not exist or may have already been deleted!' });
		} else {
			res.status(201).json(updatedCategory);
		}
	} catch (error) {
		return res.status(400).json({ success: false, message: error });
	}
});

//ADD A CATEGORY

router.post(`/`, async (req, res) => {
	try {
		let category = new Category({
			name: req.body.name,
			icon: req.body.icon,
			color: req.body.color,
		});

		if (!category) {
			res.status(404).send('the category has not been created!');
		} else {
			category = await category.save();
			res.status(201).json(category);
		}
	} catch (error) {
		return res.status(400).send(error);
	}
});

//DELETE A CATEGORY

router.delete('/:id', async (req, res) => {
	const id = req.params.id;
	try {
		const categoryId = await Category.findByIdAndDelete(id);
		if (!categoryId) {
			return res
				.status(404)
				.json({ success: false, message: 'The category does not exist or may have already been deleted!' });
		} else {
			res.status(201).json({ success: true, message: `Id: ${id} has been deleted!` });
		}
	} catch (error) {
		return res.status(400).json({ success: false, message: error });
	}
});

module.exports = router;
