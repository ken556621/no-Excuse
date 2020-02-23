import React, { Component } from 'react';
import { Map, Marker, GoogleApiWrapper } from 'google-maps-react';
import { connect } from 'react-redux';

import InfoWindow from './infoWindow';
import MapStyle from './mapStyle';
import Load from '../common/load';



export class MapContainer extends Component {
    constructor(props){
        super(props)
        this.state = {
            showingInfoWindow: false,
            activeMarker: {},
            selectedPlace: {}
        }
    }

    myStyle = {
        width: "95%",
        height: "100%",
        margin: "0 auto"
    }


    displayMarker = (places) => {
        return (
            places.map((place) => {
                return (
                    <Marker 
                        name={ place.name } 
                        position={{ lat: place.location.latitude, lng: place.location.longitude }}
                        address={ place.address }
                        photo={ place.photo }
                        rooms={ place.rooms }
                        key={ place.id }
                        id={ place.id }
                        onClick={ this.clickMarker }
                        icon={ 
                            place.rooms.length === 0 ? 
                            {
                                url: 'https://image.flaticon.com/icons/svg/2467/2467984.svg',
                                anchor: new google.maps.Point(32,32),
                                scaledSize: new google.maps.Size(40,40)
                            } :
                            {
                                url: 'https://image.flaticon.com/icons/svg/1692/1692975.svg',
                                anchor: new google.maps.Point(32,32),
                                scaledSize: new google.maps.Size(40,40)
                            }
                        }
                    />
                )
            })
        )
    }

    clickMarker = (props, marker, e) => {
        const { showingInfoWindow } = this.state;
        if(showingInfoWindow){
            return
        }
        return (
            this.setState({
                selectedPlace: props,
                activeMarker: marker,
                showingInfoWindow: true
            })
        )
    }

    onMapClicked = () => {
        if (this.state.showingInfoWindow) {
          this.setState({
            showingInfoWindow: false,
            activeMarker: null
          })
        }
    };

    clickInfoWindow = (id) => {
        const { history } = this.props;
        history.push(`/placeInfo?${id}`);
    }

    windowHasClosed = () => {
        this.setState({
            showingInfoWindow: false
        })
    }

    render() {
      const { initialLat, initialLng, targetPlaces, mapCenterLat, mapCenterLng, searhUserMode, searchPlaceMode, searchPlaceData, defaultLat, defaultLng } = this.props;
      const { id, name, address, photo } = this.state.selectedPlace;
      const rooms = this.state.selectedPlace.rooms || [];
      return (
        <div className="map-container">
            <Map 
                google={ this.props.google } 
                onReady={ this.getPlaces }
                onClick={ this.onMapClicked }
                zoom={15} 
                styles={ MapStyle }
                style={ this.myStyle }
                initialCenter={{
                    lat: defaultLat,
                    lng: defaultLng  
                }}
                center={
                    mapCenterLat ? 
                    {
                        lat: mapCenterLat || defaultLat,
                        lng: mapCenterLng || defaultLng
                    } : 
                    {
                        lat: initialLat || defaultLat,
                        lng: initialLng || defaultLng
                    }
                }
                >
                
                <Marker 
                    name={ 'Your location' } 
                    position={{ lat: initialLat || defaultLat, lng: initialLng || defaultLng }}
                    icon={{
                        url: 'https://image.flaticon.com/icons/svg/140/140378.svg',
                        anchor: new google.maps.Point(32,32),
                        scaledSize: new google.maps.Size(30,30)
                    }}
                />

            { targetPlaces.length === 0 || !searhUserMode ? null : this.displayMarker(targetPlaces) }
            { !searchPlaceData || !searchPlaceMode ? null : this.displayMarker(searchPlaceData) }

                <InfoWindow 
                    marker={ this.state.activeMarker }
                    visible={ this.state.showingInfoWindow }
                    onClose={ this.windowHasClosed }
                    onClick={ () => this.clickInfoWindow(id, name, address, photo) }
                >
                    <div className="place-container">
                        <div className="col-left">
                            <img src={ photo } />
                        </div>
                        <div className="col-right">
                            <div className="place-name">
                                { name }
                            </div>
                            <div className="place-rooms">
                                <div className="groups">
                                    { rooms.length !== 0 ? rooms.map(room => <div className="group" key={ id }>{ room.placeName }</div>) : null }
                                </div>
                            </div>
                        </div>
                    </div>
                </InfoWindow>
            </Map>
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


 
export default connect(mapStateToProps)(GoogleApiWrapper({
    apiKey: ("AIzaSyAOCD6zBK2oD6Lrz3gN5zNxM-GNDatpE-o")
})(MapContainer))