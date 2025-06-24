// utils/makeUidAdmin.js - Utility to make a user admin
import { setAdminClaim } from '../supabase.js'

// Replace with the actual user ID you want to make admin
const targetUID = '8ArLPI3YULMkZ1wW1l8Esbre3792'

async function makeFirstAdmin() {
  try {
    console.log(`Attempting to make user ${targetUID} an admin...`)
    
    const result = await setAdminClaim(targetUID, true)
    
    console.log('✅ Success! User is now an admin:', {
      id: result.id,
      is_admin: result.is_admin,
      updated_at: result.updated_at
    })
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error making user admin:', error.message)
    
    // Provide helpful error messages
    if (error.message.includes('User not found')) {
      console.error('Make sure the user ID exists in your Supabase auth.users table')
      console.error('You can find user IDs in the Supabase dashboard under Authentication > Users')
    }
    
    process.exit(1)
  }
}

// Additional utility function to remove admin status
async function removeAdmin(userId) {
  try {
    console.log(`Removing admin status from user ${userId}...`)
    
    const result = await setAdminClaim(userId, false)
    
    console.log('✅ Admin status removed:', {
      id: result.id,
      is_admin: result.is_admin,
      updated_at: result.updated_at
    })
    
    return result
  } catch (error) {
    console.error('❌ Error removing admin status:', error.message)
    throw error
  }
}

// Check command line arguments
const args = process.argv.slice(2)
const command = args[0]
const userId = args[1] || targetUID

switch (command) {
  case 'make-admin':
    makeFirstAdmin()
    break
  case 'remove-admin':
    removeAdmin(userId).then(() => process.exit(0)).catch(() => process.exit(1))
    break
  case 'help':
    console.log(`
Usage:
  node utils/makeUidAdmin.js make-admin [userId]     - Make user an admin
  node utils/makeUidAdmin.js remove-admin [userId]   - Remove admin status
  node utils/makeUidAdmin.js help                    - Show this help
  
Examples:
  node utils/makeUidAdmin.js make-admin
  node utils/makeUidAdmin.js remove-admin 123e4567-e89b-12d3-a456-426614174000
    `)
    process.exit(0)
    break
  default:
    // Default behavior - make admin
    makeFirstAdmin()
    break
}