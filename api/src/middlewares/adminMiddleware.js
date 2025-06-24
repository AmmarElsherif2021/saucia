import express from 'express'
import { isAdmin } from '../middlewares/adminMiddleware.js'

const router = express.Router()

router.get('/dashboard', isAdmin, (req, res) => {
  res.json({ message: 'Welcome, admin!' })
})

export default router
