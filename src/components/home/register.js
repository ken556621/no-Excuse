import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import firebase from '../common/firebase';
import { updateUser } from '../../actions/user.action';

import PersonIcon from '@material-ui/icons/Person';
import EmailIcon from '@material-ui/icons/Email';
import LockIcon from '@material-ui/icons/Lock';

import Basketball from '../common/basketballImg';
import Load from '../common/load';
import '../../styles/register.scss';



class Register extends Component {
    constructor(props){
        super(props)
        this.state = {
            userName: '',
            userEmail: '',
            userPhoto: 'https://image.flaticon.com/icons/svg/23/23072.svg',
            password: '',
            nameValid: false,
            emailValid: false,
            passwordValid: false,
            errorMessage: ''
        }
    }

    componentDidUpdate(){
        const { history, authenticated, authenticating } = this.props;
        if(!authenticating){
            if(authenticated){
                history.push('/')
            }
        }
    }

    handleChange = (event, type) => {
        if(type === 'name'){
            this.setState({
                userName: event.target.value
            })
        }else if(type === 'email'){
            this.setState({
                userEmail: event.target.value
            })
        }else if(type === 'password'){
            this.setState({
                password: event.target.value
            })
        }
    }


    handleSubmit = () => {
        const { userName, userEmail, userPhoto } = this.state;
        const { dispatch, history } = this.props;
        const db = firebase.firestore();
        const email = this.state.userEmail;
        const password = this.state.password;
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode == 'auth/weak-password') {
                this.setState({
                    passwordValid: true,
                    errorMessage: 'Your email is valid.'
                }) 
            }
            if (errorCode == 'auth/email-already-in-use') {
                console.log(error)
                this.setState({
                    emailValid: true,
                    errorMessage: 'already used email.'
                })
            }
            if (errorCode == 'auth/invalid-email') {
                this.setState({
                    emailValid: true,
                    errorMessage: 'email address is invalid.'
                })
            }
            if (errorCode == 'auth/operation-not-allowed') {
                this.setState({
                    emailValid: true,
                    passwordValid: true,
                    errorMessage: ' email/password accounts are not enabled. Enable email/password accounts in the Firebase Console, under the Auth tab.'
                })
            }
        }).then(res => {
            if(!res){ 
                return
            }
            db.collection("users").doc(res.user.uid).set({
                ID: res.user.uid,
                email: this.state.userEmail,
                name: this.state.userName,
                photo: "https://image.flaticon.com/icons/svg/23/23072.svg"
            })
            .then(() => {
                const uid = res.user.uid;
                console.log("Document successfully written!");
                dispatch(updateUser(uid, userName, userEmail, userPhoto));
                dispatch({ type: 'LOGIN_SUCCESS' });
                history.push('/'); 
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
        })
    }

    render() { 
        const { authenticated, authenticating } = this.props;
        if(authenticating){
            if(!authenticated){
                <Load />
            }
        }
        return ( 
            <div className="register-container">
                <div className="register-form">
                    <Basketball />
                    <div className="name-field form-control">
                        <PersonIcon style={{ fontSize: 30 }} className="name-icon" />
                        <div className="name input-wrapper">
                            <input type="text" placeholder="your name" name="name" onChange={ (event) => { this.handleChange(event, 'name') }}></input>
                            <div className={ this.state.nameValid ? "warning" : "hide" }>
                                { this.state.errorMessage }
                            </div>
                        </div>
                    </div>
                    <div className="email-field form-control">
                        <EmailIcon style={{ fontSize: 30 }} className="email-icon" />
                        <div className="email input-wrapper">
                            <input type="email" name='userEmail' placeholder="user-email" onChange={ (event) => { this.handleChange(event, 'email') }}  />
                            <div className={ this.state.emailValid ? "warning" : "hide" }>
                                { this.state.errorMessage }
                            </div>
                        </div>
                    </div>
                    <div className="password-field form-control">
                        <LockIcon style={{ fontSize: 30 }} className="password-icon" />
                        <div className="password input-wrapper">
                            <input type="password" name='password' placeholder="password" onChange={ (event) => { this.handleChange(event, 'password') }} />
                            <div className={ this.state.passwordValid ? "warning" : "hide" }>
                                { this.state.errorMessage }
                            </div>
                        </div>
                    </div>
                    <div className="btn-wrapper">
                        <button onClick={ this.handleSubmit }>Submit</button>
                        <Link to='/login'>
                            <button>
                                Login
                            </button>
                        </Link>
                        <Link to='/'>
                            <button>
                                Home
                            </button>
                        </Link>
                    </div>
                </div>
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


 
export default connect(mapStateToProps)(Register);
 