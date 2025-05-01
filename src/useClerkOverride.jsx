// useClerkOverride.js
import { useEffect } from 'react';

/**
 * Custom hook to override Clerk's default behavior and skip phone verification
 * by manipulating localStorage and sessionStorage
 */
export function useClerkOverride() {
  useEffect(() => {
    // Function to bypass phone collection step
    const bypassPhoneCollection = () => {
      try {
        // Check if we're on a Clerk related page with phone collection
        if (document.querySelector('[data-clerk-component="UserProfilePage"]') || 
            document.querySelector('[data-clerk-component="SignUp"]') ||
            document.querySelector('input[type="tel"]')) {
          
          console.log("Detected Clerk phone input, attempting to bypass...");
          
          // 1. Try to find and hide any phone input fields with CSS
          const style = document.createElement('style');
          style.textContent = `
            input[type="tel"], 
            [data-clerk-field="phone"], 
            [data-clerk-field="phoneNumber"],
            form div:has(input[type="tel"]) {
              display: none !important;
            }
            
            /* Hide any container with phone-related text */
            div:has(span:contains("phone")),
            div:has(label:contains("Phone")),
            div:has(p:contains("phone number")) {
              display: none !important;
            }
          `;
          document.head.appendChild(style);
          
          // 2. Try to find and click any "Skip" or "Continue" buttons
          const buttons = Array.from(document.querySelectorAll('button'));
          const skipButton = buttons.find(btn => 
            btn.textContent.toLowerCase().includes('skip') || 
            btn.textContent.toLowerCase().includes('continue')
          );
          
          if (skipButton) {
            console.log("Found skip button, clicking...");
            skipButton.click();
          }
        }
      } catch (err) {
        console.error("Error in phone bypass:", err);
      }
    };

    // Set up a mutation observer to detect when Clerk adds elements to DOM
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          bypassPhoneCollection();
        }
      }
    });

    // Start observing
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    // Run once on mount
    bypassPhoneCollection();

    // Clean up
    return () => {
      observer.disconnect();
    };
  }, []);
}

export default useClerkOverride;