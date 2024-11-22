

const path = require('path');
const express = require('express');
const app = express();
require('dotenv').config();

const cors = require("cors");
const sequelize = require ('./util/database');


const Users = require ('./models/user');
const Expense = require('./models/expense');
const Order=require('./models/order')
const ForgetPassword=require('./models/password')

app.use(express.static(path.join(__dirname, 'public')));
const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense'); 
const premiumRoutes = require('./routes/purchase');
const LeaderBoardRoutes = require('./routes/premium');
const passwordRoutes = require('./routes/password');


app.use(express.json());
app.use(cors());

app.use(express.static('public', { maxAge: 0 }));

app.use('/user', userRoutes);
app.use('/expenses', expenseRoutes); 
app.use('/premium', premiumRoutes);
app.use('/premium', LeaderBoardRoutes);
app.use('/password', passwordRoutes);

Users.hasMany(Expense, { foreignKey: 'userId' });
Expense.belongsTo(Users, { foreignKey: 'userId' });

Users.hasMany(Order,{foreignKey:'userId'});
Order.belongsTo(Users,{foreignKey:"userId"})

Users.hasMany(ForgetPassword,{foreignKey:'userId'});
ForgetPassword.belongsTo(Users,{foreignKey:'userId'});

const port = 3000;
sequelize
.sync()
.then((result) => {
    console.log(`server is working on http://localhost:${port}`);
   app.listen(port);
}).catch((err) => {
    console.log(err)
});
