import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";


// Calculate center between both markers

const MyMap = ({ markerIndex, branches }) => {
  // Use branches data if provided, otherwise fallback to default markers
  const markers = branches ? branches.map(branch => ({
    lat: branch.coordinates.lat,
    lng: branch.coordinates.lng,
    title: branch.name || `Branch ${branch.id + 1}`
  })) : [
    { lat: 40.3419741, lng: 49.8399698, title: "Branch 1 - Sederek" },
    { lat: 40.329590, lng: 49.781784, title: "Branch 2 - Bayıl" },
  ];

  // Calculate center between both markers
  const center = {
    lat: (markers[0].lat + markers[1].lat) / 2,
    lng: (markers[0].lng + markers[1].lng) / 2,
  };

  // If markerIndex is provided (not null/undefined), show single marker
  // If markerIndex is null/undefined, show all markers
  const showAllMarkers = markerIndex === null || markerIndex === undefined;
  
  const mapCenter = showAllMarkers 
    ? center 
    : { lat: markers[markerIndex].lat, lng: markers[markerIndex].lng };
  
  const mapZoom = showAllMarkers ? 13 : 14;

  return (
    <LoadScript googleMapsApiKey="AIzaSyD41sWartpep37guUs7W7ipsbijuI2nMzE">
      <div className="w-full h-full rounded-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={mapCenter}
          zoom={mapZoom}
          options={{
            mapTypeControl: true,
            fullscreenControl: true,
            zoomControl: true,
            streetViewControl: false,
          }}
        >
          {showAllMarkers ? (
            // Show all markers
            markers.map((marker, index) => (
              <Marker
                key={index}
                position={{ lat: marker.lat, lng: marker.lng }}
                title={marker.title}
              />
            ))
          ) : (
            // Show only selected marker
            <Marker
              position={{ lat: markers[markerIndex].lat, lng: markers[markerIndex].lng }}
              title={markers[markerIndex].title}
            />
          )}
        </GoogleMap>
      </div>
    </LoadScript>
  );
};

export default MyMap;
