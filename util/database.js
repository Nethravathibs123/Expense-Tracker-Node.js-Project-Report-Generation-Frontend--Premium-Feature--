const Sequelize = require('sequelize');
const sequelize = new Sequelize(
    'expense-project', 
    'root', 
    'Nethra@1', 
    {
        dialect: 'mysql',
        host: 'localhost'
    }
);

module.exports = sequelize;