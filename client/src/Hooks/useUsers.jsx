// src/hooks/useUsers.js
import { useState, useCallback } from 'react';
import { 
  setAdminStatus, 
  login, 
  getUserInfo, 
  createUser, 
  updateUserProfile, 
  getAllUsers 
} from '../API/users';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setAdmin = useCallback(async (uid, isAdmin) => {
    setLoading(true);
    try {
      await setAdminStatus(uid, isAdmin);
      setUsers(prev => 
        prev.map(user => user.uid === uid ? {...user, isAdmin} : user)
      );
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const userLogin = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const user = await login(credentials);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async (uid) => {
    setLoading(true);
    try {
      const user = await getUserInfo(uid);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addUser = useCallback(async (userData) => {
    setLoading(true);
    try {
      const newUser = await createUser(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (uid, userData) => {
    setLoading(true);
    try {
      const updatedUser = await updateUserProfile(uid, userData);
      setUsers(prev => 
        prev.map(user => user.uid === uid ? updatedUser : user)
      );
      return updatedUser;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    currentUser,
    loading,
    error,
    setAdmin,
    userLogin,
    fetchUser,
    addUser,
    updateUser,
    fetchAllUsers
  };
}