const express = require('express');
const userController = require('../controllers/user');
const expenseController = require('../controllers/expense');
const categoryController = require('../controllers/category');
const router = express.Router();

// user routes
router.post('/create/user', userController.createUser);
router.post('/login/user', userController.loginUser);
router.get('/get/user/:_id', userController.getUserDetails);
router.post('/update/user', userController.updateUser);

//expenses
router.post('/add/newExpense', expenseController.createExpense);
router.post('/expenses/category', expenseController.listExpensesByCategory);
router.post('/monthly/expense', expenseController.getMonthlyExpenseSum);

//category
router.post('/add/newCategory', categoryController.createCategory);
router.get('/get/category/:_id', categoryController.searchCategoryById);

module.exports = router;