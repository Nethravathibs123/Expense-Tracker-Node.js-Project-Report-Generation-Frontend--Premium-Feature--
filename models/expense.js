const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Expense = sequelize.define('expense', {
  id : {
    type : Sequelize.INTEGER,
    autoIncrement : true,
    allowNull : false,
    primaryKey : true
  },
 
  amount: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  },
  category: {
    type:Sequelize.ENUM,
        values:['Food & Beverage','Fuel','Transport','Movie'],
        allowNull:false
  },
  userId: { 
    type: Sequelize.INTEGER,
    allowNull: false,
},
  
});

module.exports = Expense;   