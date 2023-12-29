import React from 'react'
import { GoogleMap, Marker, MarkerClusterer, MarkerClustererF, MarkerF, OverlayView, useJsApiLoader } from '@react-google-maps/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const containerStyle = {
    width: '400px',
    height: '400px'
};

const center = {
    // lat: -3.745,
    // lng: -38.523
    lat: -37.759859, lng: 145.128708
};

function Test() {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyAo_Xg46o9KHuxQVu4yvukI_B9hbvJoqJI"
    })

    const [isLoading, setIsLoading] = React.useState(true)
    const [map, setMap] = React.useState(null)

    let markersInfo: { id: string; name: string; avatar: string; latLng?: google.maps.LatLng }[] = [];

    const locations2 = [
        { lat: -31.56391, lng: 147.154312 },
        { lat: -33.718234, lng: 150.363181 },
        { lat: -33.727111, lng: 150.371124 },
        { lat: -33.848588, lng: 151.209834 },
        { lat: -33.851702, lng: 151.216968 },
        { lat: -34.671264, lng: 150.863657 },
        { lat: -35.304724, lng: 148.662905 },
        { lat: -36.817685, lng: 175.699196 },
        { lat: -36.828611, lng: 175.790222 },
        { lat: -37.75, lng: 145.116667 },
        { lat: -37.759859, lng: 145.128708 },
        { lat: -37.765015, lng: 145.133858 },
        { lat: -37.770104, lng: 145.143299 },
        { lat: -37.7737, lng: 145.145187 },
        { lat: -37.774785, lng: 145.137978 },
        { lat: -37.819616, lng: 144.968119 },
        { lat: -38.330766, lng: 144.695692 },
        { lat: -39.927193, lng: 175.053218 },
        { lat: -41.330162, lng: 174.865694 },
        { lat: -42.734358, lng: 147.439506 },
        { lat: -42.734358, lng: 147.501315 },
        { lat: -42.735258, lng: 147.438 },
        { lat: -43.999792, lng: 170.463352 },
    ]

    const locations: any = Array.from(Array(10000).keys()).map((val, idx) => {
        return { lat: -37.759859 + val / 10000, lng: 145.128708 + val / 10000 }
    });

    const options = {
        // imagePath:
        //     'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m', // so you must have m1.png, m2.png, m3.png, m4.png, m5.png and m6.png in that folder
    }

    function createKey(location: any) {
        return location.lat + location.lng
    }

    const onLoadCluster = React.useCallback(function callback(map) {
        console.log("onLoadCluster!")
        // This is just an example of getting and using the map instance!!! don't just blindly copy!
        // const bounds = new window.google.maps.LatLngBounds(center);
        // map.fitBounds(bounds);

        // setMap(map)
    }, [])

    const onLoad = React.useCallback(function callback(map) {
        console.log("Loaded!")
        // This is just an example of getting and using the map instance!!! don't just blindly copy!
        // const bounds = new window.google.maps.LatLngBounds(center);
        // map.fitBounds(bounds);

        // setMap(map)
    }, [])

    const onUnmount = React.useCallback(function callback(map) {
        setMap(null)
    }, [])

    return isLoaded ? (
        <>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={6}
                onLoad={onLoad}
                onUnmount={onUnmount}
            >
                { /* Child components, such as markers, info windows, etc. */}
                <>
                    <OverlayView
                        position={{ lat: -37.759859, lng: 145.128708 }}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                        <>
                            <MarkerClustererF options={options}>
                                {(clusterer) => (
                                    <>
                                        {locations.map((location: any) => (
                                            <MarkerF
                                                key={createKey(location)}
                                                position={location}
                                                clusterer={clusterer}
                                                onLoad={onLoadCluster}
                                            />
                                        ))}
                                    </>
                                )}
                            </MarkerClustererF>
                        </>
                    </OverlayView>
                </>
            </GoogleMap>
            {
                isLoading && (
                    <>
                        <FontAwesomeIcon icon={faSpinner} spin /> Loading...
                    </>
                )
            }
        </>
    ) : <></>
}

export default React.memo(Test)
