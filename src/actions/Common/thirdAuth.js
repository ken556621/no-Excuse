import React, { Component } from "react";
import { db } from "./firebase";
import firebase from "./firebase";
import { connect } from "react-redux";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { updateUser } from "../../actions/user.action";

import "../../styles/common/ThirdAuth.scss";



class ThirdAuth extends Component {
    constructor(props){
        super(props);
    }


    uiConfig = {
        signInFlow: "popup",
        signInOptions: [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.FacebookAuthProvider.PROVIDER_ID
        ],
        callbacks: {
            signInSuccessWithAuthResult: () => {
                const { dispatch, history } = this.props;
                const user = firebase.auth().currentUser;
                const { uid, email, displayName, photoURL } = user;
                db.collection("users").doc(uid).set({
                    ID: uid,
                    email: email,
                    name: displayName,
                    photo: photoURL,
                    friends: []
                })
                .then(function() {
                    console.log("Document successfully written!");
                    dispatch(updateUser(uid, displayName, email, photoURL)); 
                    dispatch({ type: "LOGIN_SUCCESS" });
                    history.push("/");
                })
                .catch(function(error) {
                    console.error("Error writing document: ", error);
                });
            }
        }
    };


    render() { 
        return ( 
            <div id="firebaseui-auth-container">
                <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()}/>    
            </div>
        );
    }
}

function mapStateToProps(store){
    return {
        authenticated: store.user.authenticated,
        authenticating: store.user.authenticating
    }
}


 
export default connect(mapStateToProps)(ThirdAuth);
