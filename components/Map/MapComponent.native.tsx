import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function MapComponent({ locations, initialRegion, getMarkerColor, getMarkerEmoji }: any) {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={initialRegion}
      // --- ADD THESE THREE PROPS ---
      showsUserLocation={true}      // Shows the blue dot
      showsMyLocationButton={true}  // Adds the 'center on me' button
      followsUserLocation={true}    // Map moves as you move
    >
      {locations.map((location: any) => (
        <Marker
          key={location.id}
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
        >
          {/* THE CUSTOM ICON */}
          <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(location.type) }]}>
            <Text style={{ fontSize: 20 }}>{getMarkerEmoji(location.type)}</Text>
          </View>

          {/* THE CLICKABLE POPUP */}
          <Callout tooltip>
            <View style={styles.calloutBox}>
              <Text style={styles.calloutTitle}>{location.name}</Text>
              <Text style={styles.calloutText}>{location.distance}</Text>
              <Text style={styles.calloutLink}>Tap to see details</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  markerContainer: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#FFFFFF',
    // Added a small shadow so the icons pop more
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  calloutBox: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 12,
    width: 150,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  calloutTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 2 },
  calloutText: { fontSize: 12, color: '#666' },
  calloutLink: { fontSize: 10, color: '#007AFF', marginTop: 4, fontWeight: '600' }
});