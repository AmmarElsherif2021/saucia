import  { useEffect } from 'react';
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import * as firebaseui from "firebaseui";
import "./Auth.css";

export const initializeCustomUI = (auth) => {
  const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
  
  ui.start("#firebaseui-auth-container", {
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    signInFlow: 'popup',
    callbacks: {
      signInSuccessWithAuthResult: () => false
    },
    uiShown: () => {
      const listItems = document.querySelectorAll('.firebaseui-list-item');
      listItems.forEach(item => {
        item.style.listStyle = 'none';
        item.style.paddingLeft = '0';
      });
    }
  });
  
  return ui;
};

export default { initializeCustomUI }; 