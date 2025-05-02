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
    useToast
  } from "@chakra-ui/react";
  import { useUser } from "../../Contexts/UserContext";
  import { useTranslation } from "react-i18next";
  import plansData from './plans.json'
  import itemsData from "./items.json";
  import mealsData from ".//meals.json";
  import { useState } from "react";
  
  export const AdminDashboard = () => {
    const { user } = useUser();
    const { t } = useTranslation();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [entityType, setEntityType] = useState("");
    const isAdmin = user?.email === "admin@example.com";
    const [isEditing, setIsEditing] = useState(false);
    //if (!isAdmin) return <Box p={4}>Unauthorized access</Box>;
  
    const handleAddNew = (type) => {
        setEntityType(type);
        setIsEditing(false);
        //setSelectedEntity(getDefaultEntity(type));
        onOpen();
      };

    const handleEdit = (entity, type) => {
            setSelectedEntity(entity);
            setEntityType(type);
            setIsEditing(true);
            onOpen();
        };
        
    const handleSave = () => {
            // In a real app, you would update your data store here
            const action = isEditing ? 'updated' : 'created';
            toast({
            title: `${entityType} ${action}`,
            status: "success",
            duration: 2000,
            });
            onClose();
        };
 
  
    const renderAddNewForm = () => {
      switch(entityType) {
        case 'plan':
          return (
            <>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                 value={selectedEntity?.title || ''} 
                 onChange={(e) => setSelectedEntity({...selectedEntity, title: e.target.value})}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Period (days)</FormLabel>
                <Input
                 value={selectedEntity?.period || ''} 
                 onChange={(e) => setSelectedEntity({...selectedEntity, period: e.target.value})}
                />
              </FormControl>
            </>
          );
        case 'item':
          return (
            <>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                 value={selectedEntity?.name || ''} 
                 onChange={(e) => setSelectedEntity({...selectedEntity, name: e.target.value})}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Section</FormLabel>
                <Input
                 value={selectedEntity?.section || ''} 
                 onChange={(e) => setSelectedEntity({...selectedEntity, section: e.target.value})}
                />
              </FormControl>
            </>
          );
        case 'meal':
          return (
            <>
              <FormControl>
                <FormLabel>Meal Name</FormLabel>
                <Input
                 value={selectedEntity?.name || ''} 
                 onChange={(e) => setSelectedEntity({...selectedEntity, name: e.target.value})}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Price</FormLabel>
                <Input 
                 type="number"
                 value={selectedEntity?.price || 0} 
                 onChange={(e) => setSelectedEntity({...selectedEntity, price: e.target.value})}
                />
              </FormControl>
            </>
          );
        default:
          return null;
      }
    };
    const renderEditForm = () => {
        switch(entityType) {
          case 'plan':
            return (
              <>
                <FormControl>
                  <FormLabel>Title</FormLabel>
                  <Input defaultValue={selectedEntity?.title} />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Period (days)</FormLabel>
                  <Input defaultValue={selectedEntity?.period} type="number" />
                </FormControl>
              </>
            );
          case 'item':
            return (
              <>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input defaultValue={selectedEntity?.name} />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Section</FormLabel>
                  <Input defaultValue={selectedEntity?.section} />
                </FormControl>
              </>
            );
          case 'meal':
            return (
              <>
                <FormControl>
                  <FormLabel>Meal Name</FormLabel>
                  <Input defaultValue={selectedEntity?.name} />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Price</FormLabel>
                  <Input defaultValue={selectedEntity?.price} type="number" />
                </FormControl>
              </>
            );
          default:
            return null;
        }
      };
    return (
      <Box p={4}>
        <Heading mb={6}>Admin Dashboard</Heading>
        
        <Tabs variant="enclosed">
          <TabList gap={12}>
            <Tab>Users</Tab>
            <Tab>Plans ({plansData.length})</Tab>
            <Tab>Items ({itemsData.length})</Tab>
            <Tab>Meals ({mealsData.length})</Tab>
          </TabList>
  
          <TabPanels mt={4}>
            {/* Users Tab */}
            <TabPanel>
              
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>User</Th>
                    <Th>Email</Th>
                    <Th>Plan</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {/* Example user row - integrate with real user data */}
                  <Tr>
                    <Td>John Doe</Td>
                    <Td>john@example.com</Td>
                    <Td>Premium</Td>
                    <Td>
                      <Button size="sm" mr={2}>Edit</Button>
                      <Button size="sm" colorScheme="red">Delete</Button>
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </TabPanel>
  
            {/* Plans Tab */}
            <TabPanel>
            <Flex justify="flex-end" mb={4}>
                <Button colorScheme="green" onClick={() => handleAddNew('plan')}>
                Add New Plan
                </Button>
            </Flex>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Plan</Th>
                    <Th>Period</Th>
                    <Th>Carbs</Th>
                    <Th>Protein</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {plansData.map(plan => (
                    <Tr key={plan.id}>
                      <Td>{plan.title}</Td>
                      <Td>{plan.period}d</Td>
                      <Td>{plan.carb}g</Td>
                      <Td>{plan.protein}g</Td>
                      <Td>
                        <Button size="sm" mr={2} onClick={() => handleEdit(plan, 'plan')}>
                          Edit
                        </Button>
                        <Button size="sm" colorScheme="red">Delete</Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>
  
            {/* Items Tab */}
            <TabPanel>
            <Flex justify="flex-end" mb={4}>
                <Button colorScheme="green" onClick={() => handleAddNew('item')}>
                Add New Item
                </Button>
            </Flex>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Item</Th>
                    <Th>Section</Th>
                    <Th>Price</Th>
                    <Th>Kcal</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {itemsData.map(item => (
                    <Tr key={item.name}>
                      <Td>{item.name}</Td>
                      <Td>{item.section}</Td>
                      <Td>${item.item_charge}</Td>
                      <Td>{item.kcal}</Td>
                      <Td>
                        <Button size="sm" mr={2} onClick={() => handleEdit(item, 'item')}>
                          Edit
                        </Button>
                        <Button size="sm" colorScheme="red">Delete</Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>
  
            {/* Meals Tab */}
            <TabPanel>
            <Flex justify="flex-end" mb={4}>
                <Button colorScheme="green" onClick={() => handleAddNew('meal')}>
                    Add New Meal
                </Button>
            </Flex>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Meal</Th>
                    <Th>Price</Th>
                    <Th>Kcal</Th>
                    <Th>Premium</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mealsData.map(meal => (
                    <Tr key={meal.name}>
                      <Td>{meal.name}</Td>
                      <Td>${meal.price}</Td>
                      <Td>{meal.kcal}</Td>
                      <Td>{meal.isPremium}</Td>
                      <Td>
                        <Button size="sm" mr={2} onClick={() => handleEdit(meal, 'meal')}>
                          Edit
                        </Button>
                        <Button size="sm" colorScheme="red">Delete</Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>
          </TabPanels>
        </Tabs>
  
        {/* Edit Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                {isEditing ? `Edit ${entityType}` : `Create New ${entityType}`}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                {isEditing ? renderEditForm() : renderAddNewForm()}
                <Button mt={6} colorScheme="blue" onClick={handleSave}>
                    {isEditing ? 'Save Changes' : 'Create'}
                </Button>
                </ModalBody>
            </ModalContent>
        </Modal>
      </Box>
    );
  };