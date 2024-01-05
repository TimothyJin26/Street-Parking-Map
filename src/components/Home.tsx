import { faParking, faRocket, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactElement, useEffect, useState, useCallback } from "react";
import { Alert, Button } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import CustomAlert from './CustomAlert';
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import React from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import Polyline from 'google-map-react';
import "./Home.css"
import Papa from 'papaparse';
import useSupercluster from "use-supercluster";
import path from 'path';


const CENTER = { lat: 49.24794439862854, lng: -123.18412164460982 };

const AnyReactComponent = ({ text }: any) => <div>{text}</div>;

const Home = (): ReactElement => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [position, setPosition] = useState<any>({ lat: 49.2727, lng: -123.1207 });
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [draggedPosition, setDraggedPosition] = useState<any>(position);


    const mapRef = React.useRef<google.maps.Map | undefined>();
    const [zoom, setZoom] = React.useState(13);
    const [bounds, setBounds] = React.useState<
        google.maps.LatLngBounds | undefined
    >();

    const [data, setData] = React.useState<any>([]);

    const fetchData = async () => {
        try {
            const response = await fetch('/parking-meters.csv');
            const reader = response.body!.getReader();
            const result = await reader.read();
            const text = new TextDecoder().decode(result.value);
            const parsedData = Papa.parse(text, { header: true, dynamicTyping: true });
            setData(parsedData.data);
            console.log(parsedData.data);
        } catch (error) {
            console.error('Error fetching CSV file:', error);
        }
    };



    const parseGeom = (geomStr: string) => {
        const geomJSON = JSON.parse(geomStr);
        return geomJSON.coordinates;
    }

    const points = React.useMemo(() => {
        return data.map((meter: any) => {
            if (meter.Geom) {
                return {
                    type: "Feature",
                    properties: {
                        cluster: false,
                        meterID: meter.METERID,
                        meterhead: meter.METERHEAD
                    },
                    geometry: {
                        type: "Point",
                        coordinates: parseGeom(meter.Geom)
                    }
                }
            } else {
                return null;
            }
        }).filter((point: any) => {
            return point!==null;
        });

    }, [data]);

    const superclusterBounds: [number, number, number, number] = bounds
        ? [
            bounds.getSouthWest().lng(),
            bounds.getSouthWest().lat(),
            bounds.getNorthEast().lng(),
            bounds.getNorthEast().lat()
        ]
        : [0, 0, 0, 0];

    const { clusters } = useSupercluster({
        points,
        bounds: superclusterBounds,
        zoom,
        options: { maxZoom: 18 }
    });


    useEffect(() => {
        console.log("Run when component loads...");
        fetchData();
    }, []);

    const buttonClicked = async () => {
        setIsLoading(true);
        await new Promise(f => setTimeout(f, 1000));
        setIsLoading(false);
    }

    const onLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const onZoomChanged = useCallback(() => {
        const map = mapRef.current;
        if (map) {
            // @ts-ignore
            setZoom(map.getZoom());
            setBounds(map.getBounds() || undefined);
        }
    }, []);

    const onBoundsChanged = useCallback(() => {
        const map = mapRef.current;
        if (map) {
            setBounds(map.getBounds() || undefined);
        }
    }, []);



    const [clickedMeter, setClickedMeter] = useState<string>("");

    const showInfoWindow = (meterID: string) => {
        setClickedMeter(meterID);
      };


    return (
        <>
            <Navbar id='Navbar' bg="light" variant="light">
                <Navbar.Brand href="#home">
                    <img src="logo.png" width={32} />{' '}
                    {/* <FontAwesomeIcon icon={faParking} />{' '} */}
                    <span>Vancouver</span>
                </Navbar.Brand>
            </Navbar>
            <Container fluid="md" className="uploader-container">
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

            {showAlert &&
                <div className='AlertBox'>
                    <Alert variant={'primary'}>{draggedPosition.lat} {draggedPosition.lng}</Alert>
                </div>
            }

            <div id='google-map'>
                <LoadScript googleMapsApiKey={"AIzaSyAo_Xg46o9KHuxQVu4yvukI_B9hbvJoqJI"}>
                    <GoogleMap
                        onLoad={onLoad}
                        onBoundsChanged={onBoundsChanged}
                        onZoomChanged={onZoomChanged}
                        center={CENTER}
                        zoom={zoom}
                        options={{
                            styles: [
                                {
                                    featureType: "poi.business",
                                    stylers: [{ visibility: "off" }]
                                }
                            ]
                        }}
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                    >
                        {clusters.map((cluster: any) => {
                            const [longitude, latitude] = cluster.geometry.coordinates;
                            const { properties } = cluster;
                            
                            if (properties.point_count) {
                                const { point_count: pointCount } = properties;
                                return (
                                    <Marker
                                        key={`cluster-${cluster.id }`}
                                        position={{ lat: latitude, lng: longitude }}
                                        label={{ text: `${pointCount}`, color: 'black', fontWeight: 'bold'}}
                                        icon={{
                                            path: google.maps.SymbolPath.CIRCLE,
                                            scale: 15,
                                            fillColor: "#f2f2f7",
                                            fillOpacity: 1.0,
                                            strokeWeight: 3,
                                            strokeOpacity: 1.0,
                                            strokeColor:"#1f304f",
                                        }}
                                    />
                                );
                            } else {
                                

                                console.log(cluster);
                                return (
                                    <Marker
                                        key={`cluster-${cluster.properties.meterID}`}
                                        position={{ lat: latitude, lng: longitude }}
                                        label={{ text: `C`, color: 'white'}}
                                        icon={{
                                            url: require('./../assets/svg/location-pin-solid.svg').default,
                                            scaledSize: new google.maps.Size(25, 25)
                                        }}
                                        onClick={()=> {setClickedMeter(cluster.properties.meterID)}}
                                    >
                                        {cluster.properties.meterID===clickedMeter && (
                                            <InfoWindow onCloseClick={() => setClickedMeter("")} position={{ lat: latitude, lng: longitude }}>
                                                <Container className="info-window-container">
                                                    <Row className="info-window-rate-container">
                                                        <Col xs={5}>
                                                            <span className="info-window-rate">Meter ID</span>
                                                        </Col>
                                                        <Col xs={7}>
                                                            <span className="info-window-value">$#### CAD</span>
                                                        </Col> 
                                                    </Row>
                                                    <Row className="info-window-rate-container">
                                                        <Col xs={5}>
                                                            <span className="info-window-rate">Rate</span>
                                                        </Col>
                                                        <Col xs={7}>
                                                            <span className="info-window-value">$#### CAD</span>
                                                        </Col>
                                                    </Row>
                                                </Container>
                                            </InfoWindow>
                                        )}
                                    </Marker>
                                );
                            }
                        })}
                    </GoogleMap>

                </LoadScript>

            </div>
        </>
    );
}

export default Home;
