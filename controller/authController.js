import { comparePassword, hashPassword } from "../helpers/authHelper.js"
import userModel from '../models/userModel.js'
import orderModel from '../models/orderModel.js'
import jwt from 'jsonwebtoken'

export const registerController = async(req, res) => {
    try{
        const {name, email, password, phone, address, answer} = req.body 

        if(!name){
            return res.send({message: 'Name is required'})
        }
        if(!email){
            return res.send({message: 'Email is required'})
        }
        if(!password){
            return res.send({message: 'Password is required'})
        }
        if(!phone){
            return res.send({message: 'Phone is required'})
        }
        if(!address){
            return res.send({message: 'Address is required'})
        }
        if(!answer){
            return res.send({message: 'Answer is required'})
        }

        const existing_user = await userModel.findOne({email})

        if(existing_user){
            return res.status(200).send({success:false, message:'Already registered. Please login.'})
        }

        const hashedPassword = await hashPassword(password)

        const user = await new userModel({name, email, password:hashedPassword, phone, address, answer}).save()

        res.status(201).send({success:true, message:'User Registered Successfully', user})
    }catch(error){
        console.log(error)
        res.status(500).send({success:false, message:'Error in registeration',error})
    }
};

export const loginController = async(req,res) => {
    try{
        const { email,password } = req.body
        if(!email || !password){
            return res.status(404).send({success: false, message: 'Invalid Email or Password'})
        }

        const user = await userModel.findOne({email})
        if(!user){
            res.status(404).send({success: false, message: 'Email is not registered'})
        }
        const match = await comparePassword(password, user.password)
        if(!match){
            res.status(200).send({success: false, message: 'Invalid Password'})
        }

        const token = await jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})
        res.status(200).send({success: true, message: 'Login Successful', user: {name: user.name, email: user.email, password: user.password, phone: user.phone, address: user.address, role:user.role}, token})
    }catch(error){
        console.log(error)
        res.status(500).send({success: false, message: 'Error in Login', error})
    }
}

export const testController = (req,res) => {
    res.send('Protected Route')
}

export const forgotPasswordController = async(req, res) => {
    try{
        const {email, answer, newPassword} = req.body
        if(!email){
            res.status(400).send({ message: 'Email is required '})
        }
        if(!answer){
            res.status(400).send({ message: 'Answer is required '})
        }
        if(!newPassword){
            res.status(400).send({ message: 'New Password is required '})
        }

        const user = await userModel.findOne({ email, answer})

        if(!user){
            return res.status(404).send({ success: false, message: "Wrong Email or Answer "})
        }

        const hashed = await hashPassword(newPassword)
        await userModel.findByIdAndUpdate(user._id, { password:hashed })
        res.status(200).send({ success: true, message: "Password Changed Successfully"})
    }catch(error){
        console.log(error)
        res.status(500).send({success: false, message: "Something Went Wrong", error})
    }
}

export const updateProfileController = async(req,res) => {
    try{
        const {name, email, password, phone, address} = req.body
        const user = await userModel.findById(req.user._id)

        if(!password && password.length<6){
            return res.json({error: 'Password Is Required and Atleast 6 Characters Long'})
        }

        const hashedPassword = password ? await hashPassword(password) : undefined
        const updateUser = await userModel.findByIdAndUpdate(req.user._id, {
            name: name || user.name,
            password: hashedPassword || user.hashedPassword,
            phone: phone || user.phone,
            address: address || user.address
        }, {new: true})

        res.status(200).send({ success: true, message: "Profile Updated Successsfully", updateUser})
    }
    catch(error){
        console.log(error)
        res.status(500).send({success: false, message: "Something Went Wrong In Updating Profile", error})
    }
}

export const getOrdersController = async(req,res) => {
    try{
        const orders = await orderModel.find({ buyer: req.user._id}).populate("products", "-photo").populate("buyer","name")
        res.json(orders)
    }
    catch(error){
        console.log(error)
        res.status(500).send({success: false, message: "Something Went Wrong In Getting Orders", error})
    }
}

export const getAllOrdersController = async(req,res) => {
    try{
        const orders = await orderModel.find({}).populate("products", "-photo").populate("buyer","name").sort({createdAt:-1})
        res.json(orders)
    }
    catch(error){
        console.log(error)
        res.status(500).send({success: false, message: "Something Went Wrong In Getting Orders", error})
    }
}

export const orderStatusController = async(req,res) => {
    try{
        const { orderId } = req.params
        const { status } = req.body
        const orders = await orderModel.findByIdAndUpdate(orderId, {status}, {new: true})
        res.json(orders)
    }
    catch(error){
        console.log(error)
        res.status(500).send({success: false, message: "Something Went Wrong In Setting Status", error})
    }
}