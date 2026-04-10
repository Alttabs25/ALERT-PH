import MapComponent from '@/components/Map';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

// 1. FIXED: Move this OUTSIDE the component to avoid re-renders
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // FIXED: Added <any> to stop the "Red" on setLocation
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const mapRefresh = useRef(0);

  const handleLocateMe = async () => {
    try {
      setLocating(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.Balanced 
      });
      setLocation(currentLocation.coords);
      mapRefresh.current += 1; // Force map to re-center
    } catch (e) {
      console.log('Error getting location:', e);
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLoading(false);
          return;
        }
        // Use Balanced for speed
        let currentLocation = await Location.getCurrentPositionAsync({ 
          accuracy: Location.Accuracy.Balanced 
        });
        setLocation(currentLocation.coords);
      } catch (e) {
        console.log(e);
      } finally {
        // CRITICAL: Always turn off loading so the Map actually shows
        setLoading(false);
      }
    })();
  }, []);

  // Fallback coordinates (Manila)
  const userLat = location?.latitude || 14.5995;
  const userLon = location?.longitude || 120.9842;

  const emergencyLocations = [
    { id: '1', name: 'Nearest Hospital', type: 'hospital', latitude: userLat + 0.005, longitude: userLon + 0.005 },
    { id: '2', name: 'Police Station', type: 'police', latitude: userLat - 0.003, longitude: userLon + 0.002 },
    { id: '3', name: 'Fire Department', type: 'fire', latitude: userLat + 0.002, longitude: userLon - 0.004 },
  ].map(place => ({
    ...place,
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
        
        <View style={[styles.mapWrapper, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {/* FIXED: Removed the loading check so the map renders immediately */}
          <MapComponent 
            locations={emergencyLocations} 
            initialRegion={{ 
              latitude: userLat, 
              longitude: userLon, 
              latitudeDelta: 0.015, 
              longitudeDelta: 0.015 
            }} 
            getMarkerColor={getMarkerColor} 
            getMarkerEmoji={getMarkerEmoji} 
          />

          {/* This overlay only shows IF the GPS is still searching */}
          {loading && (
            <View style={styles.loaderOverlay} pointerEvents="none">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          {/* Locate Me Button - Positioned on the map */}
          <Pressable 
            style={[styles.locateButton, { backgroundColor: colors.primary }]}
            onPress={handleLocateMe}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="my-location" size={20} color="#fff" />
            )}
          </Pressable>
        </View>

        {/* Nearby Services List */}
        <View style={[styles.infoSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Nearby Services</Text>
          <View>
            {emergencyLocations.map((loc, index) => (
              <View key={loc.id} style={[styles.serviceItem, index !== emergencyLocations.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <Text style={styles.serviceIcon}>{getMarkerEmoji(loc.type)}</Text>
                <View style={styles.serviceDetails}>
                  <Text style={[styles.serviceName, { color: colors.text }]}>{loc.name}</Text>
                  <Text style={[styles.serviceDistance, { color: colors.icon }]}>{loc.distance}</Text>
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
  mapWrapper: { height: 300, marginBottom: 20, borderRadius: 12, borderWidth: 2, overflow: 'hidden', position: 'relative' },
  loaderOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  locateButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loaderOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  infoSection: { borderRadius: 24, padding: 20, borderWidth: 1, elevation: 3 },
  infoTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  serviceIcon: { fontSize: 24, marginRight: 16 },
  serviceDetails: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: '600' },
  serviceDistance: { fontSize: 13, marginTop: 2 },
});