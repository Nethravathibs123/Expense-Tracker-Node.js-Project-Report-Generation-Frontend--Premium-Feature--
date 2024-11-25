
const elements = {
  expenseList: document.getElementById('expense-list'),
  addExpenseButton: document.getElementById('add-expense'),
  purchasePremiumButton: document.getElementById('purchase-premium'),
  purchaseButton: document.getElementById('purchase'),
  leaderboardButton: document.getElementById('show-leaderboard-btn'),
  leaderboardList: document.getElementById('leaderboard-list'),
  amountInput: document.getElementById('amount-input'),
  descriptionInput: document.getElementById('description-input'),
  categorySelect: document.getElementById('category-select'),
  downloadButton: document.getElementById('download-expenses')

};

let expenses = [];
let editingIndex = -1;

const getAuthToken = () => localStorage.getItem('token');

const updatePremiumUI = (isPremium) => {
  elements.purchaseButton.style.display = isPremium ? 'block' : 'none';
  elements.purchasePremiumButton.style.display = isPremium ? 'none' : 'block';
};

const renderExpenses = () => {
  elements.expenseList.innerHTML = expenses.map((expense, index) => `
      <li class="expense-content">
         <td> ${expense.amount}</td> 
         <td>${expense.description || 'No description'} </td>
         <td>${expense.category}</td?
          <td><button class="delete-btn" data-id="${expense.id}">Delete</button></td>
          <td><button class="edit-btn" data-index="${index}">Edit</button></td>
      </li>
  `).join('');
};

const fetchExpenses = async () => {
  const token = getAuthToken();
  if (!token) {
      console.error('No authorization token found.');
      return;
  }

  try {
      const response = await axios.get('http://localhost:3000/expenses', {
          headers: { Authorization: token }
      });

      const { ispremium, expenses: fetchedExpenses } = response.data;
      expenses = fetchedExpenses;
      updatePremiumUI(ispremium);
      renderExpenses();
  } catch (error) {
      console.error('Error fetching expenses:', error);
      elements.expenseList.innerHTML = '<li>Error loading expenses. Please try again.</li>';
  }
};

const handleAddOrUpdateExpense = async () => {
  const amount = elements.amountInput.value;
  const description = elements.descriptionInput.value;
  const category = elements.categorySelect.value;
  const token = getAuthToken();

  if (!amount || !description || !category) {
      alert('Please fill in all the details');
      return;
  }

  const newExpense = { amount, description, category };

  try {
      if (editingIndex === -1) {
          const response = await axios.post('http://localhost:3000/expenses', newExpense, {
              headers: { Authorization: token }
          });
          expenses.push(response.data);
      } else {
          const id = expenses[editingIndex].id;
          const response = await axios.put(`http://localhost:3000/expenses/${id}`, newExpense, {
              headers: { Authorization: token }
          });
          expenses[editingIndex] = response.data;
          editingIndex = -1;
      }
      renderExpenses();
  } catch (error) {
      console.error('Error adding/updating expense:', error);
      alert('An error occurred. Please try again.');
  } finally {
      resetInputs();
  }
};

const handleDeleteExpense = async (id) => {
  const token = getAuthToken();

  try {
      await axios.delete(`http://localhost:3000/expenses/${id}`, {
          headers: { Authorization: token }
      });
      expenses = expenses.filter(expense => expense.id !== parseInt(id));
      renderExpenses();
  } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
  }
};

const handleEditExpense = (index) => {
  const expense = expenses[index];
  elements.amountInput.value = expense.amount;
  elements.descriptionInput.value = expense.description;
  elements.categorySelect.value = expense.category;
  editingIndex = index;
};

const handleExpenseListClick = (event) => {
  if (event.target.classList.contains('delete-btn')) {
      handleDeleteExpense(event.target.getAttribute('data-id'));
  }

  if (event.target.classList.contains('edit-btn')) {
      handleEditExpense(event.target.getAttribute('data-index'));
  }
};

const resetInputs = () => {
  elements.amountInput.value = '';
  elements.descriptionInput.value = '';
  elements.categorySelect.value = 'Food & Beverage';
};

const handlePurchase = async (e) => {
  e.preventDefault();
  const token = getAuthToken();

  try {
      const response = await axios.get('http://localhost:3000/premium/premiummembership', {
          headers: { Authorization: token }
      });

      const { order: { id: orderid }, key_id } = response.data;
      const options = {
          key: key_id,
          order_id: orderid,
          handler: async function(response) {
              try {
                  await axios.post('http://localhost:3000/premium/updatetransactionstatus', {
                      msg: 'successful',
                      paymentId: response.razorpay_payment_id,
                      orderId: response.razorpay_order_id,
                  }, {
                      headers: { Authorization: token }
                  });
                  alert('Payment successful! You are now a premium user.');
                  updatePremiumUI(true);
              } catch (err) {
                  console.error('Error verifying payment:', err);
                  alert('Payment verification failed, please contact support.');
              }
          },
          modal: {
              ondismiss: function() {
                  alert('Payment was cancelled. Please try again.');
              }
          }
      };
      const rzp1 = new Razorpay(options);
      rzp1.open();
  } catch (error) {
      console.error('Error initiating purchase:', error);
      alert('Payment initiation failed. Please try again.');
  }
};

const fetchLeaderboard = async () => {
  const token = getAuthToken();

  try {
      const response = await axios.get('http://localhost:3000/premium/showLeaderBoard', {
          headers: { Authorization: token }
      });

      elements.leaderboardList.innerHTML = response.data.map((userDetails, index) => `
          <tr>
              <td>${index + 1}</td>
              <td>${userDetails.username}</td>
              <td>₹${new Intl.NumberFormat('en-IN').format(userDetails.totalExpense)}</td>
          </tr>
      `).join('');
  } catch (error) {
      console.error('Error fetching leaderboard:', error);
      alert('Failed to load leaderboard. Please try again.');
  }
};
  
const handleDownloadExpenses = async () => {
    const token = getAuthToken();
  
    try {
      const response = await axios.get('http://localhost:3000/expenses/download', {
        headers: { Authorization: token }
      });
  
      if (response.status === 201) {
        const a = document.createElement('a');
        a.href = response.data.fileUrl;
        a.download = 'myexpense.txt';
        a.click();
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Error downloading expenses:', error);
      alert('Failed to download expenses. Please try again.');
    }
  };
  

elements.downloadButton.addEventListener('click', handleDownloadExpenses);
elements.addExpenseButton.addEventListener('click', handleAddOrUpdateExpense);
elements.expenseList.addEventListener('click', handleExpenseListClick);
elements.purchasePremiumButton.addEventListener('click', handlePurchase);
elements.leaderboardButton.addEventListener('click', fetchLeaderboard);


fetchExpenses();
