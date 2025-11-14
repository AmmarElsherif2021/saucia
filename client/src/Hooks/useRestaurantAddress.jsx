import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

// Insert address hook
export const useInsertAddress = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const insertAddress = async (addressData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert([{
          external_id: addressData.external_id,
          label: addressData.label,
          address_line1: addressData.address_line1,
          city: addressData.city,
          is_default: addressData.is_default ?? false,
          address_line2: addressData.address_line2 ?? null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { insertAddress, isLoading, error };
};

// Add this hook to your existing file
export const useGetAddresses = (external_id = null) => {
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAddresses = async (id = null) => {
    setIsLoading(true);
    setError(null);

    try {
      //console.log('🔍 Fetching addresses with external_id:', id);
      
      let query = supabase
        .from('addresses')
        .select('*');

      // If external_id is provided, filter by it
      if (id) {
        query = query.eq('external_id', id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      //console.log('✅ Addresses fetched:', data);
      setAddresses(data || []);
      
      // Find default address
      const defaultAddr = data?.find(addr => addr.is_default) || data?.[0] || null;
      setDefaultAddress(defaultAddr);
      
      return data;
    } catch (err) {
      console.error('❌ Error fetching addresses:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch addresses on mount
  useEffect(() => {
    fetchAddresses(external_id);
  }, []);

  return { 
    addresses, 
    defaultAddress,
    isLoading, 
    error, 
    refetch: () => fetchAddresses(external_id),
    fetchAddresses 
  };
};

export const useRestaurantAddress = (external_id = null) => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAddresses = async (id = null) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('addresses')
        .select('*');

      // If external_id is provided, filter by it
      if (id) {
        query = query.eq('external_id', id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAddresses(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all addresses on mount, or fetch specific address if external_id provided
  useEffect(() => {
    fetchAddresses(external_id);
  }, [external_id]);

  const refetch = () => fetchAddresses(external_id);

  return { 
    addresses, 
    isLoading, 
    error, 
    refetch,
    fetchAddresses 
  };
};

export const useAddressByExternalId = (external_id) => {
  const { addresses, isLoading, error, refetch } = useRestaurantAddress(external_id);
  
  return {
    address: addresses[0] || null, // Since external_id is unique
    isLoading,
    error,
    refetch
  };
};

export const useDefaultAddress = (external_id = null) => {
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDefaultAddress = async (id = null) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('addresses')
        .select('*')
        .eq('is_default', true);

      // If external_id provided, also filter by it
      if (id) {
        query = query.eq('external_id', id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDefaultAddress(data[0] || null);
      return data[0] || null;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultAddress(external_id);
  }, [external_id]);

  return { 
    defaultAddress, 
    isLoading, 
    error, 
    refetch: () => fetchDefaultAddress(external_id)
  };
};