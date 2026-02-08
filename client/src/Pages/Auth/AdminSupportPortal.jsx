/* eslint-disable */
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  Avatar,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Spinner,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Flex,
  Divider,
  Tooltip,
  Skeleton,
  Alert,
  AlertIcon,
  AlertDescription,
  Portal,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import {
  FaSearch,
  FaUser,
  FaComment,
  FaComments,
  FaUserCheck,
  FaUserClock,
  FaSync,
  FaArrowDown,
  FaPaperPlane,
  FaExclamationCircle,
  FaWifi,
  FaCheckDouble,
  FaCheck,
} from 'react-icons/fa';
import { useSupportChat } from '../../Hooks/useSupportChat';
import { useAdminFunctions } from '../../Hooks/useAdminFunctions';
import { useTranslation } from 'react-i18next';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

export default function AdminSupportPortal() {
  const { t } = useTranslation();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const { useGetAllUsers } = useAdminFunctions();
  const { data: allUsers, isLoading: usersLoading, refetch: refetchUsers } = useGetAllUsers();
  
  useEffect(() => {
    if (allUsers) {
      setUsers(allUsers);
      setLoading(usersLoading);
    }
  }, [allUsers, usersLoading]);

  const handleUserClick = async (user) => {
    setModalLoading(true);
    setSelectedUser(user);
    onOpen();
    setTimeout(() => setModalLoading(false), 300);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchUsers();
      toast({
        title: 'Users refreshed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to refresh',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setRefreshing(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      (user.display_name && user.display_name.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.phone_number && user.phone_number.toLowerCase().includes(term))
    );
  }, [users, searchTerm]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'suspended': return 'orange';
      case 'deleted': return 'red';
      default: return 'gray';
    }
  };

  const getLastLoginText = (lastLogin) => {
    if (!lastLogin) return 'Never';
    
    const now = new Date();
    const loginDate = new Date(lastLogin);
    const diffHours = Math.floor((now - loginDate) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Box p={6} minH="100vh" bg="linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="start" spacing={1}>
          <Heading 
            size="xl" 
            display="flex" 
            alignItems="center" 
            gap={3} 
            color="gray.800"
            fontWeight="800"
            letterSpacing="-0.5px"
          >
            <Box 
              as={FaComments} 
              color="blue.500" 
              animation={`${pulse} 2s ease-in-out infinite`}
            />
            {t('admin.support_portal', { defaultValue: 'Support Portal' })}
          </Heading>
          <Text color="gray.600" fontSize="md" fontWeight="500">
            {t('admin.support_portal_desc', { 
              defaultValue: 'Real-time chat support with active users' 
            })}
          </Text>
        </VStack>
        
        <HStack spacing={3}>
          <InputGroup maxW="320px" size="lg">
            <InputLeftElement pointerEvents="none" h="full">
              <FaSearch color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder={t('admin.search_users', { defaultValue: 'Search users...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="white"
              borderRadius="xl"
              border="2px solid"
              borderColor="gray.200"
              _hover={{
                borderColor: 'blue.300',
              }}
              _focus={{
                borderColor: 'blue.500',
                boxShadow: '0 0 0 3px rgba(49, 206, 159, 0.15)',
              }}
              fontWeight="500"
            />
          </InputGroup>
          
          <Tooltip label="Refresh users" hasArrow>
            <IconButton
              icon={<FaSync />}
              aria-label="Refresh"
              onClick={handleRefresh}
              isLoading={refreshing}
              size="lg"
              variant="outline"
              borderRadius="xl"
              bg="white"
              borderWidth="2px"
              _hover={{
                transform: 'rotate(180deg)',
                borderColor: 'blue.400',
              }}
              transition="all 0.5s ease"
            />
          </Tooltip>
          
          <Badge 
            colorScheme="blue" 
            fontSize="md" 
            px={4} 
            py={2} 
            borderRadius="full"
            fontWeight="700"
            boxShadow="sm"
          >
            {filteredUsers.length} {t('admin.active_users', { defaultValue: 'users' })}
          </Badge>
        </HStack>
      </Flex>

      {/* Loading State */}
      {loading && (
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
            xl: 'repeat(4, 1fr)',
          }}
          gap={6}
        >
          {[...Array(8)].map((_, i) => (
            <GridItem key={i}>
              <Skeleton height="220px" borderRadius="2xl" startColor="gray.100" endColor="gray.200" />
            </GridItem>
          ))}
        </Grid>
      )}

      {/* Users Grid */}
      {!loading && (
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
            xl: 'repeat(4, 1fr)',
          }}
          gap={6}
        >
          {filteredUsers.map((user, idx) => (
            <GridItem 
              key={user.id}
              animation={`${fadeIn} 0.4s ease-out ${idx * 0.05}s both`}
            >
              <UserCard
                user={user}
                onClick={() => handleUserClick(user)}
                getStatusColor={getStatusColor}
                getLastLoginText={getLastLoginText}
              />
            </GridItem>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {!loading && filteredUsers.length === 0 && (
        <Flex
          direction="column"
          align="center"
          justify="center"
          h="500px"
          bg="white"
          borderRadius="2xl"
          p={12}
          border="3px dashed"
          borderColor="gray.300"
          boxShadow="sm"
        >
          <Box fontSize="6xl" mb={6} color="gray.300">
            <FaUserClock />
          </Box>
          <Heading size="lg" color="gray.700" mb={3} fontWeight="700">
            {t('admin.no_active_users', { defaultValue: 'No active users found' })}
          </Heading>
          <Text color="gray.500" textAlign="center" maxW="480px" fontSize="md" lineHeight="tall">
            {searchTerm 
              ? t('admin.no_users_match', { defaultValue: 'No users match your search criteria' })
              : t('admin.no_active_users_desc', { 
                  defaultValue: 'There are currently no active users to chat with. New users will appear here when they sign up.' 
                })
            }
          </Text>
          {searchTerm && (
            <Button
              mt={6}
              variant="ghost"
              colorScheme="blue"
              onClick={() => setSearchTerm('')}
              size="lg"
              fontWeight="600"
            >
              Clear search
            </Button>
          )}
        </Flex>
      )}

      {/* Chat Modal */}
      {selectedUser && (
        <ChatModal
          isOpen={isOpen}
          onClose={() => {
            setSelectedUser(null);
            setModalLoading(false);
            onClose();
          }}
          user={selectedUser}
          isLoading={modalLoading}
        />
      )}
    </Box>
  );
}

// Enhanced User Card Component
const UserCard = ({ user, onClick, getStatusColor, getLastLoginText }) => {
  const { t } = useTranslation();
  
  return (
    <Card
      cursor="pointer"
      onClick={onClick}
      _hover={{
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        borderColor: 'blue.400',
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      border="2px solid"
      borderColor="gray.200"
      borderRadius="2xl"
      h="100%"
      overflow="hidden"
      bg="white"
      boxShadow="md"
    >
      <CardHeader 
        pb={3} 
        pt={4}
        px={5}
        bg="linear-gradient(135deg, #66eacb 0%, #4ba285 100%)"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(102, 234, 186, 0.8) 0%, rgba(75, 162, 139, 0.8) 100%)',
          opacity: 0.9,
        }}
      >
        <Flex align="center" justify="space-between" position="relative" zIndex={1}>
          <HStack spacing={3} flex={1} minW={0}>
            <Avatar
              name={user.display_name || user.email}
              src={user.avatar_url}
              size="md"
              bg="white"
              color="brand.600"
              boxShadow="0 4px 12px rgba(0,0,0,0.2)"
              border="3px solid white"
            />
            <VStack align="start" spacing={0} flex={1} minW={0}>
              <Text 
                fontWeight="800" 
                fontSize="md" 
                color="white" 
                noOfLines={1}
                textShadow="0 2px 4px rgba(0,0,0,0.2)"
              >
                {user.display_name || t('admin.no_name', { defaultValue: 'No Name' })}
              </Text>
              <Text 
                fontSize="xs" 
                color="whiteAlpha.900" 
                noOfLines={1}
                fontWeight="500"
              >
                {user.email}
              </Text>
            </VStack>
          </HStack>
          <Badge 
            colorScheme={getStatusColor(user.account_status)}
            fontSize="xs"
            px={3}
            py={1}
            borderRadius="full"
            fontWeight="700"
            boxShadow="sm"
            textTransform="uppercase"
          >
            {user.account_status}
          </Badge>
        </Flex>
      </CardHeader>
      
      <CardBody pt={4} pb={5} px={5}>
        <VStack align="start" spacing={4}>
          {user.phone_number && (
            <HStack spacing={3} w="full">
              <Box 
                color="blue.500" 
                fontSize="lg"
                bg="blue.50"
                p={2}
                borderRadius="lg"
              >
                📱
              </Box>
              <Text fontSize="sm" color="gray.700" fontWeight="600">
                {user.phone_number}
              </Text>
            </HStack>
          )}
          
          <Divider borderColor="gray.300" />
          
          <Flex justify="space-between" w="100%" align="center">
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="wide">
                {t('admin.last_login', { defaultValue: 'Last login' })}
              </Text>
              <Text fontSize="sm" fontWeight="700" color="gray.800">
                {getLastLoginText(user.last_login)}
              </Text>
            </VStack>
            
            <VStack align="end" spacing={1}>
              <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="wide">
                {t('admin.loyalty_points', { defaultValue: 'Points' })}
              </Text>
              <Badge 
                colorScheme="brand" 
                fontSize="md" 
                px={3} 
                py={1} 
                borderRadius="lg"
                fontWeight="800"
              >
                {user.loyalty_points}
              </Badge>
            </VStack>
          </Flex>
          
          <Button
            leftIcon={<FaComment />}
            size="md"
            w="100%"
            mt={2}
            colorScheme="blue"
            variant="solid"
            borderRadius="xl"
            fontWeight="700"
            bg="linear-gradient(135deg, #62b38c 0%, #6ad299 100%"
            color="white"
            _hover={{
              bg: 'linear-gradient(135deg, #85be59 0%, #3b8f66 100%)',
              transform: 'scale(1.03)',
              boxShadow: '0 8px 20px rgba(102, 234, 164, 0.4)',
            }}
            _active={{
              transform: 'scale(0.98)',
            }}
            transition="all 0.2s"
            boxShadow="0 4px 12px rgba(102, 234, 230, 0.3)"
          >
            {t('admin.open_chat', { defaultValue: 'Open Chat' })}
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
};

// COMPLETELY REDESIGNED ChatModal with PERFECT scrolling
const ChatModal = ({ isOpen, onClose, user, isLoading }) => {
  const { t } = useTranslation();
  const toast = useToast();
  
  // Hook with correct parameters for admin mode
  const {
    messages,
    sendMessage,
    status,
    unreadCount,
    markAsRead,
    reconnect,
    currentUser,
    roomId
  } = useSupportChat({
    adminMode: true,
    targetUserId: user.id,
  });

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  
  // Refs for scroll management
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const userHasScrolledRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const isNearBottomRef = useRef(true);

  // PERFECT scroll to bottom function
  const scrollToBottom = useCallback((behavior = 'smooth', force = false) => {
    if (!messagesEndRef.current || !messagesContainerRef.current) return;
    
    // Force scroll or auto-scroll only if user hasn't manually scrolled up
    if (force || !userHasScrolledRef.current || isNearBottomRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: behavior,
        block: 'end',
        inline: 'nearest'
      });
      
      // Reset scroll flags
      userHasScrolledRef.current = false;
      isNearBottomRef.current = true;
      setShowScrollButton(false);
      setNewMessageCount(0);
    }
  }, []);

  // Enhanced scroll detection with debouncing
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Debounce scroll calculations
    scrollTimeoutRef.current = setTimeout(() => {
      const container = messagesContainerRef.current;
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const isNearBottom = distanceFromBottom < 150; // 150px threshold
      
      isNearBottomRef.current = isNearBottom;
      
      // User scrolled up
      if (scrollTop > 0 && !isNearBottom) {
        userHasScrolledRef.current = true;
        setShowScrollButton(messages.length > 0);
      } else {
        userHasScrolledRef.current = false;
        setShowScrollButton(false);
        
        // Mark as read when at bottom
        if (isNearBottom && unreadCount > 0) {
          markAsRead();
        }
      }
    }, 100);
  }, [messages.length, unreadCount, markAsRead]);

  // Handle new messages with intelligent scrolling
  useEffect(() => {
    const currentMessageCount = messages.length;
    const newMessages = currentMessageCount - lastMessageCountRef.current;
    
    if (newMessages > 0 && lastMessageCountRef.current > 0) {
      const lastMessage = messages[messages.length - 1];
      const isOwnMessage = lastMessage?.sender_type === 'admin';
      
      if (isOwnMessage) {
        // Always scroll for own messages
        setTimeout(() => scrollToBottom('smooth', true), 50);
      } else if (isNearBottomRef.current && !userHasScrolledRef.current) {
        // Auto-scroll for user messages only if near bottom
        setTimeout(() => scrollToBottom('smooth', false), 50);
      } else {
        // User is scrolled up - show indicator
        setNewMessageCount(prev => prev + newMessages);
        setShowScrollButton(true);
      }
    }
    
    lastMessageCountRef.current = currentMessageCount;
  }, [messages, scrollToBottom]);

  // Initial scroll when modal opens or messages first load
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      // Give DOM time to render
      setTimeout(() => {
        scrollToBottom('auto', true);
        lastMessageCountRef.current = messages.length;
      }, 150);
    }
  }, [isOpen, messages.length, scrollToBottom]);

  // Attach scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      userHasScrolledRef.current = false;
      isNearBottomRef.current = true;
      setShowScrollButton(false);
      setNewMessageCount(0);
      lastMessageCountRef.current = 0;
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!message.trim() || sending || status !== 'connected') return;
    
    setSending(true);
    try {
      const success = await sendMessage(message.trim());
      if (success) {
        setMessage('');
        userHasScrolledRef.current = false; // Reset for auto-scroll
      } else {
        toast({
          title: 'Failed to send message',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    if (messages.length === 0) return {};
    
    const groups = {};
    messages.forEach((msg) => {
      const date = formatDate(msg.created_at);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  }, [messages]);

  // Connection status
  const connectionStatus = useMemo(() => {
    switch(status) {
      case 'connected':
        return { label: 'Online', color: 'green', icon: FaWifi, bg: 'green.50' };
      case 'connecting':
        return { label: 'Connecting', color: 'yellow', icon: FaSync, bg: 'yellow.50' };
      case 'disconnected':
        return { label: 'Disconnected', color: 'red', icon: FaWifi, bg: 'red.50' };
      case 'error':
        return { label: 'Error', color: 'red', icon: FaExclamationCircle, bg: 'red.50' };
      default:
        return { label: 'Offline', color: 'gray', icon: FaExclamationCircle, bg: 'gray.50' };
    }
  }, [status]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="5xl"
      closeOnOverlayClick={false}
      motionPreset="slideInBottom"
      blockScrollOnMount={true}
    >
      <ModalOverlay 
        bg="blackAlpha.700" 
        backdropFilter="blur(8px)" 
      />
      <ModalContent 
        h="90vh"
        maxH="90vh"
        borderRadius="3xl"
        overflow="hidden"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        border="1px solid"
        borderColor="gray.200"
      >
        {/* Premium Header */}
        <ModalHeader 
          borderBottom="1px" 
          borderColor="gray.200"
          bg="linear-gradient(135deg,  #62b399 0%, #6ad29c 100%)"
          py={2}
          px={4}
          position="relative"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(102, 234, 168, 0.95) 0%, rgba(75, 162, 131, 0.95) 100%)',
          }}
        >
          <Flex justify="space-between" align="center" position="relative" zIndex={1}>
            <HStack spacing={4} flex={1} minW={0}>
              <Avatar
                name={user.display_name || user.email}
                src={user.avatar_url}
                size="lg"
                border="3px solid white"
                boxShadow="0 4px 12px rgba(0,0,0,0.2)"
              />
              <VStack align="start" spacing={0} flex={1} minW={0}>
                <Heading 
                  size="md" 
                  color="white" 
                  noOfLines={1}
                  fontWeight="800"
                  textShadow="0 2px 4px rgba(0,0,0,0.2)"
                >
                  {user.display_name || t('admin.no_name', { defaultValue: 'No Name' })}
                </Heading>
                <Text fontSize="sm" color="whiteAlpha.900" noOfLines={1} fontWeight="600">
                  {user.email}
                </Text>
              </VStack>
            </HStack>
            
            <HStack spacing={3}>
              <Tooltip label="Reconnect" hasArrow>
                <IconButton
                  icon={<FaSync />}
                  size="md"
                  onClick={reconnect}
                  variant="ghost"
                  aria-label="Reconnect"
                  color="white"
                  isLoading={status === 'connecting'}
                  _hover={{
                    bg: 'whiteAlpha.300',
                    transform: 'rotate(180deg)',
                  }}
                  transition="all 0.5s"
                  borderRadius="xl"
                />
              </Tooltip>
              <Badge 
                colorScheme={connectionStatus.color}
                fontSize="sm"
                px={4}
                py={2}
                borderRadius="full"
                display="flex"
                alignItems="center"
                gap={2}
                fontWeight="700"
                bg={connectionStatus.bg}
                boxShadow="sm"
              >
                <Box as={connectionStatus.icon} />
                {connectionStatus.label}
              </Badge>
              {unreadCount > 0 && (
                <Badge 
                  colorScheme="red" 
                  borderRadius="full" 
                  fontSize="sm"
                  px={3}
                  py={1.5}
                  fontWeight="700"
                  boxShadow="0 4px 12px rgba(245, 101, 101, 0.4)"
                >
                  {unreadCount} new
                </Badge>
              )}
            </HStack>
          </Flex>
        </ModalHeader>
        
        <ModalCloseButton 
          size="lg" 
          top={5} 
          right={5}
          borderRadius="full"
          bg="whiteAlpha.300"
          color="white"
          _hover={{ 
            bg: "whiteAlpha.400",
            transform: "scale(1.1)",
          }}
          transition="all 0.2s"
          zIndex={2}
        />
        
        <ModalBody m={2} p={0} display="flex" flexDirection="column">
          {/* User Info Bar */}
          <Flex
            px={6}
            py={3}
            bg="white"
            justify="space-between"
            align="center"
            borderBottom="1px"
            borderColor="gray.200"
            flexShrink={0}
            boxShadow="sm"
          >
            <HStack spacing={8} divider={<Box h="24px" w="1px" bg="gray.300" />}>
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="wider">
                  Phone
                </Text>
                <Text fontSize="sm" fontWeight="700" color="gray.800">
                  {user.phone_number || 'N/A'}
                </Text>
              </VStack>
              
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="wider">
                  Status
                </Text>
                <Badge 
                  colorScheme={user.account_status === 'active' ? 'green' : 'orange'}
                  fontSize="xs"
                  px={2}
                  fontWeight="700"
                >
                  {user.account_status}
                </Badge>
              </VStack>
              
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="wider">
                  Loyalty Points
                </Text>
                <Text fontSize="md" fontWeight="800" color="brand.600">
                  {user.loyalty_points}
                </Text>
              </VStack>
            </HStack>
          </Flex>

          {/* Connection Error Alert */}
          {status === 'disconnected' && (
            <Alert 
              status="error" 
              borderRadius="none"
              py={3}
              flexShrink={0}
            >
              <AlertIcon />
              <AlertDescription fontSize="sm" fontWeight="600">
                Connection lost. Messages may not send.
              </AlertDescription>
              <Button
                size="sm"
                colorScheme="red"
                variant="solid"
                ml="auto"
                onClick={reconnect}
                fontWeight="700"
              >
                Reconnect Now
              </Button>
            </Alert>
          )}

          {/* PERFECT SCROLLING MESSAGES AREA */}
          <Box
            ref={messagesContainerRef}
            flex={1}
            overflowY={'scroll'}
            overflowX="hidden"
            bg="linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%)"
            position="relative"
            maxHeight={'40vh'}
            css={{
              scrollBehavior: 'smooth',
              '&::-webkit-scrollbar': {
                width: '10px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#e2e8f0',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'linear-gradient(180deg, #4ba278 0%, #6ad2a5 100%))',
                borderRadius: '10px',
                border: '2px solid #e2e8f0',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'linear-gradient(180deg, #4ba278 0%, #6ad2a5 100%)',
              },
            }}
          >
            {isLoading ? (
              <VStack spacing={4} p={6} align="stretch">
                {[...Array(5)].map((_, i) => (
                  <Skeleton 
                    key={i} 
                    height="80px" 
                    borderRadius="2xl" 
                    startColor="gray.100" 
                    endColor="gray.200"
                  />
                ))}
              </VStack>
            ) : messages.length === 0 ? (
              <VStack spacing={6} py={24} px={8}>
                <Box 
                  fontSize="6xl" 
                  color="gray.300"
                  animation={`${pulse} 2s ease-in-out infinite`}
                >
                  <FaComments />
                </Box>
                <Heading size="lg" color="gray.600" fontWeight="700" textAlign="center">
                  No messages yet
                </Heading>
                <Text color="gray.500" fontSize="md" textAlign="center" maxW="400px" lineHeight="tall">
                  Start the conversation by sending a message below
                </Text>
              </VStack>
            ) : (
              <Box p={6} pb={2}>
                {Object.entries(groupedMessages).map(([date, msgs], groupIdx) => (
                  <Box key={date} mb={6}>
                    {/* Date Divider - Enhanced */}
                    <Flex justify="center" my={6}>
                      <Badge
                        px={5}
                        py={2}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="800"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        bg="white"
                        color="gray.600"
                        boxShadow="0 4px 12px rgba(0,0,0,0.1)"
                        border="1px solid"
                        borderColor="gray.200"
                      >
                        {date}
                      </Badge>
                    </Flex>

                    {/* Messages */}
                    {msgs.map((msg, idx) => {
                      const isAdmin = msg.sender_type === 'admin';
                      const isUser = msg.sender_type === 'user';
                      const prevMsg = msgs[idx - 1];
                      const showAvatar = !prevMsg || prevMsg.sender_type !== msg.sender_type;

                      return (
                        <Flex
                          key={msg.id}
                          justify={isAdmin ? 'flex-end' : 'flex-start'}
                          mb={showAvatar ? 5 : 2}
                          align="flex-end"
                          animation={`${slideUp} 0.3s ease-out`}
                        >
                          {/* User Avatar */}
                          {isUser && (
                            <Avatar
                              name={user.display_name || user.email}
                              src={user.avatar_url}
                              size="sm"
                              mr={3}
                              border="2px solid white"
                              boxShadow="0 2px 8px rgba(0,0,0,0.15)"
                              opacity={showAvatar ? 1 : 0}
                              visibility={showAvatar ? "visible" : "hidden"}
                              flexShrink={0}
                            />
                          )}

                          <VStack
                            align={isAdmin ? 'flex-end' : 'flex-start'}
                            spacing={1}
                            maxW="70%"
                          >
                            {/* Sender Name */}
                            {showAvatar && (
                              <Text 
                                fontSize="xs" 
                                color="gray.600" 
                                fontWeight="800"
                                px={2}
                                textTransform="uppercase"
                                letterSpacing="wide"
                              >
                                {isAdmin ? 'You' : (user.display_name || 'User')}
                              </Text>
                            )}

                            <Box
                              bg={isAdmin 
                                ? 'linear-gradient(135deg, #29564f 0%, #2b836e 100%)'
                                : 'white'}
                              
                              px={5}
                              py={3}
                              borderRadius="2xl"
                              boxShadow={isAdmin 
                                ? '0 8px 20px rgba(102, 234, 190, 0.4)'
                                : '0 4px 12px rgba(0,0,0,0.1)'}
                              borderWidth={isUser ? '1px' : '0'}
                              borderColor="gray.200"
                              position="relative"
                              maxW="full"
                              wordBreak="break-word"
                              _before={{
                                content: '""',
                                position: 'absolute',
                                bottom: '12px',
                                [isAdmin ? 'right' : 'left']: '-6px',
                                width: '0',
                                height: '0',
                                borderStyle: 'solid',
                                borderWidth: '6px 0 6px 6px',
                                borderColor: isAdmin 
                                  ? 'transparent transparent transparent #66eab1'
                                  : 'transparent transparent transparent white',
                              }}
                            >
                              <Text 
                                whiteSpace="pre-wrap" 
                                fontSize="sm"
                                lineHeight="1.6"
                                fontWeight="500"
                                color={isAdmin ? 'white' : 'gray.800'}
                              >
                                {msg.content}
                              </Text>
                              
                              {/* Message Metadata */}
                              <Flex
                                fontSize="xs"
                                color={isAdmin ? 'secondary.200' : 'gray.500'}
                                mt={2}
                                justify="space-between"
                                align="center"
                                gap={3}
                                fontWeight="600"
                              >
                                <Text>{formatTime(msg.created_at)}</Text>
                                {isAdmin && (
                                  <HStack spacing={1}>
                                    <Box as={msg.is_read ? FaCheckDouble : FaCheck} />
                                    <Text fontSize="xs">
                                      {msg.is_read ? 'Read' : 'Sent'}
                                    </Text>
                                  </HStack>
                                )}
                              </Flex>
                            </Box>
                          </VStack>

                          {/* Admin Avatar */}
                          {isAdmin && (
                            <Avatar
                              name={currentUser?.email || 'Admin'}
                              size="sm"
                              bg="brand.600"
                              color="white"
                              ml={3}
                              border="2px solid white"
                              boxShadow="0 2px 8px rgba(0,0,0,0.15)"
                              opacity={showAvatar ? 1 : 0}
                              visibility={showAvatar ? "visible" : "hidden"}
                              flexShrink={0}
                            />
                          )}
                        </Flex>
                      );
                    })}
                  </Box>
                ))}
                
                {/* Scroll Anchor - Critical for scrolling */}
                <div 
                  ref={messagesEndRef}
                  style={{ 
                    height: '1px',
                    width: '1px',
                    flexShrink: 0,
                  }} 
                />
              </Box>
            )}
          </Box>

          {/* Floating Scroll Button - Enhanced */}
          {showScrollButton && (
            <Portal>
              <Box
                position="fixed"
                bottom="140px"
                left="50%"
                transform="translateX(-50%)"
                zIndex={10000}
                animation={`${slideUp} 0.3s ease-out`}
              >
                <Button
                  size="md"
                  onClick={() => scrollToBottom('smooth', true)}
                  colorScheme="brand"
                  variant="solid"
                  borderRadius="full"
                  boxShadow="0 8px 24px rgba(102, 234, 183, 0.5)"
                  leftIcon={<FaArrowDown />}
                  rightIcon={newMessageCount > 0 && (
                    <Badge 
                      colorScheme="red" 
                      borderRadius="full"
                      ml={1}
                      fontWeight="800"
                    >
                      {newMessageCount}
                    </Badge>
                  )}
                  _hover={{
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(102, 234, 194, 0.6)',
                  }}
                  _active={{
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.2s"
                  fontWeight="700"
                  px={6}
                  py={6}
                  bg="linear-gradient(135deg, #66eaba 0%, #4ba288 100%)"
                >
                  {newMessageCount > 0 ? `${newMessageCount} New` : 'Scroll to latest'}
                </Button>
              </Box>
            </Portal>
          )}

          {/* Premium Input Area */}
          <Box
            p={5}
            borderTop="2px solid"
            borderColor="gray.200"
            bg="white"
            flexShrink={0}
            boxShadow="0 -4px 12px rgba(0,0,0,0.05)"
          >
            <HStack spacing={3} align="flex-end">
              <Input
                placeholder={
                  status === 'connected' 
                    ? `Message ${user.display_name || 'user'}...` 
                    : "Waiting for connection..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status !== 'connected' || sending}
                size="lg"
                borderRadius="2xl"
                bg="gray.50"
                border="2px solid"
                borderColor="gray.300"
                _hover={{
                  borderColor: 'brand.300',
                }}
                _focus={{
                  borderColor: 'brand.500',
                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.15)',
                  bg: 'white',
                }}
                flex={1}
                fontWeight="500"
                py={7}
                px={5}
                fontSize="md"
              />
              <Button
                onClick={handleSend}
                isDisabled={!message.trim() || status !== 'connected'}
                isLoading={sending}
                loadingText="Sending"
                borderRadius="2xl"
                size="lg"
                px={8}
                py={7}
                leftIcon={<FaPaperPlane />}
                bg="linear-gradient(135deg, #66eab1 0%, #58a17e 100%)"
                color="white"
                fontWeight="700"
                fontSize="md"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(102, 234, 177, 0.4)',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s"
                boxShadow="0 4px 12px rgba(102, 234, 177, 0.3)"
              >
                Send
              </Button>
            </HStack>
            <Flex justify="space-between" mt={3} px={2}>
              <Text fontSize="xs" color="gray.500" fontWeight="600">
                Press Enter to send • Shift+Enter for new line
              </Text>
              <Text fontSize="xs" color="gray.600" fontWeight="700">
                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
              </Text>
            </Flex>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};