


const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Order = sequelize.define('order', {
  orderId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isIn: [['created', 'completed', 'failed', 'pending', 'CREATED', 'COMPLETED', 'FAILED', 'PENDING', 'SUCCESSFUL']], // Restrict to specific values
    },
  },
  paymentId: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'user-details', 
      key: 'id',    
    },
   
  },
});

module.exports = Order;
