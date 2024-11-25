
const Expense = require('../models/expense');
const Users = require('../models/user');
const sequelize = require('../util/database'); 


exports.addExpense = async (req, res) => {
  const t = await sequelize.transaction(); 

  try {
    const { amount, description, category } = req.body;
    const userId = req.user.id;

    const newExpense = await Expense.create(
      {
        description,    
        category,
        amount,
        userId
      },
      { transaction: t } 
    );
    const totalExpense = Number(req.user.totalExpense) + Number(newExpense.amount);
    await Users.update(
      {
        totalExpense: totalExpense
      },
      {
        where: { id: userId },
        transaction: t
      }
    );
    await t.commit();
    res.status(201).json(newExpense);
  } catch (error) {
    await t.rollback();
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Error adding expense' });
  }
};


exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll({where: {userId: req.user.id}});
        console.log(req.user.ispremium);
        res.status(200).json({expenses:expenses, ispremium:req.user.ispremium});
       
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Error fetching expenses' });
    }
  };


exports.updateExpense = async (req, res) => {
  const t = await sequelize.transaction(); 

  const expenseId = req.params.id;
  const { amount, description, category } = req.body;

  try {
    const expense = await Expense.findByPk(expenseId, { transaction: t }); 
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    expense.amount = amount;
    expense.description = description;
    expense.category = category;
    await expense.save({ transaction: t });
    await t.commit();

    res.status(200).json(expense);
  } catch (error) {
    await t.rollback();
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'An error occurred while updating the expense.' });
  }
};


exports.deleteExpense = async (req, res) => {
  const t = await sequelize.transaction(); 

  const expenseId = req.params.id;

  try {
    const expense = await Expense.findByPk(expenseId, { transaction: t }); 
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    const user = await Users.findByPk(expense.userId, { transaction: t }); 
    const totalExpense = Number(user.totalExpense) - Number(expense.amount);
    await user.update(
      { totalExpense: totalExpense },
      { transaction: t }
    );

    await expense.destroy({ transaction: t });  
    await t.commit();
    res.status(200).json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'An error occurred while deleting the expense.' });
  }
};


