// CustomFireBaseUi.js - UPDATED
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import * as firebaseui from "firebaseui";
import { useColorModeValue } from "@chakra-ui/react";
import "./Auth.css";

// This file is for custom rendering of the Firebase UI components
// You can use this to fully customize the UI beyond what CSS can do

// Helper to create custom UI for Firebase Auth
export const initializeCustomUI = (auth) => {
  const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
  
  // Configure phone number input with restricted country dropdown
  ui.start("#firebaseui-auth-container", {
    signInOptions: [
      {
        provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        recaptchaParameters: {
          type: 'image', 
          size: 'invisible',
          badge: 'bottomleft'
        },
        defaultCountry: 'SA',
        // Restrict to only Saudi Arabia and Egypt
        whitelistedCountries: ['SA', 'EG']
      },
      firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    signInFlow: 'popup',
    callbacks: {
      signInSuccessWithAuthResult: () => false,
      uiShown: () => {
        // Remove loading indicator when UI is shown
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
      }
    }
  });

  // Apply custom styling to fix UI issues
  applyChakraUIStyling();
  
  return ui;
};

// Function to apply Chakra UI styling fixes to the Firebase UI
const applyChakraUIStyling = () => {
  // Use MutationObserver to detect when the Firebase UI elements are added to the DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        // Get Chakra UI colors
        const bgColor = useColorModeValue('white', 'gray.800');
        const borderColor = useColorModeValue('gray.200', 'gray.600');
        const textColor = useColorModeValue('gray.800', 'white');
        const buttonBgColor = useColorModeValue('gray.50', 'gray.700');
        const buttonHoverBgColor = useColorModeValue('gray.100', 'gray.600');

        // Remove bullet points from all list items
        const listItems = document.querySelectorAll('.firebaseui-list-item');
        listItems.forEach(item => {
          Object.assign(item.style, {
            listStyle: 'none',
            paddingLeft: '0',
            marginBottom: '1rem'
          });
        });
        
        // Fix phone number input layout
        const phoneContainer = document.querySelector('.firebaseui-phone-number');
        if (phoneContainer) {
          Object.assign(phoneContainer.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            width: '100%',
            gap: '0.5rem'
          });
        }
        
        // Improve country selector styling
        const countrySelector = document.querySelector('.firebaseui-country-selector');
        if (countrySelector) {
          Object.assign(countrySelector.style, {
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${borderColor}`,
            backgroundColor: bgColor,
            color: textColor,
            transition: 'all 0.2s'
          });
        }
        
        // Style phone input field
        const phoneInput = document.querySelector('.firebaseui-phone-input');
        if (phoneInput) {
          Object.assign(phoneInput.style, {
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${borderColor}`,
            backgroundColor: bgColor,
            color: textColor
          });
        }

        // Style buttons
        const buttons = document.querySelectorAll('.firebaseui-idp-button');
        buttons.forEach(button => {
          Object.assign(button.style, {
            backgroundColor: buttonBgColor,
            color: textColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            cursor: 'pointer'
          });

          button.addEventListener('mouseover', () => {
            button.style.backgroundColor = buttonHoverBgColor;
          });

          button.addEventListener('mouseout', () => {
            button.style.backgroundColor = buttonBgColor;
          });
        });
      }
    });
  });
  
  // Observe the container for changes
  observer.observe(document.getElementById('firebaseui-auth-container'), {
    childList: true,
    subtree: true
  });
  
  // Clean up the observer when needed
  setTimeout(() => {
    observer.disconnect();
  }, 10000); // Disconnect after 10 seconds to prevent memory leaks
};

export default { initializeCustomUI, applyChakraUIStyling };