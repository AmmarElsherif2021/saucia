import React, { useEffect } from "react";
import firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { auth } from "../../../firebase";

const Auth = () => {
  useEffect(() => {
    const ui = new firebaseui.auth.AuthUI(auth);
    ui.start("#firebaseui-auth-container", {
      signInOptions: [
        firebaseui.auth.EmailAuthProvider.PROVIDER_ID,
        firebaseui.auth.GoogleAuthProvider.PROVIDER_ID
      ],
      signInFlow: "popup",
      callbacks: {
        signInSuccessWithAuthResult: () => false
      }
    });
  }, []);

  return <div id="firebaseui-auth-container"></div>;
};

export default Auth;