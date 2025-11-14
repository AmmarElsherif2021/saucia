// Add this to your component to debug the current user
import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export const useDebugUser = () => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          return;
        }

        if (!session) {
          //console.log('No active session');
          return;
        }

        //console.log('Current user ID:', session.user.id);

        // Check user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          return;
        }

        //console.log('User profile:', profile);
        setUserInfo({ session: session.user, profile });

      } catch (error) {
        console.error('Debug error:', error);
      }
    };

    checkUser();
  }, []);

  return userInfo;
};

