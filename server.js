import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoute from './routes/authRoute.js';
import categoryRoute from './routes/categoryRoute.js';
import productRoutes from './routes/productRoutes.js'
import cors from 'cors';
import path from 'path'

dotenv.config();

connectDB();

const app = express()

app.use('*', function(req,res){
    res.sendFile(path.join(__dirname, './client/build/index.html'))
})

app.use(express.json())
app.use(morgan('dev'))
app.use(cors())
app.use(express.static(path.join(__dirname, './client/build')))

app.use("/api/v1/auth", authRoute)
app.use("/api/v1/category", categoryRoute)
app.use("/api/v1/product", productRoutes)

const PORT = process.env.PORT || 8080
app.listen(PORT, ()=>{
    console.log(`Server running on ${process.env.DEV_MODE} mode on port ${PORT}`)
})