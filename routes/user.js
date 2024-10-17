const express = require('express');
const {createUser, loginUser} = require('../controllers/user');
const expenseController = require('../controllers/expense');
const categoryController = require('../controllers/category');
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
router.post('/add/newCategory', categoryController.createCategory);
router.get('/get/category/:_id', categoryController.searchCategoryById);

module.exports = router;