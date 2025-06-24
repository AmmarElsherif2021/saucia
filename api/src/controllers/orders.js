/* eslint-disable */
// controllers/orders.js
import { Order } from '../models/Order.js'
import { authenticate } from '../middlewares/authMiddleware.js'

export const createOrder = async (req, res) => {
  try {
    const orderData = {
      userId: req.user.uid,
      ...req.body
    };

    const newOrder = await Order.create(orderData);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.getByUser(req.user.uid);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id
    const deletedOrder = await Order.delete(orderId)

    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.status(200).json({ message: 'Order deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getAllOrders = async (req, res) => {
  try {
    // Add admin check
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const orders = await Order.getAll();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id
    const updatedData = req.body

    const updatedOrder = await Order.update(orderId, updatedData)

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.status(200).json(updatedOrder)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
