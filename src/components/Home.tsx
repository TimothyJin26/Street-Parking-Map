import { faParking, faRocket, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactElement, useEffect, useState } from "react";
import { Alert, Button } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import CustomAlert from './CustomAlert';
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import React from 'react';
import GoogleMapReact from 'google-map-react';
import Polyline from 'google-map-react';
import "./Home.css"

const AnyReactComponent = ({ text }: any) => <div>{text}</div>;

const Home = (): ReactElement => {


    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [position, setPosition] = useState<any>({ lat: 49.2727, lng: -123.1207 });

    useEffect(() => {
        console.log("Run when component loads...");
    }, []);

    const buttonClicked = async () => {
        setIsLoading(true);
        await new Promise(f => setTimeout(f, 1000));
        setIsLoading(false);
    }

    const defaultProps = {
        center: {
            lat: 49.24794439862854,
            lng: -123.18412164460982
        },
        zoom: 14
    };

    const apiIsLoaded = (map: any, maps: any) => {
        navigator?.geolocation.getCurrentPosition(
            ({ coords: { latitude: lat, longitude: lng } }) => {
                const pos = { lat, lng };
                setPosition(pos);
            })

            const flightPlanCoordinates = [
                { lat: 37.772, lng: -122.214 },
                { lat: 21.291, lng: -157.821 },
                { lat: -18.142, lng: 178.431 },
                { lat: -27.467, lng: 153.027 },
              ];
              const flightPath = new google.maps.Polyline({
                path: flightPlanCoordinates,
                geodesic: true,
                strokeColor: "#8FD1FD",
                strokeOpacity: 1.0,
                strokeWeight: 2,
                draggable: true,
              });

              flightPath.setMap(map);
            
    }





    return (
        <>
            <Navbar bg="light" variant="light">
                <Navbar.Brand href="#home">
                    <img src="logo.png" style={{ width: 40, marginTop: -7 }} />{' '}
                    <FontAwesomeIcon icon={faParking} />
                    arking Vancouver
                </Navbar.Brand>
            </Navbar>

            <Container fluid="md" className="uploader-container">
                <Row>
                    <Col>
                        <h3><FontAwesomeIcon className="mr-1" icon={faRocket} />{' '}lcome</h3>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button onClick={() => buttonClicked()}>Click me</Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {
                            isLoading && (
                                <h3><FontAwesomeIcon className="mr-1" icon={faSpinner} spin />{' '} Loading...</h3>
                            )
                        }
                    </Col>
                </Row>
                {/* Map goes here */}
            </Container>

            <div id='google-map'>

                <GoogleMapReact
                    bootstrapURLKeys={{ key: "AIzaSyDCR59rsWNTZHIDLpzaYV_dBZ0bivSzz9g" }}
                    defaultCenter={defaultProps.center}
                    defaultZoom={defaultProps.zoom}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={({ map, maps }) => apiIsLoaded(map, maps)}
                    center={position}
                >


                    <AnyReactComponent
                        lat={59.955413}
                        lng={30.337844}
                        text="My Marker"
                    />
                </GoogleMapReact>
            </div>
        </>
    );
}

export default Home;
