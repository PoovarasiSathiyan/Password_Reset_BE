import userModel from '../models/User.js'
import Auth from '../common/auth.js'
import nodeMail from 'nodemailer'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
dotenv.config()

//Create User
const create = async(req,res) =>{
    try {
        let user = await userModel.findOne({email:req.body.email}) 
        if(!user){
            req.body.password= await Auth.hashPassword(req.body.password)
            await userModel.create(req.body)
            res.status(202).send({
                message:"user created successfully"
            })
        }
        else{
            res.status(400).send({
                message:`user with ${req.body.email} already exists`
            })
        }
    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            error:error.message
        })
    }
}
//User Login
const login = async(req,res)=>{
    try {
        let user = await userModel.findOne({email:req.body.email}) 
        if(user){
            let hashCompare = await Auth.hashCompare(req.body.password,user.password)
            if(hashCompare){
                let token = await Auth.createToken({
                    Name:user.Name,
                    email:user.email
                })
                res.status(200).send({
                    message:"Login Successfully",
                    token,
                    user

                })
            }
            else{
                res.status(400).send({
                    message:"Entered password is wrong"
                })
            }
        }
        else{
            res.status(400).send({
                message:`Account with ${req.body.email} does not exist`
            })
        }
    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            error:error.message
        })
    }
}
//Forgot Password
const forgotPassword  = async(req,res)=>{
    try {
        let user = await userModel.findOne({email:req.body.email})
        if(user){
            let sender=nodeMail.createTransport({
                service:"gmail",
                auth:{
                    user:process.env.EMAIL,
                    pass:process.env.PASSWORD
                },
            });
            let token = await Auth.createToken({id:user._id});
            // Reset link send to email using nodemailer
            let composeEmail={
                from:process.env.email,
                to:user.email,
                subject:"Password reset link",
                html: `<p>Click <a href='${process.env.FE_URL}/${user._id}/${token}'> to reset your password</p>`
            }
            sender.sendMail(composeEmail, function(error, info){
                if(error){
                    console.log(error)
                }
                else{
                    res.status(200).send({
                        message:("Email sent Successfully", response.info),
                        info,
                    })
                }
            })
        }
        else{
            res.status(400).send({
                message:"Invalid email",
            })
        }
    } 
    catch (error) {
        console.log(error)
        
    }
}
//Reset Password
const resetPassword = async(req,res)=>{
    const {id,token} = req.params
    const {password} = req.body
    jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
        if(err){
            bcrypt.hash(password,10) // Password Hasing
            .then(hash=>{
                userModel.findByIdAndUpdate({_id:id},{password:hash})
                .then(u=>res.send({Status:"Success"}))
                .catch(err=>res.send({Status:err}))
            })
            .catch(err=>res.send({Status:err}))
        } 
    })
}
export default {
    create,
    login,
    forgotPassword,
    resetPassword
}