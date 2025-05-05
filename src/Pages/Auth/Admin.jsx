// Admin.jsx
import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../Contexts/AuthContext";
import { getAdminDashboard } from "../../API/admin";
import { 
  Container, 
  Heading, 
  Spinner, 
  Alert, 
  AlertIcon, 
  Text, 
  Box, 
  Button,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from "@chakra-ui/react";

const Admin = () => {
  const { user, checkAdminStatus } = useAuthContext();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAdminDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please ensure you have admin access.");
    } finally {
      setLoading(false);
    }
  };

  // Check admin status and fetch data if user is admin
  useEffect(() => {
    const initAdmin = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Verify admin status first
        if (!user.isAdmin) {
          const isAdmin = await checkAdminStatus();
          if (!isAdmin) {
            setError("You don't have admin privileges.");
            setLoading(false);
            return;
          }
        }
        
        console.log("User is admin, fetching dashboard data");
        fetchDashboardData();
      } catch (error) {
        console.error("Error initializing admin dashboard:", error);
        setError("Failed to verify admin privileges.");
        setLoading(false);
      }
    };

    initAdmin();
  }, [user, checkAdminStatus]);

  // Show loading state
  if (loading) {
    return (
      <Container centerContent p={5}>
        <Spinner size="xl" thickness="4px" speed="0.65s" />
        <Text mt={4}>Loading dashboard...</Text>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container p={5}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
        <Box mt={4}>
          <Button onClick={fetchDashboardData} colorScheme="blue">
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  // Show unauthorized state
  if (!user?.isAdmin) {
    return (
      <Container p={5}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          You don't have access to this area. Please contact an administrator.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" p={5}>
      <Heading mb={6}>Admin Dashboard</Heading>
      
      {dashboardData ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          <Card>
            <CardHeader>
              <Heading size="md">User Statistics</Heading>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatLabel>Total Users</StatLabel>
                <StatNumber>{dashboardData.totalUsers || 0}</StatNumber>
                <StatHelpText>Registered accounts</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading size="md">Active Sessions</Heading>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatLabel>Active Users</StatLabel>
                <StatNumber>{dashboardData.activeUsers || 0}</StatNumber>
                <StatHelpText>Currently online</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading size="md">Revenue</Heading>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatLabel>Total Revenue</StatLabel>
                <StatNumber>${dashboardData.totalRevenue || 0}</StatNumber>
                <StatHelpText>Last 30 days</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      ) : (
        <Text>No data available.</Text>
      )}
    </Container>
  );
};

export default Admin;