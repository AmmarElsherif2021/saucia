import express from 'express'
import { createUser, deleteUser, getUser, updateUser } from '../controllers/users.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// User routes
router.post('/', createUser)
router.get('/:userId', getUser)   
router.put('/:userId', updateUser)
router.delete('delete/:userId', deleteUser)

// Additional user-related routes can be added here

export default router