import MapComponent from '@/components/Map';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

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
  
  const [location, setLocation] = useState<any>(null);
  const [region, setRegion] = useState<any>(null); 
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  const scale = useSharedValue(1);

  const updateLocationState = (coords: any) => {
    const newRegion = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    };
    setLocation(coords);
    setRegion(newRegion); 
  };

  const handleLocateMe = async () => {
    try {
      setLocating(true);
      scale.value = withSequence(withTiming(1.2, { duration: 100 }), withTiming(1, { duration: 100 }));
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let currentLocation = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.High 
      });
      
      updateLocationState(currentLocation.coords);
    } catch (e) {
      console.log('Error:', e);
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          updateLocationState({ latitude: 14.5995, longitude: 120.9842 });
          return;
        }
        let currentLocation = await Location.getCurrentPositionAsync({ 
          accuracy: Location.Accuracy.Balanced 
        });
        updateLocationState(currentLocation.coords);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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

  const getMarkerEmoji = (type: string) => ({ hospital: '🏥', police: '🚓', fire: '🚒' }[type] || '📍');
  const getMarkerColor = (type: string) => ({ hospital: '#FF4444', police: '#4444FF', fire: '#FF8800' }[type] || '#666');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Find Help Nearby</Text>
        
        <View style={[styles.mapWrapper, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <MapComponent 
            locations={emergencyLocations} 
            initialRegion={region} 
            getMarkerColor={getMarkerColor} 
            getMarkerEmoji={getMarkerEmoji} 
          />

          {loading && (
            <View style={styles.loaderOverlay} pointerEvents="none">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          {/* LOCATE ME BUTTON - Restored to your original 48x48 size */}
          <Pressable onPress={handleLocateMe} disabled={locating} style={styles.locateButtonWrapper}>
            <Animated.View style={[styles.locateButton, { backgroundColor: colors.primary }, animatedButtonStyle]}>
              {locating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialIcons name="my-location" size={20} color="#fff" />
              )}
            </Animated.View>
          </Pressable>
        </View>

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
  loaderOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 1 },
  
  // LOCATE BUTTON WRAPPER AND SIZE (48x48 as per your original code)
  locateButtonWrapper: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    zIndex: 100,
  },
  locateButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  infoSection: { borderRadius: 24, padding: 20, borderWidth: 1, elevation: 3 },
  infoTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  serviceIcon: { fontSize: 24, marginRight: 16 },
  serviceDetails: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: '600' },
  serviceDistance: { fontSize: 13, marginTop: 2 },
});