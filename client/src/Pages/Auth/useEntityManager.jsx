import { useState } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import { useEntityConfigs } from './AdminEntityConfigs';

// Map entity types to their singular ID field names
const ENTITY_ID_MAPPING = {
  items: 'itemId',
  meals: 'mealId',
  plans: 'planId',
  users: 'userId',
  allergies: 'allergyId',
  dietaryPreferences: 'preferenceId',
};

// Entity handlers that map to useAdminFunctions hooks
const ENTITY_HANDLERS = {
  items: (hooks) => ({
    create: hooks.useCreateItem(),
    update: hooks.useUpdateItem(),
    delete: hooks.useDeleteItem(),
  }),
  meals: (hooks) => ({
    create: hooks.useCreateMeal(),
    update: hooks.useUpdateMeal(),
    delete: hooks.useDeleteMeal(),
  }),
  plans: (hooks) => ({
    create: hooks.useCreatePlan(),
    update: hooks.useUpdatePlan(),
    delete: hooks.useDeletePlan(),
  }),
  users: (hooks) => ({
    create: null, // Users created via authentication only
    update: hooks.useUpdateUser(),
    delete: null, // User deletion not supported
  }),
  allergies: (hooks) => ({
    create: hooks.useCreateAllergy(),
    update: hooks.useUpdateAllergy(),
    delete: hooks.useDeleteAllergy(),
  }),
  dietaryPreferences: (hooks) => ({
    create: hooks.useCreateDietaryPreference(),
    update: hooks.useUpdateDietaryPreference(),
    delete: hooks.useDeleteDietaryPreference(),
  }),
};

// Enhanced sanitize data function
const sanitizeData = (data, entityType) => {
  //console.log(`🧹 Sanitizing ${entityType} data:`, data);
  
  const sanitized = { ...data };
  
  // Remove read-only fields that shouldn't be sent to API
  const fieldsToRemove = [
  'created_at',
  'updated_at',
  'meal_allergies',
  'item_allergies',
  'user_profiles',
  'plans',
  'allergies', // Will be replaced with allergy_ids
  'dietary_preferences', // Will be replaced with dietary_preference_ids
  // 'meals', // REMOVED - Keep meals for plans
  'items', // For meals, will be replaced with item_ids
];
  
  fieldsToRemove.forEach(field => {
    if (sanitized[field] !== undefined) {
      delete sanitized[field];
    }
  });
  
  // Convert empty strings to null for database
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === '') {
      sanitized[key] = null;
    }
  });
  
  // Entity-specific transformations
if (entityType === 'plans') {
  // Ensure additives is an array
  if (!sanitized.additives) sanitized.additives = [];
  
  // CRITICAL: Don't delete meals field for plans
  // Keep meals data and ensure it's properly formatted
  if (sanitized.meals && Array.isArray(sanitized.meals)) {
    const formattedMeals = sanitized.meals.map(meal => {
      if (typeof meal === 'object' && meal.meal_id) {
        return {
          meal_id: meal.meal_id,
          is_substitutable: meal.is_substitutable || false
        };
      } else if (typeof meal === 'object' && meal.id) {
        return {
          meal_id: meal.id,
          is_substitutable: meal.is_substitutable || false
        };
      }
      return {
        meal_id: meal,
        is_substitutable: false
      };
    });
    sanitized.meals = formattedMeals;
    console.log('🔄 Formatted meals for API:', sanitized.meals);
  } else {
    // If no meals provided, set empty array
    sanitized.meals = [];
  }
}
  
  if (entityType === 'users') {
    // Ensure allergy_ids and dietary_preference_ids are present
    if (!sanitized.allergy_ids) sanitized.allergy_ids = [];
    if (!sanitized.dietary_preference_ids) sanitized.dietary_preference_ids = [];
  }
  
  //console.log(`✅ Sanitized ${entityType} data:`, sanitized);
  return sanitized;
};

