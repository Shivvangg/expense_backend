const User = require("../models/user");
const expense = require("../models/expense");
const Category = require("../models/category");
const mongoose = require('mongoose');

const createExpense = async (req, res) => {
    const { date, label, category, amount, repeatable, userId } = req.body;

    try {
        const newExpense = await expense.create({
            userId,
            date,
            label,
            category,
            amount,
            repeatable,
        });
        console.log("1");
        const user = await User.findById(userId).populate('expenses');
        console.log("2");
        if (user) {
            user.expenses.push(newExpense._id);
            console.log("3");
            await user.save();
            console.log("4");
            return res.status(201).json({
                message: "Expense Added Successfully",
                expense: newExpense,
                user: user
            });
            console.log("5");
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error:", error); // Log detailed error
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const listExpensesByCategory = async (req, res) => {
    const { userId, categoryId } = req.body;
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid category ID" });
        }
        const expenses = await expense.find({ 
            category: categoryId, 
            userId: userId 
        });
        if (expenses.length === 0) {
            return res.status(404).json({ message: "No expenses found for this category and user" });
        }
        return res.status(200).json({
            message: "Expenses retrieved successfully",
            expenses: expenses
        });
    } catch (error) {
        console.error("Error:", error); 
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getMonthlyExpenseSum = async (req, res) => {
    const userId = req.body.userId; 
    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        const now = new Date();
        const startDate = new Date(now.setMonth(now.getMonth() - 6));
        const objectId = new mongoose.Types.ObjectId(userId);
        const expenses = await expense.aggregate([
            {
                $match: {
                    userId: objectId, 
                    date: { $gte: startDate }
                }
            },
            {
                $project: {
                    month: { $month: "$date" },
                    year: { $year: "$date" },
                    amount: 1
                }
            },
            {
                $group: {
                    _id: { year: "$year", month: "$month" },
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        const monthlySums = expenses.map(expense => ({
            month: `${expense._id.year}-${String(expense._id.month).padStart(2, '0')}`,
            totalAmount: expense.totalAmount
        }));
        res.status(200).json(monthlySums);
    } catch (error) {
        console.error('Error calculating monthly expense sums:', error);
        res.status(500).json({ error: 'Could not calculate monthly expense sums' });
    }
};

module.exports = {createExpense, listExpensesByCategory, getMonthlyExpenseSum};