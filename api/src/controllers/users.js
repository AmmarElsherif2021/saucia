import { User } from '../models/User.js';

// Create user (handled by auth, just create profile)
export const createUser = async (req, res) => {
  try {
    const uid = req.user.id; // Supabase user ID
    const userData = {
      email: req.user.email,
      displayName: req.body.displayName || '',
      ...req.body
    };

    const newUser = await User.create(uid, userData);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    // Add admin check in middleware first
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get single user
export const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user.id;
    const isAdmin = req.user.isAdmin;

    if (userId !== currentUserId && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const user = await User.getById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update user
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user.id;
    const isAdmin = req.user.isAdmin;

    if (userId !== currentUserId && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Prevent non-admins from updating admin status
    if (req.body.isAdmin !== undefined && !isAdmin) {
      delete req.body.isAdmin;
    }

    const updatedUser = await User.update(userId, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// Delete user (not implemented, handled by auth)
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user.id;
    const isAdmin = req.user.isAdmin;

    // Only admin can delete any account, user can delete only their own account
    if (!isAdmin && userId !== currentUserId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await User.delete(userId);
    res.status(501).json({ error: 'Not implemented' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}