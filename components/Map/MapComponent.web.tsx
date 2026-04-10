import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

export default function MapComponent({ locations = [], initialRegion, getMarkerColor, getMarkerEmoji }: any) {
  if (!initialRegion) {
    return (
      <View style={styles.container}>
        <View style={styles.errorMessage}>
          <p>Unable to load map</p>
        </View>
      </View>
    );
  }

  // Build map bounds from initial region
  const mapUrl = useMemo(() => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = initialRegion;
    const north = latitude + latitudeDelta / 2;
    const south = latitude - latitudeDelta / 2;
    const west = longitude - longitudeDelta / 2;
    const east = longitude + longitudeDelta / 2;
    
    return `https://www.openstreetmap.org/export/embed.html?bbox=${west},${south},${east},${north}&layer=mapnik`;
  }, [initialRegion]);

  return (
    <View style={styles.container}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 } as any}
        src={mapUrl}
        title="Emergency Map"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, height: '100%', overflow: 'hidden' },
  errorMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  }
});