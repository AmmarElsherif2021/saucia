import { auth, setAdminClaim } from '../firebase.js';

const targetUID = '8ArLPI3YULMkZ1wW1l8Esbre3792';

async function makeFirstAdmin() {
  try {
    await setAdminClaim(targetUID);
    console.log(`Successfully made ${targetUID} an admin`);
    process.exit(0);
  } catch (error) {
    console.error('Error making admin:', error);
    process.exit(1);
  }
}

makeFirstAdmin();