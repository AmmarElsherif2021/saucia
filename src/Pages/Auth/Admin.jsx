// Admin.jsx - Firestore version
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  getFirestore 
} from "firebase/firestore";
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Text
} from "@chakra-ui/react";
import { useUser } from "../../Contexts/UserContext";
import { AdminDashboard } from "./AdminDashboard";

const Admin = () => {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const db = getFirestore();

  // Fetch all users from Firestore
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, "users");
      const userSnapshot = await getDocs(usersCollection);
      
      const usersList = userSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      
      setUsers(usersList);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle admin status for a user
  const toggleAdminStatus = async (uid, currentStatus) => {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        isAdmin: !currentStatus
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.uid === uid ? { ...user, isAdmin: !currentStatus } : user
      ));
      
      toast({
        title: "User updated",
        description: `Admin status has been ${!currentStatus ? "granted" : "revoked"}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error updating user:", err);
      toast({
        title: "Update failed",
        description: "There was an error updating the user. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Check if user is admin on component mount
  useEffect(() => {
    if (user) {
      if (!user.isAdmin) {
        // Redirect non-admin users
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        navigate("/");
      } else {
        // Fetch users if admin
        fetchUsers();
      }
    } else if (user === null) { // Only redirect if auth is complete and user is null
      navigate("/auth");
    }
  }, [user, navigate, toast]);

  if (loading && !users.length) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading users...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container centerContent py={10}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
        <Button mt={4} onClick={fetchUsers}>Try Again</Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8} display="flex" justifyContent="space-between" alignItems="center">
        <Heading>Admin Dashboard</Heading>
        <Button onClick={() => navigate("/")} colorScheme="blue" variant="outline">
          Back to Home
        </Button>
      </Box>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Created</Th>
              <Th>Last Login</Th>
              <Th>Admin</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user.uid}>
                <Td>{user.displayName || "N/A"}</Td>
                <Td>{user.email}</Td>
                <Td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</Td>
                <Td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "N/A"}</Td>
                <Td>
                  <Switch
                    isChecked={user.isAdmin}
                    onChange={() => toggleAdminStatus(user.uid, user.isAdmin)}
                    colorScheme="green"
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <AdminDashboard/>
      </Box>
    </Container>
  );
};

export default Admin;