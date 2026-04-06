import { Colors } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Emergency Tools
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms'; // For Real SMS
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { userData } = useUser();

  const [isHolding, setIsHolding] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  // --- THE REAL SMS GESTURE LOGIC ---
  const handleRealSMSAlert = async () => {
    setIsHolding(false);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // 1. Fetch Justine and other contacts from your 'contacts' sub-collection
      const contactsSnapshot = await getDocs(collection(db, "users", user.uid, "contacts"));
      const contactNumbers = contactsSnapshot.docs.map(doc => doc.data().phone);

      if (contactNumbers.length === 0) {
        return Alert.alert("No Contacts", "Please add Justine's number in the Contacts tab first.");
      }

      // 2. Get GPS Location
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const mapLink = `https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;

      // 3. Trigger Vibration
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // 4. OPEN REAL SMS APP
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync(
          contactNumbers, 
          `ALERT PH: EMERGENCY! I need help. My current location: ${mapLink}`
        );
      } else {
        Alert.alert("Error", "SMS is not available on this device.");
      }

    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to trigger SOS.");
    }
  };

  const onPressIn = () => {
    setIsHolding(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    setIsHolding(false);
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>Welcome, {userData?.fullName?.split(' ')[0] || 'User'}</Text>
          <Text style={[styles.appName, { color: colors.primary }]}>ALERT PH</Text>
        </View>

        <View style={styles.content}>
          
          {/* THE RED BUTTON (REWRITTEN FOR REAL SMS) */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity 
              style={[styles.emergencyButton, { backgroundColor: colors.primary }]} 
              activeOpacity={1}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onLongPress={handleRealSMSAlert}
              delayLongPress={2000}
              onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)}
            >
              <Ionicons size={64} name={isHolding ? "warning" : "call"} color="#FFFFFF" />
              <Text style={styles.emergencyButtonText}>
                {isHolding ? "HOLDING..." : "Emergency SMS"}
              </Text>
              <Text style={styles.emergencyButtonSubtext}>
                {isHolding ? "Keep holding to send text" : "Hold 2s to text contacts"}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.dashboardGrid}>
            <TouchableOpacity style={[styles.dashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/map')}>
              <Ionicons size={32} name="map" color={colors.primary} />
              <Text style={[styles.dashboardCardTitle, { color: colors.text }]}>Find Help</Text>
              <Text style={[styles.dashboardCardSubtext, { color: colors.icon }]}>Nearby services</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.dashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/hotlines')}>
              <Ionicons size={32} name="call" color={colors.primary} />
              <Text style={[styles.dashboardCardTitle, { color: colors.text }]}>Hotlines</Text>
              <Text style={[styles.dashboardCardSubtext, { color: colors.icon }]}>Quick access</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.dashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/contacts')}>
              <Ionicons size={32} name="people" color={colors.primary} />
              <Text style={[styles.dashboardCardTitle, { color: colors.text }]}>Contacts</Text>
              <Text style={[styles.dashboardCardSubtext, { color: colors.icon }]}>Emergency contacts</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.dashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => Alert.alert("Location", "Hold the red button to share.")}>
              <Ionicons size={32} name="location" color={colors.primary} />
              <Text style={[styles.dashboardCardTitle, { color: colors.text }]}>Location</Text>
              <Text style={[styles.dashboardCardSubtext, { color: colors.icon }]}>Share location</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.tipsSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.tipsSectionTitle, { color: colors.text }]}>Safety Tips</Text>
            <Text style={[styles.tipsText, { color: colors.icon }]}>
              • Always keep your emergency contacts updated{'\n'}
              • Share your location with trusted people{'\n'}
              • Keep your phone charged
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, marginBottom: 10 },
  greeting: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  appName: { fontSize: 32, fontWeight: 'bold', letterSpacing: 1 },
  content: { paddingHorizontal: 20 },
  emergencyButton: { borderRadius: 20, padding: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 30, elevation: 8 },
  emergencyButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginTop: 12 },
  emergencyButtonSubtext: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, marginTop: 4 },
  dashboardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  dashboardCard: { width: '48%', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, elevation: 2 },
  dashboardCardTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 8 },
  dashboardCardSubtext: { fontSize: 11, marginTop: 2 },
  tipsSection: { borderRadius: 16, padding: 16, borderWidth: 1, elevation: 2 },
  tipsSectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  tipsText: { fontSize: 12, lineHeight: 22 },
});