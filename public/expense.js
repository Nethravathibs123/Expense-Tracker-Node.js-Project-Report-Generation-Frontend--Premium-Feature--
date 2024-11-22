

let expenses = [];
let editingIndex = -1;

const expenseList = document.getElementById('expense-list');
const purchasePremiumButton = document.getElementById('purchase-premium');

function getAuthToken() {
  return localStorage.getItem('token');
}

function renderExpenses() {
  expenseList.innerHTML = ''; 
  expenses.forEach((expense, index) => {
    const newli = document.createElement('li');
    newli.className = 'expense-content';
    newli.textContent = `${expense.amount} - ${expense.description || 'No description'} - ${expense.category}`;

    const dltButton = document.createElement('button');
    dltButton.textContent = 'Delete';
    dltButton.classList.add('delete-btn');
    dltButton.setAttribute('data-id', expense.id);

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('edit-btn');
    editButton.setAttribute('data-index', index);

    newli.appendChild(dltButton);
    newli.appendChild(editButton);
    expenseList.appendChild(newli);
  });
}


async function fetchExpenses() {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error('No authorization token found.');
      return;
    }

    const response = await axios.get('http://localhost:3000/expenses', {
      headers: { Authorization: token }
    });
    let isPremium=response.data.ispremium;
    expenses =response.data.expenses;
    if (isPremium) {
    // console.log(isPremium);
    // console.log(expenses);
  
      document.getElementById('purchase').style.display = 'block';
      document.getElementById('purchase-premium').style.display = 'none'; 
    } else {
      document.getElementById('purchase').style.display = 'none'; 
      document.getElementById('purchase-premium').style.display = 'block';
    }    
    renderExpenses();  
  } catch (error) {
    console.error('Error fetching expenses:', error);
    expenseList.innerHTML = '<li>Error loading expenses. Please try again.</li>';
  }
}


const addExpenseButton = document.getElementById('add-expense');
addExpenseButton.addEventListener('click', async () => {
const amountInput = document.getElementById('amount-input');
const descriptionInput = document.getElementById('description-input');
const categorySelect = document.getElementById('category-select');
  const amount = amountInput.value;
  const description = descriptionInput.value;
  const category = categorySelect.value;
  

  if (amount && description && category) {
    const token = getAuthToken();
    if (!token) {
      alert('You need to be logged in to manage expenses');
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
  } else {
    alert('Please fill in all the details');
  }
});


expenseList.addEventListener('click', async (event) => {
  const token = getAuthToken();
  if (!token) {
    alert('You need to be logged in to delete expenses');
    return;
  }

  if (event.target.classList.contains('delete-btn')) {
    const id = event.target.getAttribute('data-id');
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

  if (event.target.classList.contains('edit-btn')) {
    const index = event.target.getAttribute('data-index');
    const expense = expenses[index];

    amountInput.value = expense.amount;
    descriptionInput.value = expense.description;
    categorySelect.value = expense.category;

    editingIndex = index;  
  }
});

const isPremium = localStorage.getItem('isPremium');
async function handlePurchase(e) {
  e.preventDefault();

  const token = getAuthToken();
  if (!token) {
    alert('You need to be logged in to make a purchase');
    return;
  }

  try {
    const response = await axios.get('http://localhost:3000/premium/premiummembership', {
      headers: { Authorization: token }
    });
    const { order: { id: orderid }, key_id } = response.data;
    const options = {
      key: key_id,
      order_id: orderid,
      handler: async function(response) {
        const payment = {
          msg: 'successful',
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
        };

        try {
          await axios.post('http://localhost:3000/premium/updatetransactionstatus', payment, {
            headers: { Authorization: token }
          });
          alert('Payment successful! You are now a premium user.');
          if (isPremium === 'true') {
            document.getElementById('purchase').style.display = 'block'; // Show Premium message
            document.getElementById('purchase-premium').style.display = 'none'; // Hide Purchase button
          } else {
            document.getElementById('purchase').style.display = 'none'; // Hide Premium message
            document.getElementById('purchase-premium').style.display = 'block'; // Show Purchase button
          }     
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


purchasePremiumButton.addEventListener('click', handlePurchase);


function showLeaderBoard() {
  const inputElement = document.getElementById('show-leaderboard-btn'); 
  inputElement.onclick = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('You need to be logged in to view the leaderboard.');
      return;
    }
    try {
      const response = await axios.get('http://localhost:3000/premium/showLeaderBoard', {
        headers: { Authorization: token }
      });

      const userLeaderBoardArray = response.data;
     
      const leaderboardElem = document.getElementById('leaderboard-list');
      if (!leaderboardElem) {
        console.error('Leaderboard container element not found.');
        return;
      }

      leaderboardElem.innerHTML = ''; 
      userLeaderBoardArray.forEach((userDetails, index) => {
        const formattedExpense = new Intl.NumberFormat('en-IN').format(userDetails.totalExpense); 
  leaderboardElem.innerHTML += `
           <tr>
                <td>` + (index + 1) + `</td>
                <td>` + userDetails.username + `</td>
                <td>₹` + formattedExpense + `</td>
         </tr>
        `;
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      alert('Failed to load leaderboard. Please try again.');
    }
  };
}

showLeaderBoard();

fetchExpenses();
