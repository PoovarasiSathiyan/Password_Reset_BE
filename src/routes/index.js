import express from 'express'
import userRoutes from './User.js'
const routers = express.Router()
routers.use('/',userRoutes)

export default routers