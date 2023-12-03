import userModel from '../models/User.js'
import Auth from '../common/auth.js'
import nodeMail from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

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
                    token

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
            let token =`${process.env.FE_URL}/reset/${user._id}`;
            let composeEmail={
                from:process.env.email,
                to:user.email,
                subject:"Password reset link",
                html: `<p>Click <a href='${token}'> to reset your password</p>`
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

const resetPassword = async(req,res)=>{
    try {
        let token= req.headers.authorization?.split(" ")[1]
       let data = await Auth.decodeToken(token)
       if(req.body.newPassword === req.body.confirmPassword){
        let user = await userModel.findOne({email:data.email})
        user.password=await Auth.hashPassword(req.body.newPassword)
        await user.save()

        res.status(200).send({
            message:"Password Updated Successfully"
        })
       }
       else{
        res.status(400).send({
            message:"Password Does Not Match"
        })
       }
    } 
    catch (error) {
        console.log(error)
        res.status(500).send({
            message:"Internel Server error",
            error:error.message
        })
    }
}
export default {
    create,
    login,
    forgotPassword,
    resetPassword
}