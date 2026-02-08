// SupportPortal.jsx - OPTIMIZED WITH TWO-WAY MESSAGES
import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Box, 
  Input, 
  Button, 
  VStack, 
  Text, 
  HStack, 
  Badge, 
  Spinner, 
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Tooltip,
  Flex,
  Divider,
  Avatar,
} from "@chakra-ui/react";
import { useSupportChat } from "../../Hooks/useSupportChat";
import { RepeatIcon, ChatIcon, ChevronLeftIcon,ChevronRightIcon, CloseIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";

export default function SupportPortal() {
  const { 
    messages, 
    sendMessage, 
    status, 
    unreadCount, 
    markAsRead, 
    reconnect,
    currentUser
  } = useSupportChat();
  const {t}=useTranslation();
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef(null);

  const handleSend = async () => {
    if (!text.trim() || isSending || status !== "connected") return;
    
    setIsSending(true);
    try {
      const success = await sendMessage(text);
      if (success) {
        setText("");
      }
    } finally {
      setIsSending(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Mark as read when chat is opened
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      const timer = setTimeout(() => {
        markAsRead();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, unreadCount, markAsRead]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
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
    messages.forEach((message) => {
      const date = formatDate(message.created_at);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  }, [messages]);

  return (
    <>
      {/* Floating Chat Button */}
      <Tooltip label={t('supportChat')} placement="left">
        <Button
          ref={btnRef}
          onClick={onOpen}
          position="fixed"
          bottom="6"
          right="6"
          zIndex={1000}
          colorScheme="secondary"
          borderRadius="full"
          w="60px"
          h="60px"
          boxShadow="xl"
          _hover={{ transform: "scale(1.1)" }}
          transition="all 0.2s"
        >
          <Flex direction="column" align="center">
            <ChatIcon boxSize={6} />
            {unreadCount > 0 && (
              <Badge
                position="absolute"
                top="-2"
                right="-2"
                colorScheme="red"
                borderRadius="full"
                minW="20px"
                h="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Flex>
        </Button>
      </Tooltip>

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px" p={4}>
            <Flex justify="space-between" align="center">
              <HStack p={3} bg={'secondary.400'} spacing={6} w={'fit-content'} justify={'center'} borderRadius={'3xl'}>
                 <IconButton 
                  icon={<CloseIcon/>}
                  onClick={onClose}
                  position="relative"
                  right="4"
                  w={12}
                  variant={'outline'}
                  borderRadius={'full'}
                />
                <VStack align="center" spacing={0}>
                  <Text fontWeight="bold">{t('SupportChat')}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {t('WeAreHereToHelp')}
                  </Text>
                </VStack>
              </HStack>
              
              <HStack spacing={2}>
                <Tooltip label={t('Reconnect')}>
                  <IconButton
                    icon={<RepeatIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={reconnect}
                    aria-label={t('Reconnect')}
                  />
                </Tooltip>
                <Badge 
                  colorScheme={
                    status === "connected" ? "green" :
                    status === "connecting" ? "yellow" :
                    status === "error" ? "red" : "gray"
                  } 
                  px={2} 
                  py={1} 
                  borderRadius="full"
                  fontSize="xs"
                >
                  {status === "connected" ? "🟢 Online" :
                   status === "connecting" ? "🟡 Connecting" :
                   status === "error" ? "🔴 Error" : "⚪ Offline"}
                </Badge>
              </HStack>
            </Flex>
          </DrawerHeader>
          
          <DrawerBody p={0} display="flex" flexDirection="column">
            {/* Messages Container */}
            <Box
              ref={messagesContainerRef}
              flex={1}
              p={4}
              overflowY="auto"
              bg="gray.50"
              css={{
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#555',
                },
              }}
            >
              {/* Loading State */}
              {status === "connecting" && messages.length === 0 && (
                <Flex align="center" justify="center" h="200px">
                  <Spinner size="lg" color="secondary.600" mr={3} />
                  <Text color="gray.500">Connecting to support...</Text>
                </Flex>
              )}

              {/* Error State */}
              {status === "error" && (
                <Flex direction="column" align="center" justify="center" h="200px" p={4}>
                  <Text fontSize="3xl" mb={2}>⚠️</Text>
                  <Text color="red.500" fontWeight="bold" mb={2}>Connection Error</Text>
                  <Text fontSize="sm" color="gray.600" mb={4} textAlign="center">
                    {t('UnableToConnectSupport')}
                  </Text>
                  <Button 
                    size="sm" 
                    onClick={reconnect}
                    leftIcon={<RepeatIcon />}
                    colorScheme="secondary"
                    variant="outline"
                  >
                    Reconnect
                  </Button>
                </Flex>
              )}

              {/* Empty State */}
              {status === "connected" && messages.length === 0 && (
                <Flex direction="column" align="center" justify="center" h="200px" p={4}>
                  <Text fontSize="3xl" mb={2}>💬</Text>
                  <Text color="gray.500" textAlign="center" mb={2} fontWeight="medium">
                    No messages yet
                  </Text>
                  <Text fontSize="sm" color="gray.400" textAlign="center">
                    Start a conversation with our support team!
                  </Text>
                </Flex>
              )}

              {/* Messages Grouped by Date */}
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <Box key={date} mb={4}>
                  {/* Date Separator */}
                  <Flex justify="center" my={4}>
                    <Badge colorScheme="gray" px={3} py={1} borderRadius="full" fontSize="xs">
                      {date}
                    </Badge>
                  </Flex>
                  
                  {/* Messages for this date */}
                  {dateMessages.map((msg, index) => {
                    const isUser = msg.sender_type === "user";
                    const isAdmin = msg.sender_type === "admin";
                    const showAvatar = index === 0 || 
                      dateMessages[index - 1].sender_type !== msg.sender_type;
                    
                    return (
                      <Flex
                        key={msg.id}
                        mb={3}
                        justify={isUser ? "flex-end" : "flex-start"}
                        align="flex-end"
                      >
                        {/* Admin Avatar (left side) */}
                        {isAdmin && (
                          <Avatar
                            size="sm"
                            name="Support"
                            bg="secondary.600"
                            color="white"
                            mr={2}
                            visibility={showAvatar ? "visible" : "hidden"}
                          />
                        )}

                        <Box
                          maxW="75%"
                          px={3}
                          py={2}
                          borderRadius="lg"
                          bg={isUser ? "secondary.600" : "white"}
                          color={isUser ? "white" : "gray.800"}
                          boxShadow="sm"
                          borderWidth="1px"
                          borderColor={isAdmin ? "gray.200" : "transparent"}
                          position="relative"
                        >
                          {/* Sender Label (for admin messages) */}
                          {isAdmin && showAvatar && (
                            <Text fontSize="xs" fontWeight="bold" color="secondary.600" mb={1}>
                              Support Team
                            </Text>
                          )}

                          {/* Message Content */}
                          <Text whiteSpace="pre-wrap" fontSize="sm">
                            {msg.content}
                          </Text>
                          
                          {/* Timestamp and Status */}
                          <Flex
                            justify="space-between"
                            align="center"
                            mt={1}
                            fontSize="xs"
                            color={isUser ? "secondary.600" : "gray.500"}
                          >
                            <Text>{formatTime(msg.created_at)}</Text>
                            {isUser && (
                              <Text ml={2}>
                                {msg.is_read ? "✓✓ Read" : "✓ Sent"}
                              </Text>
                            )}
                          </Flex>
                          
                          {/* Unread indicator for admin messages */}
                          {isAdmin && !msg.is_read && (
                            <Box
                              position="absolute"
                              top="-1"
                              left="-1"
                              w="8px"
                              h="8px"
                              borderRadius="full"
                              bg="secondary.600"
                              border="2px solid white"
                            />
                          )}
                        </Box>

                        {/* User Avatar placeholder (right side) - for alignment */}
                        {isUser && (
                          <Box w="32px" ml={2} />
                        )}
                      </Flex>
                    );
                  })}
                </Box>
              ))}
              
              {/* Auto-scroll anchor */}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box
              p={4}
              borderTopWidth="1px"
              borderTopColor="gray.200"
              bg="white"
            >
              <HStack spacing={2}>
                <Input
                  placeholder={
                    status === "connected" 
                      ? "Type your message..." 
                      : "Waiting for connection..."
                  }
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={status !== "connected" || isSending}
                  size="md"
                  borderRadius="md"
                />
                <Button
                  onClick={handleSend}
                  colorScheme="brand"
                  px={6}
                  isDisabled={!text.trim() || status !== "connected"}
                  isLoading={isSending}
                  loadingText="Sending"
                  borderRadius="md"
                >
                  {t('send')}
                </Button>
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
                Press Enter to send • Shift+Enter for new line
              </Text>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
