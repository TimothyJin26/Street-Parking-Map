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
import { time } from 'console';


const CENTER = { lat: 49.24794439862854, lng: -123.18412164460982 };

const AnyReactComponent = ({ text }: any) => <div>{text}</div>;

const Home = (): ReactElement => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [position, setPosition] = useState<any>({ lat: 49.2727, lng: -123.1207 });
    const [draggedPosition, setDraggedPosition] = useState<any>(position);


    const mapRef = React.useRef<google.maps.Map | undefined>();
    const [zoom, setZoom] = React.useState(13);
    const [bounds, setBounds] = React.useState<
        google.maps.LatLngBounds | undefined
    >();

    const [data, setData] = React.useState<any>([]); // List of meters

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
        const meterList = data.map((meter: any) => {
            if (meter.Geom) {
                return {
                    type: "Feature",
                    properties: {
                        cluster: false,
                        meterID: [meter.METERID],
                        meterhead: meter.METERHEAD,
                        meter: meter,
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
            return point !== null;
        });

        const meterMap = new Map();

        for (let meter of meterList) {
            if (meterMap.has(JSON.stringify(meter.geometry))) {
                let exisitngMeter = meterMap.get(JSON.stringify(meter.geometry));
                exisitngMeter.properties.meterID = exisitngMeter.properties.meterID + ' / ' + meter.properties.meterID;
            } else {
                meterMap.set(JSON.stringify(meter.geometry), meter);
            }
        }

        return [...meterMap.values()];

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

    const getIconUrl = (meterHead: string) => {
        if (meterHead === 'Pay Station') {
            return require('./../assets/svg/location-pin-solid-station.svg').default;
        } else if (meterHead === 'Single' || meterHead === 'Twin' || meterHead === 'Twin Bay Single') {
            return require('./../assets/svg/location-pin-solid-meter.svg').default;
        } else if (meterHead.includes('Disability')) {
            return require('./../assets/svg/location-pin-solid-disabled.svg').default;
        } else if (meterHead === ('Single Motorbike')) {
            return require('./../assets/svg/location-pin-solid-motorcycle.svg').default;
        } else {
            return require('./../assets/svg/square-parking-solid.svg').default;
        }
    };

    const getRateTimeRange = (meter: any) => {
        const today: Date = new Date();
        const dayOfWeek: number = today.getDay(); // 0 = Sunday, 6 = Saturday
        const currentHour: number = today.getHours();
        console.log("DATEDATEDATE");
        console.log(currentHour);
        if (dayOfWeek >= 1 && dayOfWeek < 6 && currentHour >= 9 && currentHour < 18) {
            if(meter["R_MF_9A_6P"] === meter["R_MF_6P_10"]) {
                return <div>9am - 10pm</div>
            } else {
                 return <div>9am - 6pm</div>
            }
        } else if (dayOfWeek >= 1 && dayOfWeek < 6 && currentHour >= 18 && currentHour < 22) {
            if(meter["R_MF_9A_6P"] === meter["R_MF_6P_10"]) {
                return <div>9am - 10pm</div>
            } else {
                 return <div>6pm - 10pm</div>
            }
        } else if (dayOfWeek == 6 && currentHour >= 9 && currentHour < 18) {
            if(meter["R_SA_9A_6P"] === meter["R_SA_6P_10"]) {
                return <div>9am - 10pm</div>
            } else {
                 return <div>9am - 6pm</div>
            }
        } else if (dayOfWeek == 6 && currentHour >= 18 && currentHour < 22) {
            if(meter["R_SA_9A_6P"] === meter["R_SA_6P_10"]) {
                return <div>9am - 10pm</div>
            } else {
                 return <div>6pm - 10pm</div>
            }
        } else if (dayOfWeek == 0 && currentHour >= 9 && currentHour < 18) {
            if(meter["R_SU_9A_6P"] === meter["R_SU_9A_6P"]) {
                return <div>9am - 10pm</div>
            } else {
                 return <div>9am - 6pm</div>
            }
        } else if (dayOfWeek == 0 && currentHour >= 18 && currentHour < 22) {
            if(meter["R_SU_9A_6P"] === meter["R_SU_9A_6P"]) {
                return <div>9am - 10pm</div>
            } else {
                 return <div>6am - 10pm</div>
            }        
        } else {
            return <div>10pm - 9am</div>
        }
    }

    const formatRates = (meter: any) => {
        const today: Date = new Date();
        const dayOfWeek: number = today.getDay(); // 0 = Sunday, 6 = Saturday
        const currentHour: number = today.getHours();
        console.log("AAAAAAAAAAAAAAAAAA");
        console.log(dayOfWeek);
        console.log(currentHour);
        if (dayOfWeek >= 1 && dayOfWeek < 6 && currentHour >= 9 && currentHour < 18) {
            return <div>{meter["R_MF_9A_6P"]}</div>
        } else if (dayOfWeek >= 1 && dayOfWeek < 6 && currentHour >= 18 && currentHour < 22) {
            return <div>{meter["R_MF_6P_10"]}</div>
        } else if (dayOfWeek == 6 && currentHour >= 9 && currentHour < 18) {
            return <div>{meter["R_SA_9A_6P"]}</div>
        } else if (dayOfWeek == 6 && currentHour >= 18 && currentHour < 22) {
            return <div>{meter["R_SA_6P_10"]}</div>
        } else if (dayOfWeek == 0 && currentHour >= 9 && currentHour < 18) {
            return <div>{meter["R_SU_9A_6P"]}</div>
        } else if (dayOfWeek == 0 && currentHour >= 18 && currentHour < 22) {
            return <div>{meter["R_SU_6P_10"]}</div>
        } else {
            return <div>Free</div>
        }
    }

    const formatTimeLimit = (timeLimit: string) => {
        if(timeLimit === 'No Time Limit') {
            return "No Time Limit"
        } else {
            return timeLimit.replace(/\D/g, "");
        }
    }

    const getTimeLimit = (meter: any) => {
        const today: Date = new Date();
        const dayOfWeek: number = today.getDay(); // 0 = Sunday, 6 = Saturday
        const currentHour: number = today.getHours();
        if (dayOfWeek >= 1 && dayOfWeek < 6 && currentHour >= 9 && currentHour < 18) {
            return formatTimeLimit(meter["T_MF_9A_6P"]);
        } else if (dayOfWeek >= 1 && dayOfWeek < 6 && currentHour >= 18 && currentHour < 22) {
            return formatTimeLimit(meter["T_MF_6P_10"]);
        } else if (dayOfWeek == 6 && currentHour >= 9 && currentHour < 18) {
            return formatTimeLimit(meter["T_SA_9A_6P"]);
        } else if (dayOfWeek == 6 && currentHour >= 18 && currentHour < 22) {
            return formatTimeLimit(meter["T_SA_6P_10"]);
        } else if (dayOfWeek == 0 && currentHour >= 9 && currentHour < 18) {
            return formatTimeLimit(meter["T_SU_9A_6P"]);
        } else if (dayOfWeek == 0 && currentHour >= 18 && currentHour < 22) {
            return formatTimeLimit(meter["T_SU_6P_10"]);
        } else {
            return '-';
        }
    }

    return (
        <>
            <Navbar id='Navbar' bg="light" variant="light">
                <Navbar.Brand href="#home">
                    <img src="logo.png" width={32} />{' '}
                    {/* <FontAwesomeIcon icon={faParking} />{' '} */}
                    <span className='navbar-title'>Vancouver</span>
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
            </Container>

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
                            ],
                            streetViewControl: false,
                            fullscreenControl: false,
                            zoomControl: true,
                            mapTypeControl: true
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
                                        key={`cluster-${cluster.id}`}
                                        position={{ lat: latitude, lng: longitude }}
                                        label={{ text: `${pointCount}`, color: 'black', fontWeight: 'bold' }}
                                        icon={{
                                            path: google.maps.SymbolPath.CIRCLE,
                                            scale: 15,
                                            fillColor: "#f2f2f7",
                                            fillOpacity: 1.0,
                                            strokeWeight: 3,
                                            strokeOpacity: 1.0,
                                            strokeColor: "#1f304f",
                                        }}
                                    />
                                );
                            } else {


                                console.log(cluster);
                                return (
                                    <Marker
                                        key={`cluster-${cluster.properties.meterID}`}
                                        position={{ lat: latitude, lng: longitude }}
                                        // label={{ text: `C`, color: 'white'}}
                                        icon={{
                                            url: getIconUrl(cluster.properties.meterhead),
                                            scaledSize: new google.maps.Size(30, 30),
                                            strokeWeight: 10,
                                            strokeOpacity: 0.5,
                                            strokeColor: "#00ffee",
                                        }}
                                        onClick={() => { setClickedMeter(cluster.properties.meterID) }}
                                    >
                                        {cluster.properties.meterID === clickedMeter && (
                                            <InfoWindow onCloseClick={() => setClickedMeter("")} position={{ lat: latitude, lng: longitude }}>
                                                <Container className="info-window-container">
                                                    <Row className="info-window-id-container">
                                                        {/* <Col xs={6}>
                                                            <span className="info-window-rate">Meter ID</span>
                                                        </Col> */}
                                                        <Col xs={12}>
                                                            <span className="info-window-meter-id">{cluster.properties.meterID}</span>
                                                        </Col>
                                                    </Row>
                                                    <Row className="info-window-title-container">
                                                        <Col xs={6}>
                                                            <span className="info-window-rate">Current Rate</span>
                                                        </Col>
                                                        <Col xs={6}>
                                                            <span className="info-window-rate">Time Limit</span>
                                                        </Col>
                                                    </Row>
                                                    <Row className="info-window-content-container">
                                                        <Col xs={6}>
                                                            {/* <span className="info-window-value">$#### Hours</span> */}
                                                            <div className="info-window-value">{formatRates(cluster.properties.meter)}</div>
                                                            <div className="meter-rate-time-range">{getRateTimeRange(cluster.properties.meter)}</div>
                                                        </Col>
                                                        <Col xs={6}>
                                                            {/* <span className="info-window-value">$#### CAD</span> */}
                                                            <span className="info-window-value">{getTimeLimit(cluster.properties.meter)}</span>
                                                            {getTimeLimit(cluster.properties.meter)!=='No Time Limit' && (<span className="info-window-unit"> hrs</span>)}
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
