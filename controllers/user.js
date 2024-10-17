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

const updateUser = async (req,res) => {
    let {userId, email, username} = req.body;
        try{
            const user = await User.findById(userId);
            if(user){
                const updatedUser = await User.findByIdAndUpdate(
                    userId,
                    {
                        email, username
                    }
                )
                return res.status(200).json({message: "User updated successfully", updatedUser})
            }
            else{
                return res.status(404).json({message: "User not found"})
            }
        }catch(error){
            return res.status(500).json({message: "Internal Server Error", error:error});
        }   
};


module.exports = {createUser, loginUser, getUserDetails, updateUser};