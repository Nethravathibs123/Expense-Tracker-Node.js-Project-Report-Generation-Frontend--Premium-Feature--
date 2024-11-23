let expenses = [];
let editingIndex = -1;

const expenseList = document.getElementById('expense-list');
const addExpenseButton = document.getElementById('add-expense');
const purchasePremiumButton = document.getElementById('purchase-premium');
const purchaseButton = document.getElementById('purchase');
const leaderboardButton = document.getElementById('show-leaderboard-btn');
const leaderboardList = document.getElementById('leaderboard-list');
const amountInput = document.getElementById('amount-input');
const descriptionInput = document.getElementById('description-input');
const categorySelect = document.getElementById('category-select');

function getAuthToken() {
  return localStorage.getItem('token');
}

function updatePremiumUI(isPremium) {
  purchaseButton.style.display = isPremium ? 'block' : 'none';
  purchasePremiumButton.style.display = isPremium ? 'none' : 'block';
}
fetchDownload();



function renderExpenses() {
  expenseList.innerHTML = expenses.map((expense, index) => `
    <li class="expense-content">
      ${expense.amount} - ${expense.description || 'No description'} - ${expense.category}
      <button class="delete-btn" data-id="${expense.id}">Delete</button>
      <button class="edit-btn" data-index="${index}">Edit</button>
    </li>
  `).join('');
}

async function fetchExpenses() {
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
    expenseList.innerHTML = '<li>Error loading expenses. Please try again.</li>';
  }
}

async function handleAddOrUpdateExpense() {
  const amount = amountInput.value;
  const description = descriptionInput.value;
  const category = categorySelect.value;
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
      newExpense.id = id;
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
    amountInput.value = '';
    descriptionInput.value = '';
    categorySelect.value = 'Food & Beverage';
  }
}

async function handleDeleteExpense(id) {
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
}

function handleEditExpense(index) {
  const expense = expenses[index];
  amountInput.value = expense.amount;
  descriptionInput.value = expense.description;
  categorySelect.value = expense.category;
  editingIndex = index;
}

function handleExpenseListClick(event) {
  if (event.target.classList.contains('delete-btn')) {
    handleDeleteExpense(event.target.getAttribute('data-id'));
  }

  if (event.target.classList.contains('edit-btn')) {
    handleEditExpense(event.target.getAttribute('data-index'));
  }
}

function fetchDownload() {
    const token = localStorage.getItem("jwt");
    axios.get('http://localhost:5000/expense/getdownload', { headers: { "Authorization": token } })
      .then(r => {
        const ui2 = document.getElementById('ui2');
        ui2.innerHTML = ''; // Clear the history table before adding new data
  
        r.data.forEach((item, index) => {
          const { link } = item;
          addHistory(index + 1, link);
        });
      })
      .catch(e => console.log(e));
  }
  
  function addHistory(sni, Link) {
    const newTr = document.createElement('tr');
    newTr.innerHTML = `
      <td>${sni}</td>
      <td><a href=${Link}>${Link}</td>
    `;
    const ui2 = document.getElementById('ui2');
    ui2.appendChild(newTr);
  }
  

async function handlePurchase(e) {
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
}

async function fetchLeaderboard() {
  const token = getAuthToken();

  try {
    const response = await axios.get('http://localhost:3000/premium/showLeaderBoard', {
      headers: { Authorization: token }
    });

    leaderboardList.innerHTML = response.data.map((userDetails, index) => `
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
}

addExpenseButton.addEventListener('click', handleAddOrUpdateExpense);
expenseList.addEventListener('click', handleExpenseListClick);
purchasePremiumButton.addEventListener('click', handlePurchase);
leaderboardButton.addEventListener('click', fetchLeaderboard);

fetchExpenses();
