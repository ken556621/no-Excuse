import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBAL9WEiKUu9fO-W9-vHtLipqoJ_7pARDY",
    authDomain: "no-excuse-1579439547243.firebaseapp.com",
    databaseURL: "https://no-excuse-1579439547243.firebaseio.com",
    projectId: "no-excuse-1579439547243",
    storageBucket: "no-excuse-1579439547243.appspot.com",
    messagingSenderId: "247254955127",
    appId: "1:247254955127:web:c884850b75dc83d3cf8272",
    measurementId: "G-G4GGLVNS9Y"
};

firebase.initializeApp(firebaseConfig);


export const db = firebase.firestore();
export default firebase;