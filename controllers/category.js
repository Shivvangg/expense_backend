const User = require("../models/user");
const mongoose = require('mongoose');

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

module.exports = {createCategory, searchCategoryById};