import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { db } from "./firebase";
import firebase from "./firebase";

import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import Badge from "@material-ui/core/Badge";
import Logo from "../../../img/logo.png";

import "../../styles/common/Navbar.scss";

class NavBar extends Component {
    constructor(props){
        super(props);
        this.state = {
            fullRoomQty: 0,
            friendRequestQty: 0,
            navBarFixed: false
        } 
    }

    async componentDidMount(){
        const { uid } = this.props;
        let fullRoomQty = 0;
        let friendRequestQty = 0;

        if(!uid){
            return
        }
        //顯示已滿團的數字
        const participantsSnapshot = await db.collection("rooms").where("participants", "array-contains", uid).get();
        for (let i in participantsSnapshot.docs) {
            const doc = participantsSnapshot.docs[i]
            const roomsData = Object.assign({}, doc.data());
            if(roomsData.peopleNeed - roomsData.participants.length === 0){
                fullRoomQty++
            }
        }

        //開的房間
        const hostSnapshot = await db.collection("rooms").where("host", "==", uid).get();
        for (let i in hostSnapshot.docs) {
            const doc = hostSnapshot.docs[i]
            const roomsData = Object.assign({}, doc.data());
            if(roomsData.peopleNeed - roomsData.participants.length === 0){
                fullRoomQty++
            }
        }
        //通知多少人加好友
        const friendsSnapshot = await db.collection("networks").where("invitee", "==", uid).where("status", "==", "pending").get();
        for (let i in friendsSnapshot.docs) {
            friendRequestQty++
        }
        this.setState({
            fullRoomQty,
            friendRequestQty
        })
    }

    logout = () => {
        const { dispatch, history } = this.props;
        firebase.auth().signOut()
        .then(() => {
            dispatch({ type: "LOGOUT" });
            history.push("/login");
        })
        .catch((error) => {
            console.log(error)
        });
    }


    render() {
        const { fullRoomQty, friendRequestQty } = this.state;
        return ( 
            <nav>
                <Button className="logo">
                    <Link to="/">
                        <img src={ Logo }></img>
                    </Link>
                </Button>
                <div className="btn-wrapper">
                    <Button className="groups-wrapper">
                        <Link to="/myGroups">
                            <Badge className="group-notification" color="error"  badgeContent={ fullRoomQty !== 0 ? fullRoomQty : null }>
                                <Typography className="groups-words words">
                                    我的團
                                </Typography>
                            </Badge>
                        </Link>
                    </Button>
                    <Button className="find-groups-wrapper">
                        <Link to="/place">
                            <Typography className="find-groups-words words">
                                找團
                            </Typography>
                        </Link>
                    </Button>
                    <Button className="friends-wrapper">
                        <Link to="/friends">
                            <Typography className="friends-words words">
                                團友
                            </Typography>
                        </Link>
                    </Button>
                    <Button className={ this.props.authenticated ? "member-wrapper show" : "hide" }>
                        <Link to={{
                            pathname: "/member",
                            key: `123`
                        }}>
                            <div className="member-btn">
                                <AccountCircleIcon className="member-icon"/>
                                <Badge className="friend-notification" color="error"  badgeContent={ friendRequestQty !== 0 ? friendRequestQty : null }>
                                    <Typography className="member-words">
                                        會員
                                    </Typography>
                                </Badge>
                            </div>
                        </Link>
                    </Button>
                    <Button className={ this.props.authenticated ? "hide" : "login-logout-wrapper show" }>
                        <Link to="/login">
                            <div className= "login-btn">
                                <ExitToAppIcon className="login-icon" />
                                <Typography className="login">
                                    登入
                                </Typography>
                            </div>
                        </Link>
                    </Button>
                    <Button className={ this.props.authenticated ? "login-logout-wrapper" : "hide" }>
                        <Link to="/login">
                            <div className="logout-btn" onClick={ this.logout }>
                                <ExitToAppIcon className="logout-icon" />
                                <Typography className="logout">
                                    登出
                                </Typography>
                            </div>
                        </Link>
                    </Button>
                </div>
            </nav>
        );
    }
}


function mapStateToProps(store) {
    return {
        authenticated: store.user.authenticated,
        authenticating: store.user.authenticating,
        uid: store.user.uid
    };
}


 
export default connect(mapStateToProps)(NavBar);

