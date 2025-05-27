
# Salad Saucia - Healthy Food Platform  


## 🥗 Features  
### **A. Customer Experience**  
- **Interactive Homepage**  
  - Hero carousel with animated CTAs  
  - Featured items/offers sliders (Chakra UI + Framer Motion)  
  - About section + responsive footer  

- **Smart Menu System**  
  - Category-based browsing (Signature Salads/Juices/Fruits)  
  - **DIY Salad Builder**:  
    - Base ingredients (free tier) + premium add-ons  
    - Real-time price calculation  
  - Cart with promo code validation  

- **Premium Plans**  
  - Personalized meal plans based on:  
    - Dietary preferences (Keto/Vegan/Gluten-free)  
    - Allergies tracker  
    - BMI calculator (height/weight/activity level)  
  - Delivery scheduling calendar  
  - Plan management portal (pause/skip meals)  

### **B. Admin System**  
- **Dashboard with Firestore CRUD**  
  - Meals/Items inventory management  
  - Customer plans oversight  
  - Delivery scheduling (time/address mapping)  
  - Sales analytics  

### **C. Technical Stack**  
- **Frontend**: React + Chakra UI + Framer Motion  
- **Backend**: Node.js + Express  
- **Database**: Firestore (with security rules)  
- **Auth**: Firebase Authentication (Google/Phone)  
- **State**: Context API + Redux Toolkit  
- **Notifications**: Firebase Cloud Messaging (*in progress*)  

## 🚀 Installation  
```bash
git clone [AmmarElsherif2021/saucia]
cd saucia-app
npm install
npm run dev