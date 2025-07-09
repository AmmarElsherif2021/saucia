import { useState } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import {ENTITY_CONFIGS} from './AdminEntityConfigs';
// Explicit entity handlers
const ENTITY_HANDLERS = {
  items: (adminFunctions) => ({
    create: adminFunctions.createItemComplete,
    update: adminFunctions.updateItemComplete,
    delete: adminFunctions.deleteItemComplete,
  }),
  meals: (adminFunctions) => ({
    create: adminFunctions.createMealComplete,
    update: adminFunctions.updateMealComplete,
    delete: adminFunctions.deleteMealComplete,
  }),
  plans: (adminFunctions) => ({
    create: adminFunctions.createPlanComplete,
    update: adminFunctions.updatePlanComplete,
    delete: adminFunctions.deletePlanComplete,
  }),
  users: (adminFunctions) => ({
    create: adminFunctions.createUserComplete,
    update: adminFunctions.updateUserComplete,
    delete: adminFunctions.deleteUserComplete,
  }),
  orders: (adminFunctions) => ({
    create: adminFunctions.createOrderComplete,
    update: adminFunctions.updateOrderComplete,
    delete: adminFunctions.deleteOrderComplete,
  }),
  subscriptions: (adminFunctions) => ({
    create: adminFunctions.createSubscriptionComplete,
    update: adminFunctions.updateSubscriptionComplete,
    delete: adminFunctions.deleteSubscriptionComplete,
  }),
  allergies: (adminFunctions) => ({
    create: adminFunctions.createAllergyComplete,
    update: adminFunctions.updateAllergyComplete,
    delete: adminFunctions.deleteAllergyComplete,
  }),
  dietaryPreferences: (adminFunctions) => ({
    create: adminFunctions.createDietaryPreferenceComplete,
    update: adminFunctions.updateDietaryPreferenceComplete,
    delete: adminFunctions.deleteDietaryPreferenceComplete,
  }),
};

// Sanitize data function remains the same
const sanitizeData = (data) => {
    const sanitized = {...data};
    
    // Remove timestamp fields if they're empty
    ['created_at', 'updated_at'].forEach(field => {
      if (sanitized[field] === '') {
        delete sanitized[field];
      }
    });
    
    return sanitized;
  };
  

export const useEntityManager = (entityType, adminFunctions) => {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const modals = {
    add: useDisclosure(),
    edit: useDisclosure(),
    delete: useDisclosure(),
  };

  // Get explicit handlers for this entity
  const handlers = ENTITY_HANDLERS[entityType](adminFunctions);

  const handleAdd = async (data) => {
    try {
      await handlers.create(sanitizeData(data));
      modals.add.onClose();
    } catch (error) {
      window.alert(`Failed to add ${entityType.slice(0, -1)}: ${error.message}`);
    }
  };

  const handleEdit = async (id, data) => {
    try {
      await handlers.update({ 
        [`${entityType.slice(0, -1)}Id`]: id, 
        updateData: sanitizeData(data) 
      });
      modals.edit.onClose();
    } catch (error) {
      window.alert(`Failed to edit ${entityType.slice(0, -1)}: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await handlers.delete(id);
      modals.delete.onClose();
    } catch (error) {
      window.alert(`Failed to delete ${entityType.slice(0, -1)}: ${error.message}`);
    }
  };

  const handleImport = async (event) => {
    if (!handlers.import) return;
    
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const entitiesData = JSON.parse(e.target.result);
        await handlers.import(entitiesData);
        window.alert(`${entityType} imported successfully!`);
      } catch (error) {
        window.alert(`Failed to import ${entityType}: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExport = async (data) => {
    if (!handlers.export) return;
    
    try {
      await handlers.export(data);
    } catch (error) {
      window.alert(`Failed to export ${entityType}: ${error.message}`);
    }
  };

  const filterEntities = (entities) => {
    if (!searchTerm) return entities;
    const config = ENTITY_CONFIGS[entityType];
    return entities?.filter((entity) => {
      const searchString = config.searchFields
        .map(field => entity[field] || '')
        .join(' ')
        .toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
  }

  return {
    selectedEntity,
    setSelectedEntity,
    searchTerm,
    setSearchTerm,
    modals,
    handlers: {
      handleAdd,
      handleEdit,
      handleDelete,
      handleImport,
      handleExport,
    },
    filterEntities,
    config: ENTITY_CONFIGS[entityType],
    isLoading: false,
    isUpdating: false,
    isCreating: false
  };
};