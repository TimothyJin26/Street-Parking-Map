import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import React, { useCallback } from "react";
import useSwr from "swr";
import useSupercluster from "use-supercluster";

const CENTER = { lat: -37.759857, lng: 145.128708 };

const fetcher = (...args: Parameters<typeof fetch>) =>
    fetch(...args).then((response) => response.json());

const Test: React.FC<{ apiKey: string }> = (props) => {
    const mapRef = React.useRef<google.maps.Map | undefined>();
    const [zoom, setZoom] = React.useState(9);
    const [bounds, setBounds] = React.useState<
        google.maps.LatLngBounds | undefined
    >();

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

    // const url =
    //     "https://data.police.uk/api/crimes-street/all-crime?lat=52.629729&lng=-1.131592&date=2019-10";
    // const { data, error } = useSwr(url, fetcher);
    
    const data: any = Array.from(Array(10000).keys()).map((val, idx) => {
        return {
            id: "id" + val,
            category: "Crime",
            location: { latitude: -37.759859 + val / 10000, longitude: 145.128708 + val / 10000,  }
        }
    });

    const points = React.useMemo(() => {
        const crimes = data;
        return crimes.map((crime: any) => ({
            type: "Feature",
            properties: {
                cluster: false,
                crimeId: crime.id,
                category: crime.category
            },
            geometry: {
                type: "Point",
                coordinates: [
                    parseFloat(crime.location.longitude),
                    parseFloat(crime.location.latitude)
                ]
            }
        }));
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

    if (!data) {
        return <div>Loading...</div>;
    }

    return (
        <LoadScript googleMapsApiKey={props.apiKey}>
            <div>Rendering {clusters?.length} markers now</div>
            <div style={{ width: "100%", height: "300px" }}>
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
                    {clusters.map((cluster) => {
                        const [longitude, latitude] = cluster.geometry.coordinates;
                        const { properties } = cluster;
                        if ("cluster" in properties) {
                            const { point_count: pointCount } = properties;
                            return (
                                <Marker
                                    key={`cluster-${cluster.id}`}
                                    position={{ lat: latitude, lng: longitude }}
                                    label={{ text: `${pointCount}` }}
                                />
                            );
                        } else {
                            return (
                                <Marker
                                    key={`cluster-${cluster.id}`}
                                    position={{ lat: latitude, lng: longitude }}
                                    label={{ text: `C` }}
                                />
                            );
                        }
                    })}
                </GoogleMap>
            </div>
        </LoadScript>
    );
};

export default Test;
