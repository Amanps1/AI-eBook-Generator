const express = require("express");
const jwt=require("jsonwebtoken");
const User=require("../models/User");
const router = express.Router();

const generateToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:"7d",
    })
}

const registerUser=async(req,res)=>{
    const {name,email,password}=req.body;
    try{
        if(!name || !email || !password){
            return res.status(400).json({message:"Please provide all required fields"});
        }
        const userExists=await User.findOne({email});
        if(userExists){ 
            return res.status(400).json({
                success:false,
                message:"User already exists"});
        }

        const user=await User.create({
            name,email,password
        });

        if(user){
            return res.status(201).json({
                success:true,
                message:"User registered successfully", 
                token:generateToken(user._id)
            })
        }else{
            return res.status(400).json({success:false,
                message:"Invalid user data"});      
        }


    }catch(e){
        res.status(500).json({success:false,
            message:"Server Error"}); 
    }
}

const loginUser=async(req,res)=>{
    const {email,password}=req.body;
    try {
        const user=await User.findOne({email}).select("+password");

        if(user && (await user.matchPassword(password))){
            res.json({
                success:true,
                message:"Login successfully",
                _id:user._id,
                name:user.name,
                email:user.email,
                token:generateToken(user._id)
            })
        }else{
            res.status(401).json({ success: false, message: "Invalid email or password" });
        }
    } catch (e) {
      res.status(500).json({ success: false, message: "Server Error" }); 
    }
}

const getProfile=async(req,res)=>{
    try {
        const user=await User.findById(req.user._id);
        res.status(200).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isPro:user.isPro
        });
    } catch (e) {
      res.status(500).json({ success: false, message: "Server Error" }); 
    }
}

const updateUserProfile=async(req,res)=>{
    try {
        const user=await User.findById(req.user._id);
        if(user){
            user.name=req.body.name || user.name;
            const updatedUser=await user.save();
            res.json({
                name:updatedUser.name,
                email:updatedUser.email,
            });
        }else{
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (e) {
      res.status(500).json({ success: false, message: "Server Error" }); 
    }
}

module.exports={registerUser,loginUser,getProfile,updateUserProfile};