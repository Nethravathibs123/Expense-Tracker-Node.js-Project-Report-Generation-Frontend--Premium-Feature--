
const Sequelize=require('sequelize');
const sequelize=require('../util/database');


const Forgotpassword = sequelize.define('forgotpassword', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
    },
    isactive:{
        type:Sequelize.ENUM,
        values:['ACTIVE','NOT'],
        allowNull:false
    }
})
module.exports = Forgotpassword;
