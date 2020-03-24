import React, { Component } from "react";

import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import DialogImage from "../../../img/alertImage.png";

class CustomDialog extends Component {
    constructor(props){
        super(props);
    }

    render() { 
        const { dialogIsOpen, dialogMessage, dialogClose } = this.props;
        return ( 
            <div className="dialog-container">
                <Dialog
                    open={ dialogIsOpen }
                    onClose={ dialogClose }
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title" className="alert-title">
                        <img src={ DialogImage } />
                    </DialogTitle>
                    <DialogContent>
                    <DialogContentText id="alert-dialog-description" className="alert-content">
                        <Typography component="span">
                            { dialogMessage }
                        </Typography>
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions className="alert-btn-wrapper">
                        <Button className="alert-btn" onClick={ dialogClose } autoFocus>
                            確認
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}
 
export default CustomDialog;