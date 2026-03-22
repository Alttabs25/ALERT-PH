import MapComponent from '@/components/Map';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

const emergencyLocations = [
  { id: '1', name: 'Nearest Hospital', latitude: 14.5995, longitude: 120.9842, type: 'hospital', distance: '2.5 km away' },
  { id: '2', name: 'Police Station', latitude: 14.6091, longitude: 121.0159, type: 'police', distance: '1.8 km away' },
  { id: '3', name: 'Fire Department', latitude: 14.5789, longitude: 120.9754, type: 'fire', distance: '3.2 km away' },
];

const getMarkerEmoji = (type: string) => {
  const emojis: any = { hospital: '🏥', police: '🚓', fire: '🚒' };
  return emojis[type] || '📍';
};

const getMarkerColor = (type: string) => {
  const colors: any = { hospital: '#FF4444', police: '#4444FF', fire: '#FF8800' };
  return colors[type] || '#666';
};

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const initialRegion = { latitude: 14.5995, longitude: 120.9842, latitudeDelta: 0.1, longitudeDelta: 0.1 };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Find Help Nearby</Text>
        
        <View style={styles.mapWrapper}>
          <MapComponent locations={emergencyLocations} initialRegion={initialRegion} getMarkerColor={getMarkerColor} getMarkerEmoji={getMarkerEmoji} />
        </View>

        <View style={[styles.infoSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Nearby Services</Text>
          <View>
            {emergencyLocations.map((location, index) => (
              <View key={location.id} style={[styles.serviceItem, index !== emergencyLocations.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <Text style={styles.serviceIcon}>{getMarkerEmoji(location.type)}</Text>
                <View style={styles.serviceDetails}>
                  <Text style={[styles.serviceName, { color: colors.text }]}>{location.name}</Text>
                  <Text style={[styles.serviceDistance, { color: colors.icon }]}>{location.distance}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1, paddingHorizontal: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', marginTop: 10, marginBottom: 20 },
  mapWrapper: { height: 300, borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  infoSection: { borderRadius: 24, padding: 20, borderWidth: 1, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  infoTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  serviceIcon: { fontSize: 24, marginRight: 16 },
  serviceDetails: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: '600' },
  serviceDistance: { fontSize: 13, marginTop: 2 },
});