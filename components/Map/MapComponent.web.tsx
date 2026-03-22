import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function MapComponent() {
  return (
    <View style={styles.container}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        // Coordinates set to Manila (14.59, 120.98) based on your original code
        src="https://www.openstreetmap.org/export/embed.html?bbox=120.9,14.5,121.1,14.7&layer=mapnik"
      ></iframe>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, height: '100%', overflow: 'hidden' },
});