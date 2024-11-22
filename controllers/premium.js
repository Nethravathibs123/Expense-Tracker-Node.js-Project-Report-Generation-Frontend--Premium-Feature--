

const User = require('../models/user');
const Expense = require('../models/expense');
const Sequelize = require('../util/database');

exports.getUserLeaderBoard = async (req, res) => {
    try {
      
      const leaderboard = await User.findAll({
        attributes: [
          'id', 
          'username',
          [Sequelize.fn('SUM', Sequelize.col('expenses.amount')), 'totalExpense'] 
        ],
        include: [{
          model: Expense,
          attributes: [],  
        }],
        group: ['user-detail.id'],  
        order: [[Sequelize.fn('SUM', Sequelize.col('expenses.amount')), 'DESC']],  
      });
  
     
      res.status(200).json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ message: 'Failed to load leaderboard.' });
    }
  };
