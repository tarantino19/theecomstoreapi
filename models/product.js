const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	richDescription: {
		type: String,
		default: '',
	},
	image: {
		type: String,
		default: '',
	},
	images: [
		{
			type: String,
		},
	],
	brand: {
		type: String,
		default: '',
	},
	price: {
		type: Number,
		default: 0,
	},
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category',
		required: true,
	},
	countInStock: {
		type: Number,
		required: true,
		min: 0,
		max: 255,
	},
	rating: {
		type: Number,
		default: 0,
	},
	numReviews: {
		type: Number,
		default: 0,
	},
	isFeatured: {
		type: Boolean,
		default: false,
	},
	dateCreated: {
		type: Date,
		default: Date.now(),
	},
});

productSchema.virtual('id').get(function () {
	return this._id.toHexString();
}); //this will create a virtual id field for the product so we can access id via "id" and not '_id' which is mongodb default - this id isn't accessible in the mongodb atlas itself - more for frontend mas madali ma access

productSchema.set('toJSON', {
	virtuals: true,
});

//mongoose Schema
exports.Product = mongoose.model('Product', productSchema);
