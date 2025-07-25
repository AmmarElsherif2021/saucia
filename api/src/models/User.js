// Enhanced User.js model optimized for Supabase auth.users relationship
import { v4 as uuidv4 } from 'uuid';
import { supabase, supabaseAdmin } from '../supabase.js'
export class User {
  static tableName = 'user_profiles'

  static defaultValues = {
    display_name: '',
    //first_name: '',
    //last_name: '',
    phone_number: '',
    avatar_url: '',
    is_admin: false,
    loyalty_points: 0,
    notes: '',
    language: 'en',
    age: null,
    gender: null,
    email_verified: false,
    phone_verified: false,
    account_status: 'active',
    timezone: 'Asia/Riyadh'
  }

  static serialize(userData, authData = null) {
    if (!userData) {
      console.warn('Serialization called with null/undefined userData');
      return null;
    }
    if(userData.id && userData.id != undefined) {
      console.log(`Serializing user data for ID: ${userData.id}`);
    } else {
      console.warn('User data does not have a valid ID for serialization');
    }
    // Merge auth data if provided
    const email = authData?.email || userData.email || '';
    const emailVerified = authData?.email_confirmed_at ? true : (userData.email_verified || false);

    return {
      id: userData.id,
      email: email,
      displayName: userData.display_name || '',
      //firstName: userData.first_name || '',
      //lastName: userData.last_name || '',
      phoneNumber: userData.phone_number || '',
      avatarUrl: userData.avatar_url || '',
      isAdmin: Boolean(userData.is_admin),
      loyaltyPoints: Number(userData.loyalty_points) || 0,
      notes: userData.notes || '',
      language: userData.language || 'en',
      age: userData.age,
      gender: userData.gender,
      emailVerified: emailVerified,
      phoneVerified: userData.phone_verified || false,
      accountStatus: userData.account_status || 'active',
      timezone: userData.timezone || 'Asia/Riyadh',
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
      lastLogin: userData.last_login,
      // Related data
      addresses: userData.user_addresses || [],
      paymentMethods: userData.user_payment_methods || [],
      healthProfile: (userData.user_health_profiles && userData.user_health_profiles.length) 
        ? userData.user_health_profiles[0] 
        : null,
      subscriptions: userData.user_subscriptions || [],
    }
  }

  // Get user from auth and create/update profile as needed
  static async createFromAuth(uid, authUserData) {
    try {
      console.log(`Creating/updating user profile for auth UID: ${uid}`);
      
      // First, check if profile already exists
      const existingProfile = await this.getById(uid);
      if (existingProfile) {
        console.log(`Profile already exists for UID: ${uid}`);
        // Update last_login
        await this.updateLastLogin(uid);
        return this.serialize(existingProfile, authUserData);
      }

      // Create new profile from auth data
      const newUserData = {
        id: uid,
        ...this.defaultValues,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };
      //Debug console
      console.log('New user data before auth extraction:', newUserData);
      // Extract data from auth user metadata
      if (authUserData) {
        if (authUserData.user_metadata?.full_name) {
          newUserData.display_name = authUserData.user_metadata.full_name;
        } else if (authUserData.email) {
          newUserData.display_name = authUserData.email.split('@')[0];
        }

        // if (authUserData.user_metadata?.given_name) {
        //   newUserData.first_name = authUserData.user_metadata.given_name;
        // }
        // if (authUserData.user_metadata?.family_name) {
        //   newUserData.last_name = authUserData.user_metadata.family_name;
        // }
        if (authUserData.user_metadata?.avatar_url) {
          newUserData.avatar_url = authUserData.user_metadata.avatar_url;
        }
        if (authUserData.phone) {
          newUserData.phone_number = authUserData.phone;
        }

        // Set email verification status based on auth
        newUserData.email_verified = Boolean(authUserData.email_confirmed_at);
      }

      console.log('Creating new user profile with data:', {
        id: newUserData.id,
        display_name: newUserData.display_name,
        email_verified: newUserData.email_verified
      });

      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .insert(newUserData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating user profile:', error);
        throw error;
      }

      console.log('User profile created successfully:', data.id);
      return this.serialize(data, authUserData);
    } catch (error) {
      console.error('Error creating user from auth:', error);
      throw error;
    }
  }

