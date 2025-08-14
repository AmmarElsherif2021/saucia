
// ===================================================================

// 2. Revised ElementsContext.js - Better integration with prefetching

// ===================================================================

// 3. Enhanced prefetchQueries.js - Better integration with query keys

// ===================================================================

// 5. menuConstants.js - Extracted constants for better organization
import makeSaladIcon from '../../assets/menu/fruit-salad.svg';
import proteinIcon from '../../assets/menu/protein.svg';
import cheeseIcon from '../../assets/menu/cheese.svg';
import extrasIcon from '../../assets/menu/extras.svg';
import dressingsIcon from '../../assets/menu/dressings.svg';
import saladIcon from '../../assets/menu/salad.svg';
import soupIcon from '../../assets/menu/soup.svg';
import fruitIcon from '../../assets/menu/fruit.svg';
import dessertIcon from '../../assets/menu/dessert.svg';

export const sectionIcons = {
  Salads: saladIcon,
  Soups: soupIcon,
  Proteins: proteinIcon,
  Cheese: cheeseIcon,
  Extras: extrasIcon,
  Dressings: dressingsIcon,
  Fruits: fruitIcon,
  'Make Your Own Salad': makeSaladIcon,
  'Make Your Own Fruit Salad': fruitIcon,
  'Our signature salad': saladIcon,
  Juices: fruitIcon,
  Desserts: dessertIcon,
  default: makeSaladIcon,
};

export const selectiveSectionMap = {
  'make your own fruit salad': 'salad-fruits',
  'make your own salad': 'salad-items',
};

// ===================================================================

// 7. useElementsWithPrefetch.js - Custom hook for component-level prefetching
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useElements } from '../Contexts/ElementsContext';
import { smartPrefetch } from '../lib/prefetchQueries';

export const useElementsWithPrefetch = (prefetchStrategy = null) => {
  const queryClient = useQueryClient();
  const elementsData = useElements();

  const prefetchRelated = useCallback(async (strategy) => {
    if (smartPrefetch.shouldPrefetch() && strategy) {
      try {
        await elementsData.prefetchRelatedData(strategy);
      } catch (error) {
        console.error(`Prefetch failed for strategy ${strategy}:`, error);
      }
    }
  }, [elementsData]);

  useEffect(() => {
    if (prefetchStrategy) {
      prefetchRelated(prefetchStrategy);
    }
  }, [prefetchStrategy, prefetchRelated]);

  return {
    ...elementsData,
    prefetchRelated,
  };
};

// ===================================================================

// 8. Performance monitoring and optimization utilities
export const performanceUtils = {
  logQueryPerformance: (queryClient) => {
    const queries = queryClient.getQueryCache().getAll();
    queries.forEach(query => {
      const { queryKey, state } = query;
      const { dataUpdatedAt, fetchStatus, status } = state;
      if (status === 'error') {
        console.warn('Failed query:', queryKey, state.error);
      }
      if (fetchStatus === 'fetching') {
        const now = Date.now();
        const lastFetch = dataUpdatedAt || 0;
        const timeSinceLastFetch = now - lastFetch;
        if (timeSinceLastFetch < 30000) {
          console.info('Frequent refetch detected:', queryKey);
        }
      }
    });
  },

  cleanupStaleQueries: (queryClient) => {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000;
    queryClient.getQueryCache().getAll().forEach(query => {
      const lastUpdate = query.state.dataUpdatedAt || 0;
      if (now - lastUpdate > maxAge && !query.getObserversCount()) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  },

  monitorCacheSize: (queryClient) => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    let totalSize = 0;
    queries.forEach(query => {
      if (query.state.data) {
        totalSize += JSON.stringify(query.state.data).length;
      }
    });
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.info(`Query cache size: ${sizeInMB}MB across ${queries.length} queries`);
    return { sizeInMB: parseFloat(sizeInMB), queryCount: queries.length };
  },
};

// ===================================================================

// 9. Error boundary for data fetching
import React from 'react';
import { Box, Text, Button, VStack } from '@chakra-ui/react';

export class DataFetchErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Data fetch error:', error, errorInfo);
    if (window.analytics) {
      window.analytics.track('Data Fetch Error', {
        error: error.message,
        component: errorInfo.componentStack,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={6} textAlign="center">
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="bold">
              Something went wrong loading the data
            </Text>
            <Text color="gray.600"></Text>
              {this.state.error?.message || 'Unknown error occurred'}
            </Text>
            <Button 
              onClick={() => window.location.reload()}
              colorScheme="brand"
            >
              Reload Page
            </Button>
          </VStack>
        </Box>
      );
    }
    return this.props.children;
  }
}

// ===================================================================

// 10. Usage example in a component
import React from 'react';
import { useElementsWithPrefetch } from '../hooks/useElementsWithPrefetch';
import { DataFetchErrorBoundary } from '../components/DataFetchErrorBoundary';

const ExampleComponent = () => {
  const { 
    featuredMeals, 
    isLoading, 
    error, 
    prefetchRelated 
  } = useElementsWithPrefetch('featured');

  const handleMenuHover = () => {
    prefetchRelated('menu');
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) throw error;

  return (
    <DataFetchErrorBoundary>
      <div>
        <h2>Featured Meals</h2>
        {featuredMeals.map(meal => (
          <div key={meal.id}>{meal.name}</div>
        ))}
        <button onMouseEnter={handleMenuHover}></button>
          View Menu
        </button>
      </div>
    </DataFetchErrorBoundary>
  );
};
