const express = require('express');
const router = express.Router();
const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item');

//creating new orders API
router.post(`/`, async (req, res) => {
	const orderItemsIds = Promise.all(
		req.body.orderItems.map(async (orderItem) => {
			let newOrderItem = new OrderItem({
				quantity: orderItem.quantity,
				product: orderItem.product,
			});

			newOrderItem = await newOrderItem.save();

			return newOrderItem._id; //array of ids
		})
	);

	const orderItemsIdsResolved = await orderItemsIds;
	// console.log(orderItemsIdsResolved);
	//array of ids

	//then we loop over the array of ids
	let totalPrices = await Promise.all(
		orderItemsIdsResolved.map(async (orderItemId) => {
			const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
			const totalPrice = orderItem.product.price * orderItem.quantity;
			return totalPrice; //array of totalPrice
		})
	);

	// console.log(totalPrices); //array of total prices
	//we find the total via reduce
	const totalPriceOfAllItems = totalPrices.reduce((a, b) => a + b, 0);
	//then we put this in the new Order
	let order = new Order({
		orderItems: orderItemsIdsResolved,
		shippingAddress1: req.body.shippingAddress1,
		shippingAddress2: req.body.shippingAddress2,
		city: req.body.city,
		zip: req.body.zip,
		country: req.body.country,
		phone: req.body.phone,
		status: req.body.status,
		totalPrice: totalPriceOfAllItems,
		user: req.body.user,
	});

	order = await order.save();

	if (!order) {
		return res.status(500).send('The order was not created!');
	}

	res.status(201).send(order);
});

//get all orders
//see the users who order them
router.get(`/`, async (req, res) => {
	const orderList = await Order.find().populate('user', 'name').sort({ dateOrdered: -1 }); //order schema has a ref to User schema so we can access the 'user'    //.sort({ dateOrdered: -1 }) - newest to oldest sorting
	if (!orderList) {
		res.status(500).json({ success: false });
	}
	res.send(orderList);
});

//Get order detail and populate products in order item and users data
//get a single order per user - which has all the details of the orderItems with reference and populate to Product that they ordered - we are keeping data integrity by only referencing the values of the Product and not actually changing it or creating another one (also saved database)
router.get(`/:id`, async (req, res) => {
	const order = await Order.findById(req.params.id)
		.populate('user') //i can add ('user name') to only get the name of the user
		.populate({ path: 'orderItems', populate: { path: 'product', populate: 'category' } });
	//order schema has a ref to orderItems schema so we can access the 'orderItems' and populate it with the order
	//but this dont have the product name, only quantity and id, what to do? .populate('orderItems') - not this
	// do the one above via object - .populate({ path: 'orderItems', populate: { path: 'product' } })
	//path to orderItems and then populate with the product schema which orderItems has access to
	// .populate({ path: 'orderItems', populate: 'product' });

	if (!order) {
		res.status(400).json({ success: false, message: 'The order does not exist' });
	} else {
		res.status(200).send(order);
	}
});

//update order status
router.put('/:id', async (req, res) => {
	const orderStatus = await Order.findByIdAndUpdate(
		req.params.id,
		{
			status: req.body.status,
		},
		{ new: true }
	);

	if (orderStatus) {
		res.status(200).send({ orderStatus: `${orderStatus.status}` });
	} else {
		res.status(500).send('The order status cannot be updated');
	}
});

//delete order
// router.delete('/:id', async (req, res) => {
// 	const id = req.params.id;
// 	const order = await Order.findByIdAndDelete(id);

// 	if (order) {
// 		res.status(201).json({ success: true, message: `The order with id of ${id} has been deleted!` });
// 	} else {
// 		res.status(404).json({ success: false, message: 'The order does not exist or may have already been deleted!' });
// 	}
// });

//delete order and orderItemsId
//exercise - delete orderItems as well when order was deleted
router.delete('/:id', (req, res) => {
	Order.findByIdAndDelete(req.params.id)
		.then(async (order) => {
			if (order) {
				await order.orderItems.map(async (orderItemIds) => {
					await OrderItem.findByIdAndDelete(orderItemIds);
				});
				return res.status(200).json({ success: true, message: 'the order is deleted!' });
			} else {
				return res.status(404).json({ success: false, message: 'order not found!' });
			}
		})
		.catch((err) => {
			return res.status(500).json({ success: false, error: err });
		});
});

//get total sales directly from mongodb

router.get('/get/totalsales', async (req, res) => {
	const totalSales = await Order.aggregate([{ $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }]);
	//an object must have an id, we can use null in this case

	if (!totalSales) {
		return res.status(400).send('The order sales cannot be generated');
	}

	res.send({ totalsales: totalSales.pop().totalsales }); //we use the pop here to remove from the array then .totalsales to add it to the object   result =   -> { totalsales: #numberHere }
});

//total number of orders for the store - 1 order can have multiple orderItems
router.get(`/get/count`, async (req, res) => {
	const orderCount = await Order.countDocuments();

	if (!orderCount) {
		res.status(500).json({ success: false });
	}
	res.send({
		orderCount: orderCount,
	});
});

//get all the orders of that specific user only - only accessible by that specific user
router.get(`/get/userorders/:userid`, async (req, res) => {
	const userOrderList = await Order.find({ user: req.params.userid })
		.populate({
			path: 'orderItems',
			populate: {
				path: 'product',
				populate: 'category',
			},
		})
		.sort({ dateOrdered: -1 });

	if (!userOrderList) {
		res.status(500).json({ success: false });
	}
	res.send(userOrderList);
});
module.exports = router;
