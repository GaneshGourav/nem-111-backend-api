const express = require("express");
const {userModel} =require("../model/userModel")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const allRouter = express.Router();


allRouter.post("/register",async(req,res)=>{

    const {username,avatar,email,password} = req.body;

    let existUser = await userModel.findOne({email});

    try {
        
        if(!existUser){
            bcrypt.hash(password,5,async(err,hash)=>{
                if(err){
                    res.status(400).json({warning :"Something went wrong, Try again"});
                    return 
                }

                let user = new userModel({username,avatar,email,password:hash});
                await user.save();
                res.status(200).json({msg:"Account created Successfully",user})
            })
        }else{
            res.status(400).json({msg : "Allready registerd , try to login"})
        }
    } catch (error) {
        res.status(500).json({msg:"Internal Server Error"})
        
    }
})


module.exports={allRouter}