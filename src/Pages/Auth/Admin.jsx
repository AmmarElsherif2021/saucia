import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../Contexts/AuthContext";
import { getAdminDashboard } from "../../API/admin";
import { Container, Heading, Spinner, Alert, AlertIcon, Text } from "@chakra-ui/react";

const Admin = () => {
  const { user } = useAuthContext();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getAdminDashboard();
        
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.isAdmin) {
      console.log(`user is admin !!!!!`)
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <Container centerContent>
        <Spinner size="xl" />
        <Text>Loading dashboard...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container centerContent>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Heading>Admin Dashboard</Heading>
      <Text>Total Users: {dashboardData?.totalUsers || "N/A"}</Text>
    </Container>
  );
};

export default Admin;