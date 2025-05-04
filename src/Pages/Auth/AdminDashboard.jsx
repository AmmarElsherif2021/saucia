import {
  Box,
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Heading,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useUser } from "../../Contexts/UserContext";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
  listItems,
  createItem,
  updateItem,
  deleteItem,
} from "../../API/items";
import {
  getMeals,
  createMeal,
  updateMeal,
  deleteMeal,
} from "../../API/meals";
import { listOrders } from "../../API/orders";

export const AdminDashboard = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [entityType, setEntityType] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [itemsData, setItemsData] = useState([]);
  const [mealsData, setMealsData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.email === "admin@example.com";

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [items, meals, orders] = await Promise.all([
        listItems(),
        getMeals(user?.token),
        listOrders(user?.token),
      ]);
      setItemsData(items);
      setMealsData(meals);
      setOrdersData(orders);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = (type) => {
    setEntityType(type);
    setIsEditing(false);
    setSelectedEntity({});
    onOpen();
  };

  const handleEdit = (entity, type) => {
    setSelectedEntity(entity);
    setEntityType(type);
    setIsEditing(true);
    onOpen();
  };

  const handleSave = async () => {
    try {
      if (entityType === "item") {
        if (isEditing) {
          await updateItem(user?.token, selectedEntity.id, selectedEntity);
        } else {
          await createItem(user?.token, selectedEntity);
        }
      } else if (entityType === "meal") {
        if (isEditing) {
          await updateMeal(user?.token, selectedEntity.id, selectedEntity);
        } else {
          await createMeal(user?.token, selectedEntity);
        }
      }
      toast({
        title: `${entityType} ${isEditing ? "updated" : "created"} successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchData();
      onClose();
    } catch (error) {
      console.error(`Error saving ${entityType}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} ${entityType}.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id, type) => {
    try {
      if (type === "item") {
        await deleteItem(user?.token, id);
      } else if (type === "meal") {
        await deleteMeal(user?.token, id);
      }
      toast({
        title: `${type} deleted successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete ${type}.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderAddNewForm = () => {
    switch (entityType) {
      case "item":
        return (
          <>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                value={selectedEntity?.name || ""}
                onChange={(e) =>
                  setSelectedEntity({ ...selectedEntity, name: e.target.value })
                }
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Section</FormLabel>
              <Input
                value={selectedEntity?.section || ""}
                onChange={(e) =>
                  setSelectedEntity({
                    ...selectedEntity,
                    section: e.target.value,
                  })
                }
              />
            </FormControl>
          </>
        );
      case "meal":
        return (
          <>
            <FormControl>
              <FormLabel>Meal Name</FormLabel>
              <Input
                value={selectedEntity?.name || ""}
                onChange={(e) =>
                  setSelectedEntity({ ...selectedEntity, name: e.target.value })
                }
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Price</FormLabel>
              <Input
                type="number"
                value={selectedEntity?.price || ""}
                onChange={(e) =>
                  setSelectedEntity({ ...selectedEntity, price: e.target.value })
                }
              />
            </FormControl>
          </>
        );
      default:
        return null;
    }
  };

  if (!isAdmin) return <Box p={4}>Unauthorized access</Box>;

  return (
    <Box p={4}>
      <Heading mb={6}>Admin Dashboard</Heading>
      {isLoading ? (
        <Spinner size="xl" />
      ) : (
        <Tabs variant="enclosed">
          <TabList gap={12}>
            <Tab>Items ({itemsData.length})</Tab>
            <Tab>Meals ({mealsData.length})</Tab>
            <Tab>Orders ({ordersData.length})</Tab>
          </TabList>

          <TabPanels mt={4}>
            {/* Items Tab */}
            <TabPanel>
              <Flex justify="flex-end" mb={4}>
                <Button colorScheme="green" onClick={() => handleAddNew("item")}>
                  Add New Item
                </Button>
              </Flex>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Item</Th>
                    <Th>Section</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {itemsData.map((item) => (
                    <Tr key={item.id}>
                      <Td>{item.name}</Td>
                      <Td>{item.section}</Td>
                      <Td>
                        <Button
                          size="sm"
                          mr={2}
                          onClick={() => handleEdit(item, "item")}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDelete(item.id, "item")}
                        >
                          Delete
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>

            {/* Meals Tab */}
            <TabPanel>
              <Flex justify="flex-end" mb={4}>
                <Button colorScheme="green" onClick={() => handleAddNew("meal")}>
                  Add New Meal
                </Button>
              </Flex>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Meal</Th>
                    <Th>Price</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mealsData.map((meal) => (
                    <Tr key={meal.id}>
                      <Td>{meal.name}</Td>
                      <Td>${meal.price}</Td>
                      <Td>
                        <Button
                          size="sm"
                          mr={2}
                          onClick={() => handleEdit(meal, "meal")}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDelete(meal.id, "meal")}
                        >
                          Delete
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>

            {/* Orders Tab */}
            <TabPanel>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Order ID</Th>
                    <Th>User</Th>
                    <Th>Total</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {ordersData.map((order) => (
                    <Tr key={order.id}>
                      <Td>{order.id}</Td>
                      <Td>{order.userId}</Td>
                      <Td>${order.total}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? `Edit ${entityType}` : `Create New ${entityType}`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {renderAddNewForm()}
            <Button mt={6} colorScheme="blue" onClick={handleSave}>
              {isEditing ? "Save Changes" : "Create"}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};