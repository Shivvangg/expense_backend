const express = require('express');
const {createUser, loginUser} = require('../controllers/user');
const expenseController = require('../controllers/expense');
const router = express.Router();

// user routes
router.post('/create/user', createUser);
router.post('/login/user', loginUser);
router.get('/get/user/:_id', getUserDetails);

//expenses
router.post('/add/newExpense', expenseController.createExpense);
router.post('/expenses/category', expenseController.listExpensesByCategory);
router.post('/monthly/expense', expenseController.getMonthlyExpenseSum);

//category
router.post('/add/newCategory', createCategory);
router.get('/get/category/:_id', searchCategoryById);

module.exports = router;