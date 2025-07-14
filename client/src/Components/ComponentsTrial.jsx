/* eslint-disable */
import { useState, useEffect } from 'react'
import {
  Button,
  Input,
  Textarea,
  Checkbox,
  Radio,
  RadioGroup,
  Alert,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Progress,
  Switch,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  useDisclosure,
  useColorMode,
  MenuList,
  MenuItem,
  Badge,
} from '@chakra-ui/react'
import { StarIcon } from '@chakra-ui/icons'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
//import { CartDemo } from "./Cart";

// Button Component - Fully leveraging theme variants
export const BTN = ({
  type = 'button',
  size = 'md',
  colorScheme = 'brand',
  variant = 'solid',
  disabled = false,
  icon,
  onClick,
  children,
}) => {
  // This is better as we're getting the exact style configuration from the theme
  return (
    <Button
      type={type}
      size={size}
      colorScheme={colorScheme}
      variant={variant}
      isDisabled={disabled}
      leftIcon={icon}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

// Text Input Component - Using theme variants properly
export const TXT = ({
  placeholder,
  value,
  maxLength,
  variant = 'outline',
  disabled = false,
  onChange,
  textTransform,
  name,
}) => {
  const { colorMode } = useColorMode()

  return (
    <Input
      name={name}
      placeholder={placeholder}
      value={value}
      maxLength={maxLength}
      variant={variant}
      isDisabled={disabled}
      onChange={onChange}
      w="auto"
      _focus={{
        borderColor: 'brand.700',
      }}
      sx={{
        borderColor: colorMode === 'dark' ? 'gray.600' : 'gray.300',
        borderWidth: '2px',
        color: colorMode === 'dark' ? 'white' : 'black',
        textTransform: textTransform || 'uppercase',
        backgroundColor: 'white',
      }}
    />
  )
}

// Text Area Component - Using theme styles
export const TXTAREA = ({ rows = 3, cols, value, maxLength, disabled = false, onChange }) => {
  const { colorMode } = useColorMode()
  return (
    <Textarea
      rows={rows}
      cols={cols}
      value={value}
      maxLength={maxLength}
      isDisabled={disabled}
      onChange={onChange}
      placeholder="Enter text here..."
      variant="outline"
      _focus={{ borderColor: 'brand.700' }}
      sx={{
        borderColor: colorMode === 'dark' ? 'gray.600' : 'gray.300',
        borderWidth: '2px',
        color: colorMode === 'dark' ? 'white' : 'black',
        backgroundColor: 'white',
      }}
    />
  )
}

// Switch Toggle Component with Text
export const SwitchToggle = ({ isOn = false, onChange, label }) => (
  <Flex align="center" gap={3}>
    <TSW isOn={isOn} onChange={onChange} />
    {label && <Text>{label}</Text>}
  </Flex>
)

// Checkbox Component - Using theme colors
export const CHK = ({ checked = false, label, disabled = false, onChange }) => (
  <Checkbox
    isChecked={checked}
    isDisabled={disabled}
    onChange={onChange}
    colorScheme="brand"
    color={'brand.700'}
    sx={{
      color: 'brand.700',
      '&:hover': {
        color: 'brand.800',
      },
    }}
  >
    {label}
  </Checkbox>
)

// Radio Buttons Component - Using theme colors
export const RDO = ({ name, options = [], selected, disabled = false, onChange }) => (
  <RadioGroup value={selected} onChange={onChange} name={name}>
    <Stack direction="column">
      {options.map((option) => (
        <Radio key={option.value} value={option.value} isDisabled={disabled} colorScheme="brand">
          {option.label}
        </Radio>
      ))}
    </Stack>
  </RadioGroup>
)

// Dropdown Component - Now properly using the navButton variant from theme
export const DD = ({
  options = [],
  selectedItem,
  disabled = false,
  onChange,
  placeholder = 'Select option',
  settableMenu = false,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selected, setSelected] = useState(selectedItem)

  return (
    <Menu isOpen={isOpen} onClose={onClose} placement="bottom">
      <MenuButton as={Button} variant="underlined" onClick={onOpen} isDisabled={disabled}>
        <span>{settableMenu ? options.find((o) => o.value === selected)?.label : placeholder}</span>
      </MenuButton>
      <MenuList>
        {options.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => {
              setSelected(option.value)
              onChange(option.value)
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}

// Alert dialogue
export const ALT = ({
  message,
  type = 'success',
  dismissible = false,
  icon,
  timeout,
  onDismiss,
}) => {
  const [show, setShow] = useState(true)
  //const { colorMode } = useColorMode();

  useEffect(() => {
    if (timeout) {
      const timer = setTimeout(() => setShow(false), timeout)
      return () => clearTimeout(timer)
    }
  }, [timeout])

  if (!show) return null

  return (
    <Alert
      status={type}
      variant="solid"
      border={'solid 2px'}
      colorScheme={
        type === 'success'
          ? 'success'
          : type === 'error'
            ? 'error'
            : type === 'warning'
              ? 'warning'
              : 'info'
      }
      borderRadius="md"
      borderColor={`${type}.400`}
      color={`${type}.700`}
      m={2}
      w={'auto'}
    >
      {icon ? icon : ''}
      <Box flex="1">
        <AlertTitle>{message.title}</AlertTitle>
        <AlertDescription>{message.description}</AlertDescription>
      </Box>
      {dismissible && (
        <CloseButton
          position="absolute"
          right="8px"
          top="8px"
          onClick={onDismiss || (() => setShow(false))}
          color={`${type}.700`}
          _hover={{ color: `${type}.900` }}
          borderColor={`${type}.700`}
        />
      )}
    </Alert>
  )
}

// Date Picker Component - Using layerStyle from theme
export const DP = ({ selectedDate, minDate, maxDate, onSelect }) => {
  const { colorMode } = useColorMode()

  return (
    <Box
      layerStyle={colorMode === 'dark' ? 'card-dark' : 'card'}
      p={2}
      display="inline-block"
      sx={{
        borderColor: colorMode === 'dark' ? 'brand.600' : 'brand.300',
        borderWidth: '2px',
        borderRadius: 'md',
        backgroundColor: colorMode === 'dark' ? 'gray.700' : 'white',
        color: colorMode === 'dark' ? 'white' : 'black',
      }}
    >
      <DatePicker
        selected={selectedDate}
        onChange={onSelect}
        minDate={minDate}
        maxDate={maxDate}
        inline
        calendarClassName={colorMode === 'dark' ? 'react-datepicker-dark' : ''}
      />
    </Box>
  )
}

// Slider Component - Using theme colors
export const SLD = ({ min = 0, max = 100, step = 1, value, onChange }) => (
  <Slider min={min} max={max} step={step} value={value} onChange={onChange} colorScheme="brand">
    <SliderTrack>
      <SliderFilledTrack />
    </SliderTrack>
    <SliderThumb />
  </Slider>
)

// Progress Bar Component - Using theme colors
export const PB = ({
  value = 0,
  max = 100,
  colorScheme = 'brand',
  animated = false,
  size = 'md',
}) => (
  <Progress
    value={(value / max) * 100}
    colorScheme={colorScheme}
    hasStripe={animated}
    isAnimated={animated}
    size={size}
    borderRadius="full"
  />
)

// Toggle Switch Component - Using theme colors
// export const TSW = ({ isOn = false, disabled = false, onChange }) => (

// )

// Rating Component - Better color mode handling
export const RATE = ({ value = 0, maxStars = 5, readOnly = false, onRateChange }) => {
  const [rating, setRating] = useState(value)
  const [hoverRating, setHoverRating] = useState(0)
  const { colorMode } = useColorMode()

  const handleClick = (newRating) => {
    if (!readOnly) {
      setRating(newRating)
      if (onRateChange) onRateChange(newRating)
    }
  }

  return (
    <Box>
      {[...Array(maxStars)].map((_, i) => {
        const starValue = i + 1
        return (
          <StarIcon
            key={starValue}
            color={
              starValue <= (hoverRating || rating)
                ? 'brand.500'
                : colorMode === 'dark'
                  ? 'gray.400'
                  : 'gray.200'
            }
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            onClick={() => handleClick(starValue)}
            cursor={readOnly ? 'default' : 'pointer'}
            boxSize={6}
            mr={1}
          />
        )
      })}
    </Box>
  )
}

// Modal Component - Using theme styles
export const MOD = ({ visible, title, content, actions, onClose, children }) => {
  const { isOpen, onClose: handleClose } = useDisclosure()

  return (
    <>
      <Modal isOpen={visible || isOpen} onClose={onClose || handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textStyle="heading">{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{content || children}</ModalBody>
          <ModalFooter>
            {actions || (
              <Button colorScheme="brand" onClick={onClose || handleClose}>
                Close
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export const ACC = ({ sections = [], expandedIndex, onToggle }) => {
  // For proper operation with Chakra UI's Accordion
  // expandedIndex needs to be converted to an array for controlled behavior
  const indexValue = expandedIndex !== undefined && expandedIndex >= 0 ? [expandedIndex] : []

  // Debug log
  useEffect(() => {
    //console.log('ACC rendering with expandedIndex:', expandedIndex)
    console.log('Using indexValue:', indexValue)
  }, [expandedIndex, indexValue])

  return (
    <Accordion
      index={indexValue}
      onChange={(indexes) => {
        console.log('Accordion onChange triggered with:', indexes)
        if (onToggle) {
          onToggle(indexes)
        }
      }}
      allowToggle={true}
    >
      {sections.map((section, index) => (
        <AccordionItem key={index} id={`section-${index}`} data-section-name={section.title}>
          <h2>
            <AccordionButton
              _expanded={{border: '4px solid brand.500', bg: 'brand.500' }}
              _hover={{ bg: 'secondary.500' }}
              sx={{ borderColor: 'brand.500', bg: 'brand.500', color: 'brand.900',my:-0.5 }}
            >
              <Box flex="1" textAlign="left" textStyle="heading">
                <Flex align="center" gap={2}>
                  {section.icon && (
                    <img
                      width={32}
                      src={section.icon}
                      alt=""
                      style={{ borderRadius: '50%', backgroundColor: 'white', padding: 8 }}
                    />
                  )}
                  <Heading size="md">{section.title}</Heading>
                </Flex>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel my={4} style={{ overflowY: 'auto', maxHeight: '50vh' }}>
            {section.content}
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
// Tabs Component - Using theme colors
export const TAB = ({
  items = [],
  activeTab = 0,
  onSelect,
  orientation = 'horizontal',
  variant = 'soft-rounded',
}) => {
  return (
    <Tabs
      index={activeTab}
      onChange={onSelect}
      orientation={orientation}
      colorScheme="brand"
      variant={variant}
    >
      <TabList mb={4} overflowX="auto" flexWrap={{ base: 'nowrap', lg: 'wrap' }}>
        {items.map((item, index) => (
          <Tab
            as={item.as || Button}
            variant={item.variant || 'underlined'}
            key={index}
            minWidth="auto"
            ml={2}
            whiteSpace="nowrap"
          >
            {item.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {items.map((item, index) => (
          <TabPanel key={index}>{item.content}</TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  )
}

// Table Component - Using theme styles
export const TBL = ({ data = [] }) => {
  if (data.length === 0) {
    return <Text>No data available</Text>
  }

  const headers = Object.keys(data[0])
  const itemsColumnExists = headers.includes('items')

  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          {headers.map((header) => header !== 'items' && <Th key={header}>{header}</Th>)}
          {itemsColumnExists && (
            <>
              <Th>Item Name</Th>
              <Th>Item Price</Th>
              <Th>Item Quantity</Th>
            </>
          )}
        </Tr>
      </Thead>
      <Tbody>
        {data.map((row, rowIndex) => {
          // If we have items, we'll need multiple rows for each parent row
          const items = row.items || []
          // For rows with no items, or for the first item row, render the parent data

          if (items.length === 0) {
            return (
              <Tr key={`row-${rowIndex}`} borderBottom={'solid 2px gray.200'}>
                {headers.map(
                  (header) =>
                    header !== 'items' && (
                      <Td key={`cell-${rowIndex}-${header}`}>
                        {typeof row[header] === 'object'
                          ? JSON.stringify(row[header])
                          : row[header]}
                      </Td>
                    ),
                )}
                {itemsColumnExists && (
                  <>
                    <Td colSpan={3}>No items</Td>
                  </>
                )}
              </Tr>
            )
          }

          // Render a row for each item, with parent data only shown in the first row
          return items.map((item, itemIndex) => (
            <Tr key={`row-${rowIndex}-item-${itemIndex}`}>
              {/* Only show parent row data in the first item row */}
              {itemIndex === 0 &&
                headers.map(
                  (header) =>
                    header !== 'items' && (
                      <Td key={`cell-${rowIndex}-${header}`} rowSpan={items.length}>
                        {typeof row[header] === 'object'
                          ? JSON.stringify(row[header])
                          : row[header]}
                      </Td>
                    ),
                )}

              {/* For rows after the first item, we need to offset these cells */}
              {itemIndex !== 0 && headers.filter((header) => header !== 'items').length > 0 && (
                <Td colSpan={0} style={{ display: 'none' }}></Td>
              )}

              {/* Render item details */}
              <Td>{item.name}</Td>
              <Td>{item.price}</Td>
              <Td>{item.quantity}</Td>
            </Tr>
          ))
        })}
      </Tbody>
    </Table>
  )
}

// Loader Component - Using theme colors
export const LD = ({ size = 'md', colorScheme = 'brand', type = 'spinner' }) => {
  if (type === 'spinner') {
    return <Spinner size={size} color={`${colorScheme}.500`} />
  }
  return <Progress size={size} colorScheme={colorScheme} isIndeterminate />
}

// Badge List Component - Reused from ProfileComponent
export const BadgeList = ({ items = [], colorScheme = 'tertiary', emptyMessage }) => (
  <Flex wrap="wrap" gap={2} w={'auto'} justify="flex-start">
    {items.length > 0 ? (
      items.map((item, index) => (
        <Badge
          key={index}
          colorScheme={colorScheme}
          variant="subtle"
          px={3}
          py={1}
          borderRadius="full"
        >
          {item}
        </Badge>
      ))
    ) : (
      <Text color="gray.500">{emptyMessage}</Text>
    )}
  </Flex>
)

// Base Card component for inheritance - Reused from ProfileComponent
export const Card = ({ children, colorScheme, ...props }) => {
  const { colorMode } = useColorMode()
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="22px"
      colorScheme={colorScheme || 'gray'}
      bg={colorMode === 'dark' ? `${colorScheme || 'gray'}.800` : `${colorScheme || 'gray'}.300`}
      {...props}
    >
      {children}
    </Box>
  )
}

// Tab Content Component - Reused from ProfileComponent
export const TabContent = ({ title, children, isEmpty, emptyMessage = 'No data available' }) => (
  <>
    <Heading size="md" mb={4} color="brand.700">
      {title}
    </Heading>
    {isEmpty ? (
      <Text color="gray.500">{emptyMessage}</Text>
    ) : (
      <Box overflowY="auto" maxHeight="400px" borderRadius="30px">
        {children}
      </Box>
    )}
  </>
)

// Calorie Tracker Component
export const CalorieTracker = ({ goal, current }) => {
  const { colorMode } = useColorMode()
  const remaining = goal - current

  return (
    <Card sx={{ background: 'brand.100' }} mb={4}>
      <Heading size="md" mb={4} color="brand.700">
        Daily Calorie Tracking
      </Heading>
      <Flex justify="space-between" mb={2}>
        <Text>Consumed: {current} cal</Text>
        <Text>Goal: {goal} cal</Text>
      </Flex>
      <PB value={current} max={goal} colorScheme={current > goal ? 'red' : 'brand'} size="lg" />
      <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
        {remaining > 0 ? `${remaining} calories remaining` : 'Goal exceeded'}
      </Text>
    </Card>
  )
}

// Notification Setting Component - Reused from ProfileComponent
export const NotificationSetting = ({ name, value, onChange }) => {
  const { colorMode } = useColorMode()
  return (
    <Flex
      p={4}
      mx="20%"
      borderRadius="20px"
      bg={colorMode === 'dark' ? 'gray.800' : 'gray.100'}
      align="center"
      justify="space-between"
    >
      <Text>{name.replace(/^\w/, (c) => c.toUpperCase())} Notifications</Text>
      <TSW isOn={value} onChange={onChange} />
    </Flex>
  )
}

// Widgets Playground - Using layer styles from theme
export const ComponentsTrial = () => {
  const [textValue, setTextValue] = useState('')
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [selectedRadio, setSelectedRadio] = useState('option1')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [sliderValue, setSliderValue] = useState(50)

  const [rating, setRating] = useState(3)
  const [activeTab, setActiveTab] = useState(0)
  const [expandedAccordion, setExpandedAccordion] = useState(0)
  const { colorMode, toggleColorMode } = useColorMode()

  const radioOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ]

  const dropdownOptions = [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
  ]

  const accordionSections = [
    { title: 'Section 1', content: 'Content for section 1' },
    { title: 'Section 2', content: 'Content for section 2' },
  ]

  const tabItems = [
    { label: 'Tab 1', content: 'Content for tab 1' },
    { label: 'Tab 2', content: 'Content for tab 2' },
  ]

  return (
    <Box p={4} bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading mb={0} textStyle="heading">
          Widgets Playground
        </Heading>
        <Button onClick={toggleColorMode} size="sm">
          Toggle {colorMode === 'light' ? 'Dark' : 'Light'} Mode
        </Button>
      </Flex>

      <Stack spacing={6}>
        <Box layerStyle={colorMode === 'dark' ? 'card-dark' : 'card'}>
          <Heading size="md" mb={3} textStyle="heading">
            Button
          </Heading>
          <Flex gap={4} wrap="wrap">
            <BTN onClick={() => alert('Button clicked')}>Default</BTN>
            <BTN variant="outline" onClick={() => alert('Outline clicked')}>
              Outline
            </BTN>
            <BTN variant="ghost" onClick={() => alert('Ghost clicked')}>
              Ghost
            </BTN>
            <BTN size="xl" onClick={() => alert('Large clicked')}>
              Large
            </BTN>
          </Flex>
        </Box>

        <Box layerStyle={colorMode === 'dark' ? 'card-dark' : 'card'}>
          <Heading size="md" mb={3} textStyle="heading">
            Text Input
          </Heading>
          <TXT
            placeholder="Enter text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
          />
        </Box>

        <Box layerStyle={colorMode === 'dark' ? 'card-dark' : 'card'}>
          <Heading size="md" mb={3} textStyle="heading">
            Text Area
          </Heading>
          <TXTAREA value={textValue} onChange={(e) => setTextValue(e.target.value)} />
        </Box>

        <Box layerStyle={colorMode === 'dark' ? 'card-dark' : 'card'}>
          <Heading size="md" mb={3} textStyle="heading">
            Checkbox
          </Heading>
          <CHK
            label="Check me"
            checked={checkboxChecked}
            onChange={(e) => setCheckboxChecked(e.target.checked)}
          />
        </Box>

        <Box layerStyle={colorMode === 'dark' ? 'card-dark' : 'card'}>
          <Heading size="md" mb={3} textStyle="heading">
            Radio Buttons
          </Heading>
          <RDO
            name="radioGroup"
            options={radioOptions}
            selected={selectedRadio}
            onChange={setSelectedRadio}
          />
        </Box>

        <Box layerStyle={colorMode === 'dark' ? 'card-dark' : 'card'}>
          <Heading size="md" mb={3} textStyle="heading">
            Dropdown
          </Heading>
          <DD options={dropdownOptions} selectedItem="opt1" onChange={() => {}} />
        </Box>

        <Box layerStyle={colorMode === 'dark' ? 'card-dark' : 'card'}>
          <Heading size="md" mb={3} textStyle="heading">
            Alert
          </Heading>
          <ALT
            message={{ title: 'Alert', description: 'This is a hazard message' }}
            type="error"
            dismissible
          />
          <ALT
            message={{ title: 'Alert', description: 'This is an alert message' }}
            type="warning"
            dismissible
          />
          <ALT
            message={{ title: 'Alert', description: 'This is a success message' }}
            type="success"
            dismissible
          />
          <ALT
            message={{ title: 'Alert', description: 'This is an info message' }}
            type="info"
            dismissible
          />
        </Box>

        <Box layerStyle={colorMode === 'dark' ? 'card-dark' : 'card'}>
          <Heading size="md" mb={3} textStyle="heading">
            Date Picker
          </Heading>
          <DP selectedDate={selectedDate} onSelect={setSelectedDate} />
        </Box>

        <Box layerStyle={colorMode === 'dark' ? 'card-dark' : 'card'}>
          <Heading size="md" mb={3} textStyle="heading">
            Slider
          </Heading>
          <SLD value={sliderValue} onChange={setSliderValue} />
          <Text mt={2}>Value: {sliderValue}</Text>
        </Box>

        <Box layerStyle={colorMode === 'dark' ? 'card-dark' : 'card'}>
          <Heading size="md" mb={3} textStyle="heading">
            Toggle Switch
          </Heading>
          <SwitchToggle isOn={false} label="Switch is OFF" onChange={() => {}} />
        </Box>

        <Box layerStyle={colorMode === 'dark' ? 'card-dark' : 'card'}>
          <Heading size="md" mb={3} textStyle="heading">
            Rating
          </Heading>
          <RATE value={rating} onRateChange={setRating} />
          <Text mt={2}>Rating: {rating} stars</Text>
        </Box>

        <Box layerStyle={colorMode === 'dark' ? 'card-dark' : 'card'}>
          <Heading size="md" mb={3} textStyle="heading">
            Accordion
          </Heading>
          <ACC
            sections={accordionSections}
            expandedItem={expandedAccordion}
            onToggle={setExpandedAccordion}
          />
        </Box>

        <Box layerStyle={colorMode === 'dark' ? 'card-dark' : 'card'}>
          <Heading size="md" mb={3} textStyle="heading">
            Tabs
          </Heading>
          <TAB items={tabItems} activeTab={activeTab} onSelect={setActiveTab} />
        </Box>

        <Box layerStyle={colorMode === 'dark' ? 'card-dark' : 'card'}>
          <Heading size="md" mb={3} textStyle="heading">
            Badge List
          </Heading>
          <BadgeList items={['Item 1', 'Item 2', 'Item 3']} colorScheme="brand" />
        </Box>

        <Box layerStyle={colorMode === 'dark' ? 'card-dark' : 'card'}>
          <Heading size="md" mb={3} textStyle="heading">
            Loader
          </Heading>
          <Flex gap={4}>
            <LD />
            <LD type="progress" />
          </Flex>
        </Box>
      </Stack>
      <Box mt={6}>
        <Heading size="md" mb={4} textStyle="heading">
          Cart
        </Heading>
      </Box>
    </Box>
  )
}