export const useEntityManager = (entityType, adminFunctions) => {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { ENTITY_CONFIGS } = useEntityConfigs();
  
  const modals = {
    add: useDisclosure(),
    edit: useDisclosure(),
    delete: useDisclosure(),
  };

  // Get mutation hooks for this entity
  const handlers = ENTITY_HANDLERS[entityType](adminFunctions);

  const handleAdd = async (data) => {
    //console.log(`🚀 Starting ADD for ${entityType}:`, data);
    
    if (!handlers.create) {
      window.alert(`Creating ${entityType} is not supported`);
      return;
    }

    try {
      const sanitizedData = sanitizeData(data, entityType);
      //console.log(`📤 Calling create mutation for ${entityType}:`, sanitizedData);
      
      await handlers.create.mutateAsync(sanitizedData);
      
      modals.add.onClose();
      //console.log(`✅ ADD ${entityType} completed successfully`);
    } catch (error) {
      console.error(`❌ ADD ${entityType} failed:`, error);
      window.alert(`Failed to add ${ENTITY_CONFIGS[entityType]?.singular || entityType.slice(0, -1)}: ${error.message}`);
    }
  };

const handleEdit = async (id, data) => {
  console.log(`🚀 Starting EDIT for ${entityType} ID ${id}:`, data);
  
  if (!handlers.update) {
    window.alert(`Editing ${entityType} is not supported`);
    return;
  }

  try {
    const idField = ENTITY_ID_MAPPING[entityType];
    if (!idField) {
      throw new Error(`No ID mapping found for entity type: ${entityType}`);
    }
    
    if (!id || id === 'undefined') {
      throw new Error(`Invalid ID provided for ${entityType}: ${id}`);
    }
    
    const sanitizedData = sanitizeData(data, entityType);
    console.log(`📤 Calling update mutation for ${entityType}:`, { 
      [idField]: id, 
      updateData: sanitizedData,
      mealsData: sanitizedData.meals // Log specifically the meals data
    });
    
    await handlers.update.mutateAsync({ 
      [idField]: id, 
      updateData: sanitizedData 
    });
    
    modals.edit.onClose();
    console.log(`✅ EDIT ${entityType} completed successfully`);
  } catch (error) {
    console.error(`❌ EDIT ${entityType} failed:`, error);
    window.alert(`Failed to edit ${ENTITY_CONFIGS[entityType]?.singular || entityType.slice(0, -1)}: ${error.message}`);
  }
};

  const handleDelete = async (id) => {
    //console.log(`🚀 Starting DELETE for ${entityType} ID ${id}`);
    
    if (!handlers.delete) {
      window.alert(`Deleting ${entityType} is not supported`);
      return;
    }

    try {
      if (!id || id === 'undefined') {
        throw new Error(`Invalid ID provided for ${entityType}: ${id}`);
      }
      
      //console.log(`📤 Calling delete mutation for ${entityType}:`, id);
      await handlers.delete.mutateAsync(id);
      
      modals.delete.onClose();
      setSelectedEntity(null);
      //console.log(`✅ DELETE ${entityType} completed successfully`);
    } catch (error) {
      console.error(`❌ DELETE ${entityType} failed:`, error);
      window.alert(`Failed to delete ${ENTITY_CONFIGS[entityType]?.singular || entityType.slice(0, -1)}: ${error.message}`);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const entitiesData = JSON.parse(e.target.result);
        
        // Validate it's an array
        if (!Array.isArray(entitiesData)) {
          throw new Error('Import file must contain an array of entities');
        }

        //console.log(`📥 Importing ${entitiesData.length} ${entityType}...`);
        
        // Import each entity one by one
        let successCount = 0;
        let failCount = 0;
        
        for (const entityData of entitiesData) {
          try {
            const sanitizedData = sanitizeData(entityData, entityType);
            await handlers.create.mutateAsync(sanitizedData);
            successCount++;
          } catch (error) {
            console.error(`Failed to import ${entityType}:`, error);
            failCount++;
          }
        }
        
        window.alert(`Import completed!\nSuccess: ${successCount}\nFailed: ${failCount}`);
      } catch (error) {
        console.error(`Import failed:`, error);
        window.alert(`Failed to import ${entityType}: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExport = async (data) => {
    try {
      const exportData = JSON.stringify(data, null, 2);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${entityType}-export-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      //console.log(`✅ Exported ${data.length} ${entityType}`);
    } catch (error) {
      console.error(`Export failed:`, error);
      window.alert(`Failed to export ${entityType}: ${error.message}`);
    }
  };

  const filterEntities = (entities) => {
    if (!searchTerm) return entities;
    const config = ENTITY_CONFIGS[entityType];
    if (!config?.searchFields) return entities;
    
    return entities?.filter((entity) => {
      const searchString = config.searchFields
        .map(field => {
          const value = entity[field];
          return value ? String(value).toLowerCase() : '';
        })
        .join(' ')
        .toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
  };

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
    isLoading: handlers.create?.isPending || handlers.update?.isPending || handlers.delete?.isPending,
    isUpdating: handlers.update?.isPending,
    isCreating: handlers.create?.isPending,
    isDeleting: handlers.delete?.isPending,
  };
};