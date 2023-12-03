import express from 'express';
import dotenv from 'dotenv';
import AppRoutes from './src/routes/index.js'

dotenv.config();
const PORT = process.env.PORT
const app = express()
app.use(express.json())
app.use('/user',AppRoutes)
app.listen(PORT,()=> console.log(`server listening to port ${PORT}`))