import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

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
    const userId = req.params.userId;
    
    // Get user from database
    const user = await User.getById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return essential profile data
    res.json({
      id: user.id,
      email: user.email,
      //firstName: user.first_name,
      //lastName: user.last_name,
      phoneNumber: user.phone_number,
      profileCompleted: !!user.first_name && !!user.last_name && !!user.phone_number
    });
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
// Complete user profile
export const completeUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phoneNumber, age } = req.body;

    if (!firstName || !lastName || !phoneNumber) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'First name, last name and phone number are required'
      });
    }

    const updateData = {
      //first_name: firstName,
      //last_name: lastName,
      phone_number: phoneNumber,
      profile_completed: true
    };

    // Add date of birth if provided
    if (age) {
      updateData.age = age;
    }

    // Add debug logging
    console.log('Updating user profile:', {
      userId,
      updateData
    });

    const updatedUser = await User.update(userId, updateData);

    // Generate new JWT
    const tokenPayload = {
      id: updatedUser.id,
      email: updatedUser.email,
      isAdmin: updatedUser.is_admin,
      profile_completed: true
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Debug log
    console.log('Profile completion successful for user:', userId);
    
    res.json({ 
      success: true,
      token,
      user: updatedUser 
    });
  } catch (error) {
    // Enhanced error logging
    console.error('Profile completion error:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
      body: req.body
    });
    
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
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