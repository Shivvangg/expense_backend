const User = require("../models/user");
const expense = require("../models/expense");
const Category = require("../models/category");
const mongoose = require('mongoose');

const createUser = async (req, res) => {
    let { email, username, phone, password, category } = req.body;
    try {
        const newUser = await User.create({
            email,
            username,
            phone,
            password,
        });
        return res.status(201).json({ message: "User Created Successfully", user: newUser });
    } 
    catch (error) {
        res.status(400).json({message: `Error creating user ${error.message}`, error});
    }
};

const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({ message: "User not found"});
        }
        if(password !== user.password){
            return res.status(400).json({ message : "Wrong Password"});
        }
        res.status(200).json({ message : "Logged in successfully", user: user});
    } catch(error){
        return res.status(500).json({message: "Internal Server Error"});
    }
};

const createCategory = async (req, res) => {
    const { categoryName, userId } = req.body;
    try {
        const newCategory = await Category.create({
            categoryName,
            userId
        });
        const user = await User.findById(userId).populate('categories').exec();
        if (user) {
            user.categories.push(newCategory._id);
            await user.save();
            // await user.populate('categories').execPopulate();
            return res.status(201).json({
                message: "Category Added Successfully",
                category: newCategory,
                user: user
            });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const getUserDetails = async (req,res) => {
    const userId = req.params;
    try {
        console.log("1");
        const user = await User.findById(userId).populate('categories').populate('expenses');
        console.log("2");
        if(user){
            return res.status(200).json({message: "User Data Retrieved",user: user});
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch(error) {
        return res.status(500).json({message: "Internal server error", error: error});
    }
};

const searchExpensesByLabel = async (req, res) => {
    const {userId, searchTerm} = req.query;

    try{
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).json({message: "Invalid user ID"});
        }
        if(!searchTerm || searchTerm.trim() === "") {
            return res.status(400).json({message: "Enter the label to search"});
        }

        const expenses = await expense.find({
            userId: userId,
            label: { $regex: searchTerm, $options: 'i'}
        });

        if(expenses.length === 0){
            return res.status(404).json({message: "No such expenses found"});
        }

        return res.status(200).json({
            message: "Expense retrieved successfully",
            expenses: expenses
        })
    } catch(error) {
        return res.status(500).json({message: "Internal Server Error", error: error});
    }
};

const searchCategoryById = async (req, res) => {
    const categoryId = req.params;
    try{
        console.log("1");
        const category = await Category.findById(categoryId);
        console.log(category);
        if(!category){
            return res.status(404).json({message: "category not found"});
        }else{
            // const categoryName = category.categoryName;
            res.status(200).json({message: "Category Found", category: category});
        }
    } catch(error){
        return res.status(500).json({message: "Internal Server Error", error: error});
    }
};

module.exports = {createUser, loginUser, createCategory, getUserDetails, searchExpensesByLabel, searchCategoryById};