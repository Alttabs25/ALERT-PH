import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapComponent({ locations, initialRegion, getMarkerColor, getMarkerEmoji }: any) {
  if (!initialRegion) {
    return (
      <View style={styles.errorContainer}>
        <Text>Unable to load map</Text>
      </View>
    );
  }

  try {
    return (
      <MapView
        style={styles.map}
        // CHANGED: Use 'region' instead of 'initialRegion' to allow dynamic movement
        region={initialRegion}
        moveOnMarkerPress={false}
        showsUserLocation={true} // UX: Shows the blue pulsing dot for the user
        showsMyLocationButton={false} // We are using your custom button instead
      >
        {/* USER PIN */}
        <Marker
          coordinate={{ 
            latitude: initialRegion.latitude, 
            longitude: initialRegion.longitude 
          }}
          title="My Current Location"
          description="Your current location"
        />

        {/* EMERGENCY PINS */}
        {locations && locations.map((location: any) => (
          <Marker
            key={location.id}
            coordinate={{ 
              latitude: location.latitude, 
              longitude: location.longitude 
            }}
            title={location.name}
            description={location.distance}
            pinColor={getMarkerColor ? getMarkerColor(location.type) : '#FF4444'}
          >
            {/* OPTIONAL: If you want to show the emoji on the map instead of just a pin */}
            {getMarkerEmoji && (
               <View style={styles.markerContainer}>
                 <Text style={styles.markerEmoji}>{getMarkerEmoji(location.type)}</Text>
               </View>
            )}
          </Marker>
        ))}
      </MapView>
    );
  } catch (error) {
    console.error('MapComponent Error:', error);
    return (
      <View style={styles.errorContainer}>
        <Text>Map failed to load</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  map: { 
    ...StyleSheet.absoluteFillObject 
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  },
  markerContainer: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerEmoji: {
    fontSize: 16,
  }
});