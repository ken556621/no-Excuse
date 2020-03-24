import React, { Component } from "react";
import { connect } from "react-redux";

import Loading from "./Load";

export default function(ComposedClass){
    class Auth extends Component {
        constructor(props) {
              super(props);
        }
  
        componentDidMount(){
            const { authenticated, authenticating, history } = this.props;
            if(!authenticating){
                if(authenticated){
                    console.log("Login")
                }else{
                    history.push("/login")
                }
            }else{
                if(!authenticated){
                    history.push("/login")
                }
            }
        }
  
        render() {
            const { authenticated, authenticating } = this.props;

            if(authenticating) {
                return <Loading />
            } else {
                if(authenticated) {
                    return <ComposedClass {...this.props}/>
                } else {
                    return <div></div>
                }
 
            }
        }
    }
  
    function mapStateToProps(store) {
        return {
            offline: store.offline,
            authenticating: store.user.authenticating,
            authenticated: store.user.authenticated
        };
    }

    return connect(mapStateToProps)(Auth);
}