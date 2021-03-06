import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { db } from "../common/firebase";
import firebase from "../common/firebase";

import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import ListSubheader from "@material-ui/core/ListSubheader";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Divider from "@material-ui/core/Divider";
import PersonIcon from "@material-ui/icons/Person";
import EmailIcon from "@material-ui/icons/Email";
import WhatshotIcon from "@material-ui/icons/Whatshot";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import CreateIcon from "@material-ui/icons/Create";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";

import NavBar from "../common/Navbar";
import Friends from "./Friends";
import Groups from "./Groups";
import CustomDialog from "../common/CustomDialog";
import Load from "../common/Load";
import "./Member.scss";

class Member extends Component {
    constructor(props){
        super(props)
        this.state = {
            isLoading: true,
            isUser: false,
            isFriend: false,
            isPending: false,
            isModify: false,
            userPhoto: "",
            userName: "",
            userEmail: "",
            userQuate: "",
            pendingFriendQty: "",
            dialogIsOpen: false,
            dialogMessage: ""
        }
    } 

    componentDidMount(){
        const { uid, history } = this.props;
        const person_ID = this.props.location.search.slice(1);
        if(!uid){
            history.push("/");
            return
        }
        if(person_ID){
            if(person_ID === uid){
                this.setState({
                    isUser: true
                })
                this.fetchMemberData(uid);
            }

            //Is friend
            db.collection("networks").where("inviter", "==", uid).where("invitee", "==", person_ID).where("status", "==", "accept")
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    this.setState({
                        isFriend: true
                    })
                });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });

            db.collection("networks").where("inviter", "==", person_ID).where("invitee", "==", uid).where("status", "==", "accept")
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    this.setState({
                        isFriend: true
                    })
                });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });

            //Is pending
            db.collection("networks").where("inviter", "==", uid).where("invitee", "==", person_ID).where("status", "==", "pending")
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    this.setState({
                        isPending: true
                    })
                });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });

            db.collection("networks").where("inviter", "==", person_ID).where("invitee", "==", uid).where("status", "==", "pending")
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    this.setState({
                        isPending: true
                    })
                });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });

            this.fetchMemberData(person_ID);
        }else{
            this.setState({
                isUser: true
            })
            this.fetchMemberData(uid);
        }   
    }

    fetchMemberData = async (uid) => {
        const pendingFriend = [];

        //用戶基本資訊
        const user = await db.collection("users").doc(uid).get();
        if (user.exists) {
            if(user.data().quate){
                this.setState({
                    userQuate: user.data().quate
                })
            }
            this.setState({
                userPhoto: user.data().photo,
                userName: user.data().name,
                userEmail: user.data().email
            })
        }else{
            console.log("No such document!");
        }

        //待確認好友數
        const pendingSnapshot = await db.collection("networks").where("invitee", "==", uid).where("status", "==", "pending").get();
        for (let i in pendingSnapshot.docs) {
            const doc = pendingSnapshot.docs[i]
            pendingFriend.push(doc.data());
        }
        this.setState({
            isLoading: false,
            pendingFriendQty: pendingFriend.length
        })
    }

    modify = () => {
        this.setState({
            isModify: !this.state.isModify
        })
    }

    handleInput = (e) => {
        const targetElement = e.target.parentElement.parentElement;
        if(targetElement.matches(".edit-name")){
            this.setState({
                userName: e.target.value
            }, this.storeModifiedData)
        }else if(targetElement.matches(".edit-quate")){
            this.setState({
                userQuate: e.target.value
            }, this.storeModifiedData)
        }
    }

    storeModifiedData = async () => {
        const { userName, userQuate } = this.state;
        const { uid } = this.props;
        await db.collection("users").doc(uid).update({
            name: userName,
            quate: userQuate
        });
    }

    addFriend = () => {
        const { uid } = this.props;
        const person_ID = this.props.location.search.slice(1);

        db.collection("networks").doc().set({
            inviter: uid,
            invitee: person_ID,
            status: "pending"
        }).then(() => {
            this.setState({
                isPending: true,
                dialogIsOpen: true,
                dialogMessage: "等待對方確認邀請！"
            })
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    }

    removeFriend = async () => {
        const { uid } = this.props;
        const person_ID = this.props.location.search.slice(1);
        //朋友 被邀請者
        const inviteeSnapshot = await db.collection("networks").where("invitee", "==", uid).where("inviter", "==", person_ID).where("status", "==", "accept").get();
        
        for (let i in inviteeSnapshot.docs) {
            const doc = inviteeSnapshot.docs[i]
            await db.collection("networks").doc(doc.id).update({
                status: "remove"
            });
            
        }

        //朋友 邀請者
        const inviterSnapshot = await db.collection("networks").where("inviter", "==", uid).where("invitee", "==", person_ID).where("status", "==", "accept").get();
        
        for (let i in inviterSnapshot.docs) {
            const doc = inviterSnapshot.docs[i]
            await db.collection("networks").doc(doc.id).update({
                status: "remove"
            });
        }
        this.setState({
            isFriend: false,
            isPending: false,
            dialogIsOpen: true,
            dialogMessage: "成功刪除此好友！"
        })
    }

    uploadImg = async (e) => { 
        const { uid } = this.props;
        const file = e.target.files[0];
        const storageRef = firebase.storage().ref().child(uid + file.name);
        if(file.size > 1024 * 1024){
            window.alert("上傳圖片過大")
            return 
        }
        await storageRef.put(file);

        const url = await storageRef.getDownloadURL();

        await db.collection("users").doc(uid).update({
            photo: url
        })
        this.setState({
            userPhoto: url
        })
    }

    dialogClose = () => {
        this.setState({
            dialogIsOpen: false
        })
    }

    render() { 
        const { isLoading, isUser, isFriend, isPending, isModify, userPhoto, userName, userEmail, userQuate, pendingFriendQty, dialogIsOpen, dialogMessage } = this.state;
        const { history } = this.props;
        if(isLoading){
            return <Load />
        }
        return ( 
            <div className="member-container">
                <NavBar history={ history }/>
                <CustomDialog dialogIsOpen={ dialogIsOpen } dialogMessage={ dialogMessage } dialogClose={ this.dialogClose } />
                <div className="user-info">
                    <div className="modify-btn-wrapper">
                        <div className="fake">
                        </div>
                        { 
                            isUser ? 
                            <IconButton onClick={ this.modify } onKeyDown={ (e) => this.keypressModify(e) }>
                                <CreateIcon className="modify-btn"/>
                            </IconButton> : 
                            null
                        }
                    </div>
                    <Avatar className="user-img" alt="Oh no!" src={ userPhoto } />
                    <div className="upload-img-btn-wrapper">
                        { isModify ?
                            <Fragment>
                                <input
                                    accept="image/*"
                                    className="upload-img-input"
                                    id="text-button-file"
                                    multiple
                                    type="file"
                                    onChange={ this.uploadImg }
                                />
                                <label className="upload-img-btn" htmlFor="text-button-file">
                                    <Button
                                        component="span"
                                        color="default"
                                        size="small"
                                    >
                                        <CloudUploadIcon className="upload-img-btn-icon"/>
                                    </Button>
                                </label>
                            </Fragment> : 
                            null
                        }
                    </div>
                    <List className="list-container"
                        aria-labelledby="nested-list-subheader" subheader={
                        <ListSubheader className="subheader-wrapper" component="div" id="nested-list-subheader">
                            <Typography>
                                Personal Information
                            </Typography>
                            { 
                                !isFriend && !isUser && !isPending ?  
                                <Button className="add-friend-btn" size="small" onClick={ this.addFriend }>
                                    加朋友
                                </Button> : 
                                null
                            } 
                            { 
                                isPending ?  
                                <Button className="pending-friend-btn" size="small" onClick={ this.addFriend } disabled>
                                    等待接受中
                                </Button> : 
                                null
                            } 
                        </ListSubheader>
                        }
                    >
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <PersonIcon color="action" />
                                </Avatar>
                            </ListItemAvatar>
                            { 
                                isModify ? 
                                <TextField className="edit-name" value={ userName } label="Your Name" margin="normal" size="small" onChange={ (e) => this.handleInput(e) } variant="outlined">
                                </TextField> :
                                <ListItemText primary={ userName ? userName : "You don't have a name right now" } />
                            }
                        </ListItem>
                        <Divider variant="inset" component="li" className="line" />
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <EmailIcon color="action" />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={ userEmail } />
                        </ListItem>
                        <Divider variant="inset" component="li" className="line" />
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <WhatshotIcon color="action" />
                                </Avatar>
                            </ListItemAvatar>
                            { 
                                isModify ? 
                                <TextField className="edit-quate" value={ userQuate } label="Your quate" margin="normal" size="small" onChange={ (e) => this.handleInput(e) } variant="outlined">
                                </TextField> :
                                <ListItemText primary={ userQuate } />
                            }
                        </ListItem>
                        <Divider variant="inset" component="li" className="line" />
                        {
                            isUser ?
                            <div>
                                <Friends pendingFriendQty={ pendingFriendQty } />
                                <Groups />
                            </div> :
                            null
                        }
                        { 
                            isFriend && !isUser ?  
                            <Button className="remove-friend-btn" onClick={ this.removeFriend } variant="contained" size="small">
                                刪除好友
                            </Button> : 
                            null
                        }        
                    </List>
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

export default connect(mapStateToProps)(Member);