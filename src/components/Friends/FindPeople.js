import React, { Component } from "react";
import { db } from "../common/firebase";
import { connect } from "react-redux";

import List from "@material-ui/core/List";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import NavBar from "../common/Navbar";
import AllUsers from "./AllUsers";
import Friends from "./Friends";

import "./FindPeople.scss";

class FindPeople extends Component {
    constructor(props){
        super(props)
        this.state = { 
            isLoading: true, 
            allUsers: [],
            friends: "",
            allUsersMode: true,
            friendsMode: false,
            targetUserName: "",
            targetUser: ""
        }
    }

    componentDidMount(){
        const { uid } = this.props;
        this.getAllUsers();
        this.getFriends(uid);
    }

    getAllUsers = async () => {
        const allUsers = [];
        const userSnapshot = await db.collection("users").limit(10).get();
        for (let i in userSnapshot.docs) {
            const doc = userSnapshot.docs[i]
            const allUsersData = Object.assign({}, doc.data());
            allUsersData.hostRooms = [];
            const roomSnapshot = await db.collection("rooms").where("host", "==", allUsersData.ID).get();
            roomSnapshot.forEach((room) => {
                allUsersData.hostRooms.push(room.data());
            })
            allUsers.push(allUsersData);
        }
        this.setState({
            isLoading: false,
            allUsers
        })
    }

    getFriends = async (uid) => {
        const friends = [];

        //朋友 被邀請者
        const inviteeSnapshot = await db.collection("networks").where("invitee", "==", uid).where("status", "==", "accept").get();
        
        for (let i in inviteeSnapshot.docs) {
            const doc = inviteeSnapshot.docs[i]
            const user = await db.collection("users").doc(doc.data().inviter).get();
            let friendsData = Object.assign({}, user.data());
            friendsData.hostRooms = [];
            const roomSnapshot = await db.collection("rooms").where("host", "==", friendsData.ID).get();
            roomSnapshot.forEach((room) => {
                friendsData.hostRooms.push(room.data());
            })
            friends.push(friendsData);
        }

        //朋友 邀請者
        const inviterSnapshot = await db.collection("networks").where("inviter", "==", uid).where("status", "==", "accept").get();

        for (let i in inviterSnapshot.docs) {
            const doc = inviterSnapshot.docs[i]
            const user = await db.collection("users").doc(doc.data().invitee).get();
            let friendsData = Object.assign({}, user.data());
            friendsData.hostRooms = [];
            const roomSnapshot = await db.collection("rooms").where("host", "==", friendsData.ID).get();
            roomSnapshot.forEach((room) => {
                friendsData.hostRooms.push(room.data());
            })
            friends.push(friendsData);
        }
        this.setState({
            friends
        })
    }

    changeMode = (e) => {
        const target_ID = e.target.parentElement.id;
        if(target_ID === "all-users"){
            this.setState({
                allUsersMode: true,
                friendsMode: false
            })
        }else if(target_ID === "friends"){
            this.setState({
                allUsersMode: false,
                friendsMode: true
            })
        }
    }

    handleInput = (e) => {
        if(e.key === "Enter"){
            const targetUserName = e.target.value;

            this.setState({
                targetUserName
            }, this.filterUser)
        }
    }

    handleClick = (e) => {
        const targetUserName = e.target.innerText
        
        this.setState({
            targetUserName
        }, this.filterUser)
    }

    filterUser = () => {
        const { allUsers, targetUserName } = this.state;
        const targetUser = allUsers.filter(user => {
            return (
                user.name === targetUserName
            )
        })
        if(targetUser.length === 0){
            return 
        }else{
            this.setState({
                allUsersMode:false,
                friendsMode: false,
                targetUser
            })
        }
    }

    render() { 
        const { isLoading, allUsers, friends, targetUser, allUsersMode, friendsMode } = this.state;
        const { history } = this.props;
        return ( 
            <div className="find-people-container">
                <NavBar history={ history }/>
                <div className="friends-list-wrapper">
                    <div className="btn-autocomplete-wrapper">
                        <div className="btn-wrapper">
                            <Button className="all-user-btn" id="all-users" onClick={ (e) => this.changeMode(e) }>All</Button>
                            <Button className="friends-btn" id="friends" onClick={ (e) => this.changeMode(e) }>Friends</Button>
                        </div>  
                        <div className="autocomplete">
                            <Autocomplete
                                onChange={ (e) => this.handleClick(e) }
                                options={ allUsers }
                                getOptionLabel={ option => option.name }
                                id="disable-clearable"
                                className="search-bar"
                                renderInput={params => (
                                <TextField {...params} onChange={ (e) => this.handleInput(e) } label="找朋友" margin="normal" fullWidth />
                                )}
                            />
                        </div>
                    </div>
                    <div className="list-picture-wrapper"> 
                        <div className="friends-list-container"> 
                            <List className="friends-list" dense>
                                { allUsersMode ? <AllUsers isLoading={ isLoading } allUsers={ allUsers } history={ history }/> : null }
                                { friendsMode ? <Friends friends={ friends } history={ history }/> : null }
                                { targetUser ? <AllUsers allUsers={ targetUser } history={ history }/> : null }
                            </List>
                        </div>      
                    </div>
                </div>
            </div>
        );
    }
}
 
function mapStateToProps(store){
    return {
        authenticated: store.user.authenticated,
        authenticating: store.user.authenticating,
        uid: store.user.uid
    }
}

export default connect(mapStateToProps)(FindPeople);