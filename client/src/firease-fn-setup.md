Here's a concise checklist to migrate from local Node/Express to Firebase Functions:

### 1. Initialize Firebase (if not done)

```bash
firebase login
firebase init
```

- Select **Hosting** and **Functions**
- Choose existing project
- For Hosting: Keep default `dist` directory (matches Vite build)
- For Functions: Use JavaScript/ES modules

### 2. Move Express Backend to Functions

```
saucia-app/
└── functions/
    ├── src/
    │   ├── routes/        ← Your existing routes
    │   ├── controllers/   ← Business logic
    │   ├── firebase.js    ← Simplified Admin SDK config
    │   └── index.js       ← Modified Express entry
    └── package.json
```

### 3. Update Key Files

**functions/src/index.js** (Express → Cloud Functions):

```javascript
import * as functions from 'firebase-functions'
import express from 'express'
import cors from 'cors'

const app = express()

// CORS for production
app.use(
  cors({
    origin: functions.config().allowed?.origins?.split(',') || '*',
  }),
)

// Attach routes (keep existing routes)
app.use('/api/users', userRoutes)
// ... other routes

// Export as Firebase Function
export const api = functions.https.onRequest(app)
```

**firebase.json** (Critical routing fix):

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api" // Route API calls to your function
      },
      {
        "source": "**",
        "destination": "/index.html" // React SPA fallthrough
      }
    ]
  }
}
```

### 4. Configure Functions Dependencies

**functions/package.json**:

```json
{
  "type": "module",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "firebase-functions": "^4.8.0",
    "firebase-admin": "^11.11.0"
  }
}
```

```bash
cd functions && npm install

# Set allowed origins (replace with your domains)
firebase functions:config:set allowed.origins="https://your-app.web.app,http://localhost:5173"
```

### 5. Update React API Calls

Change all API endpoints in your React app from:

```javascript
const response = await fetch('http://localhost:3000/api/users')
```

To:

```javascript
const response = await fetch('/api/users') // Relative path
```

### 6. Deployment Workflow

```bash
# 1. Build React app (creates dist/)
npm run build

# 2. Deploy everything
firebase deploy

# 3. Test live API
curl https://your-app.web.app/api/health
```

### Key Verification Points

1. **Local Testing**:

   ```bash
   firebase emulators:start
   ```

   - Test at `http://localhost:5001/PROJECT-ID/us-central1/api/api/health`

2. **CORS Validation**:

   - Ensure functions config matches your deployed domains

   ```bash
   firebase functions:config:get
   ```

3. **Admin Privileges**:
   - Remove manual service account config from `firebase.js`
   ```javascript
   // Simplified Admin initialization
   import { initializeApp } from 'firebase-admin/app'
   export const db = getFirestore(initializeApp())
   ```

This migration maintains your existing Express routes while leveraging Firebase's serverless infrastructure. API endpoints remain at `/api/*` with zero frontend routing changes required.
