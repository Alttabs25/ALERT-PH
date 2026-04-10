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
        initialRegion={initialRegion}
        moveOnMarkerPress={false}
      >
        {/* USER PIN (Standard Red Pin) */}
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
          />
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
  }
});