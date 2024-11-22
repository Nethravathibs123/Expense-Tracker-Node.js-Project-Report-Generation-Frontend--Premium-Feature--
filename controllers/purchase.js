

const Razorpay = require('razorpay');
const Order = require('../models/order');
const User = require('../models/user');

module.exports.purchaseMembership = async (req, res) => {
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const amount = 1000;

    const order = await new Promise((resolve, reject) => {
      rzp.orders.create({ amount, currency: 'INR' }, (err, order) => {
        if (err) {
          return reject(new Error(JSON.stringify(err)));
        }
        resolve(order);
      });
    });

    console.log('Razorpay Order:', order);

   
    await req.user.createOrder({ orderId: order.id, status: 'PENDING' });

    return res.status(201).json({ order, key_id: rzp.key_id });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    return res.status(403).json({ message: 'Something went wrong while creating the order', error: err.message });
  }
};

module.exports.updateMembership = async (req, res) => {
  const userId = req.user.id;
  const { orderId, msg, paymentId } = req.body;

  console.log('OrderId:', orderId);
  console.log('PaymentId:', paymentId);

  try {

    const order = await Order.findOne({ where: { orderId, userId } });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isSuccess = msg === 'successful';

    console.log('Updating order with paymentId:', paymentId);

   
    const orderUpdatePromise = order.update({
      status: isSuccess ? 'SUCCESSFUL' : 'FAILED',
      paymentId: isSuccess ? paymentId : null,
    });

 
    const userUpdatePromise = isSuccess ? req.user.update({ ispremium: true }) : Promise.resolve();

   
    await Promise.all([orderUpdatePromise, userUpdatePromise]);

    if (isSuccess) {
      return res.status(200).json({ message: 'Payment successful', premium: true });
    } else {
      return res.status(200).json({ message: 'Payment failed', premium: false });
    }
  } catch (err) {
    console.error('Error updating transaction status:', err);
    return res.status(500).json({ message: 'An error occurred while updating transaction status', error: err.message });
  }
};

module.exports.checkPremium = (req, res) => {
  const { ispremium } = req.user;

  if (ispremium) {
    return res.status(200).json({ check: true });
  } else {
    return res.status(403).json({ check: false });
  }
};
