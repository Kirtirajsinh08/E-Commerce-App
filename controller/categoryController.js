import categoryModel from "../models/categoryModel.js"
import slugify from "slugify"

export const createCategoryController = async(req,res) => {
    try{
        const {name} = req.body

        if(!name){
            return res.status(401).send({message:"Category is Required Here"})
        }

        const existingCategory = await categoryModel.findOne({name})

        if(existingCategory){
            return res.status(200).send({message:"This Category Already Exists"})
        }

        const category = await new categoryModel({name, slug:slugify(name)}).save()
        res.status(201).send({
            success: true,
            message: "New Category Created",
            category
        })
    }
    catch(error){
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error in Category"
        })
    }
}

export const updateCategoryController = async(req,res) => {
    try{
        const {name} = req.body
        const {id} = req.params
        const category = await categoryModel.findByIdAndUpdate(id, {name, slug:slugify(name)}, {name:true})
        res.status(200).send({ success:true, message:"Category Updated Successfully", category})
    }
    catch(error){
        console.log(error)
        res.status(500).send({success:false, error, message:"Error In Updating Category"})
    }
}

export const categoryController = async(req,res) => {
    try{
        const category = await categoryModel.find({})
        res.status(200).send({ success:true, message:"All Categories List", category})
    }
    catch(error){
        console.log(error)
        res.status(500).send({success:false, error, message:"Error In Getting All Categories"})
    }
}

export const singleCategoryController = async(req,res) => {
    try{
        const category = await categoryModel.findOne({slug: req.params.slug})
        res.status(200).send({ success:true, message:"Category Details Are Here", category})
    }
    catch(error){
        console.log(error)
        res.status(500).send({success:false, error, message:"Error In Fetching Category"})
    }
}

export const deleteCategoryController = async(req,res) => {
    try{
        const {id} = req.params
        await categoryModel.findByIdAndDelete(id)
        res.status(200).send({ success:true, message:"Category Deleted Successfully"})
    }
    catch(error){
        console.log(error)
        res.status(500).send({success:false, error, message:"Error In Deleting Category"})
    }
}