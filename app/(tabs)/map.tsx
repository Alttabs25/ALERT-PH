import MapComponent from '@/components/Map';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

// 1. Helper function for Real Distance calculation
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance.toFixed(2); // Returns distance in km with 2 decimal places
};

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(currentLocation.coords);
      setLoading(false);
    })();
  }, []);

  const userLat = location?.latitude || 14.5995;
  const userLon = location?.longitude || 120.9842;

  // 2. Dynamic locations with REAL calculated distances
  const emergencyLocations = [
    { 
      id: '1', name: 'Nearest Hospital', type: 'hospital',
      latitude: userLat + 0.005, longitude: userLon + 0.005, 
    },
    { 
      id: '2', name: 'Police Station', type: 'police',
      latitude: userLat - 0.003, longitude: userLon + 0.002,
    },
    { 
      id: '3', name: 'Fire Department', type: 'fire',
      latitude: userLat + 0.002, longitude: userLon - 0.004,
    },
  ].map(place => ({
    ...place,
    // Calculate distance from user to this specific point
    distance: `${calculateDistance(userLat, userLon, place.latitude, place.longitude)} km away`
  }));

  const getMarkerEmoji = (type: string) => {
    const emojis: any = { hospital: '🏥', police: '🚓', fire: '🚒' };
    return emojis[type] || '📍';
  };

  const getMarkerColor = (type: string) => {
    const colors: any = { hospital: '#FF4444', police: '#4444FF', fire: '#FF8800' };
    return colors[type] || '#666';
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Find Help Nearby</Text>
        
        <View style={styles.mapWrapper}>
          {loading ? (
            <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
          ) : (
            <MapComponent 
              locations={emergencyLocations} 
              initialRegion={{ latitude: userLat, longitude: userLon, latitudeDelta: 0.015, longitudeDelta: 0.015 }} 
              getMarkerColor={getMarkerColor} 
              getMarkerEmoji={getMarkerEmoji} 
            />
          )}
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoSection: { borderRadius: 24, padding: 20, borderWidth: 1, elevation: 3 },
  infoTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  serviceIcon: { fontSize: 24, marginRight: 16 },
  serviceDetails: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: '600' },
  serviceDistance: { fontSize: 13, marginTop: 2 },
});