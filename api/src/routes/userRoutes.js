import express from 'express'
import { createUser, deleteUser, getUser, updateUser } from '../controllers/users.js'

const router = express.Router()

// Note: Authentication middleware is applied at the app level
// These routes assume user is already authenticated

// User routes
router.post('/', createUser)
router.get('/:userId', getUser)
router.put('/:userId', updateUser)
router.delete('/delete/:userId', deleteUser)

// Remove the complete-profile route from here since it's handled at app level

export default router