  // Enhanced getById with auth data correlation
  static async getById(id, includeAuthData = true) {
    try {
      console.log(`Fetching user profile for ID: ${id}`);
      
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single(); // Simplify to single row
  
      if (error) {
        console.error(`Supabase error fetching user profile ${id}:`, error);
        return null;
      }
      
      if (!data) {
        console.log(`No user profile found for ID: ${id}`);
        return null;
      }
  
      return data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  }
  // Get current user with automatic profile creation/sync
  static async getCurrentUser() {
    try {
      console.log('Getting current user from auth session');
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        return null;
      }

      if (!authUser) {
        console.log('No authenticated user found');
        return null;
      }
      
      console.log(`Found authenticated user !!!!!!!!!!: ${authUser.id}`);
      
      // Get or create profile
      let userProfile = await this.getById(authUser.id, false);
      if (!userProfile) {
        console.log('User profile not found, creating from auth data...');
        return await this.createFromAuth(authUser.id, authUser);
      }
      
      // Update last login
      await this.updateLastLogin(authUser.id);
      
      return this.serialize(userProfile, authUser);
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  // Update user profile (optimized to avoid auth fields)
  static async update(id, updateData) {
    try {
      // Debug log
      console.log(`Updating user ${id} with data:`, updateData);
      
      const processedData = {
        // first_name: updateData.firstName || updateData.first_name,
        // last_name: updateData.lastName || updateData.last_name,
        phone_number: updateData.phoneNumber || updateData.phone_number,
        updated_at: new Date().toISOString()
      };
  
      // Handle profile completion
      if (updateData.profile_completed !== undefined) {
        processedData.profile_completed = updateData.profile_completed;
      }
  
      // Add date of birth if provided
      if (updateData.age || updateData.age) {
        processedData.age = updateData.age || updateData.age;
      }
  
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .update(processedData)
        .eq('id', id)
        .select()
        .single();
  
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  // Update last login timestamp
  static async updateLastLogin(id) {
    try {
      const { error } = await supabaseAdmin
        .from(this.tableName)
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error(`Error updating last login for user ${id}:`, error);
      }
    } catch (error) {
      console.error(`Error updating last login for user ${id}:`, error);
    }
  }

  // Get all users with pagination and search (admin only)
  static async getAll(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search = '', 
        includeAuthData = false,
        orderBy = 'created_at',
        orderDirection = 'desc'
      } = options;
      
      console.log('Fetching all users with options:', options);
      
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(offset, offset + limit - 1);

      // Add search functionality
      if (search) {
        query = query.or(`display_name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
      }

      const { data: users, error, count } = await query;

      if (error) {
        console.error('Error fetching all users:', error);
        throw error;
      }

      let serializedUsers = users.map(user => this.serialize(user));

      // Optionally include auth data (expensive operation)
      if (includeAuthData && users.length > 0) {
        console.log('Fetching auth data for users...');
        try {
          const authPromises = users.map(async (user) => {
            try {
              const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
              return { userId: user.id, authData: authUser?.user };
            } catch (error) {
              console.warn(`Could not fetch auth data for user ${user.id}`);
              return { userId: user.id, authData: null };
            }
          });

          const authResults = await Promise.allSettled(authPromises);
          const authDataMap = {};
          
          authResults.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
              authDataMap[result.value.userId] = result.value.authData;
            }
          });

          // Re-serialize with auth data
          serializedUsers = users.map(user => 
            this.serialize(user, authDataMap[user.id])
          );
        } catch (error) {
          console.warn('Error fetching auth data for users:', error);
        }
      }
      
      console.log(`Fetched ${users.length} users`);
      return {
        users: serializedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Ensure user profile exists (creates if missing)
  static async ensureProfile(userId, userData = {}) {
    try {
      let userProfile = await this.getById(userId, false);
      
      if (!userProfile) {
        console.log(`Creating missing profile for user: ${userId}`);
        
        // Try to get auth data to populate profile
        let authData = null;
        try {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
          authData = authUser?.user;
        } catch (error) {
          console.warn(`Could not fetch auth data for user ${userId}:`, error.message);
        }

        userProfile = await this.createFromAuth(userId, authData);
      }
      
      return this.serialize(userProfile, userProfile?.authData);
    } catch (error) {
      console.error(`Error ensuring profile for user ${userId}:`, error);
      throw error;
    }
  }

  // Sync profile with auth data
  static async syncWithAuth(userId) {
    try {
      console.log(`Syncing profile with auth data for user: ${userId}`);
      
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (authError || !authUser?.user) {
        console.error(`Could not fetch auth data for user ${userId}:`, authError);
        return null;
      }

      const profile = await this.getById(userId, false);
      if (!profile) {
        return await this.createFromAuth(userId, authUser.user);
      }

      // Update profile with auth data
      const updateData = {
        email_verified: Boolean(authUser.user.email_confirmed_at),
        updated_at: new Date().toISOString()
      };

      // Update metadata if available
      if (authUser.user.user_metadata?.avatar_url && !profile.avatar_url) {
        updateData.avatar_url = authUser.user.user_metadata.avatar_url;
      }

      if (authUser.user.phone && !profile.phone_number) {
        updateData.phone_number = authUser.user.phone;
      }

      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error(`Error syncing profile for user ${userId}:`, error);
        throw error;
      }

      return this.serialize(data, authUser.user);
    } catch (error) {
      console.error(`Error syncing user ${userId} with auth:`, error);
      throw error;
    }
  }

  // Helper method to check if user exists in auth
  static async existsInAuth(userId) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
      return !error && data?.user;
    } catch (error) {
      return false;
    }
  }

  // Delete user profile (does not delete auth user)
  static async deleteProfile(userId) {
    try {
      console.log(`Deleting user profile for: ${userId}`);
      
      const { error } = await supabaseAdmin
        .from(this.tableName)
        .delete()
        .eq('id', userId);

      if (error) {
        console.error(`Error deleting user profile ${userId}:`, error);
        throw error;
      }

      console.log(`User profile ${userId} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Error deleting user profile ${userId}:`, error);
      throw error;
    }
  }

// Google OAuth integration
static async findOrCreateFromGoogle(profile) {
  const { id: googleId, displayName, emails, photos } = profile;
  const email = emails?.[0]?.value || '';

  try {
    // 1. Check if we have a user with this Google ID
    let user = await this.getByGoogleId(googleId);
    let isNew = false;

    if (user) {
      return { user, isNew };
    }

    // 2. Check if email exists in auth system
    let authUser = null;
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1,
        filter: `email:eq:${email}`
      });

      if (!error && data.users.length > 0) {
        authUser = data.users[0];
      }
    } catch (error) {
      console.log('Error checking existing email:', error.message);
    }

    // 3. If email exists, link Google ID to existing account
    if (authUser) {
      // Ensure profile exists before updating
      let profileData = await this.getById(authUser.id);
      
      if (!profileData) {
        // Create profile if missing
        profileData = await this.createFromAuth(authUser.id, authUser);
      }

      // Update profile with Google ID
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from(this.tableName)
        .update({ google_id: googleId })
        .eq('id', authUser.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return { user: updatedProfile, isNew: false };
    }

    // 4. Create new user if no existing email
    const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: {
        full_name: displayName,
        avatar_url: photos?.[0]?.value || '',
        provider: 'google'
      }
    });

    if (authError) throw authError;

    // Create profile with auth user's ID
    const newUser = {
      id: newAuthUser.user.id,
      google_id: googleId,
      email: email,
      display_name: displayName,
      avatar_url: photos?.[0]?.value || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from(this.tableName)
      .insert(newUser)
      .select()
      .single();

    if (profileError) throw profileError;

    return { user: profileData, isNew: true };
  } catch (error) {
    console.error('Error in findOrCreateFromGoogle:', error);
    throw error;
  }
}

static async getByGoogleId(googleId) {
  try {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .select('*')
      .eq('google_id', googleId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching user by Google ID ${googleId}:`, error);
    return null;
  }
}

static defaultValues = {
  display_name: '',
  //first_name: '',
  //last_name: '',
  phone_number: '',
  avatar_url: '',
  is_admin: false,
  loyalty_points: 0,
  notes: '',
  language: 'en',
  age: null,
  gender: null,
  email_verified: false,
  phone_verified: false,
  account_status: 'active',
  timezone: 'Asia/Riyadh'
}
static async markProfileComplete(userId) {
  try {
    await supabaseAdmin
      .from(this.tableName)
      .update({ account_status: 'active' })
      .eq('id', userId);
  } catch (error) {
    console.error(`Error marking profile complete: ${error}`);
  }
}
}
//CREATE EXTENSION IF NOT EXISTS "uuid-ossp";