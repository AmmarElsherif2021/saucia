// hooks/useInsertAddress.js
import { useState } from 'react';
import { supabase } from '../../supabaseClient';

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
          address_line2: addressData.address_line2,
          city: addressData.city,
          is_default: addressData.is_default
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