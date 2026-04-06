import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { doc, updateDoc } from 'firebase/firestore';
import { Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';

export const triggerSOS = async (contacts: string[]) => {
  try {
    // 1. Request Permissions
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "GPS is required for SOS features.");
      return;
    }

    // 2. Get High Accuracy Location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    const { latitude, longitude } = location.coords;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    // 3. Send SMS to Contacts
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable && contacts.length > 0) {
      const { result } = await SMS.sendSMSAsync(
        contacts,
        `ALERT PH: EMERGENCY! I need help. My location: ${googleMapsUrl}`
      );
      console.log("SMS Result:", result);
    }

    // 4. Update Firebase so the "Rescuer" side can see it
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, "emergency_alerts", user.uid), {
        status: 'active',
        lastLocation: { latitude, longitude },
        timestamp: new Date().toISOString(),
      });
    }

    Alert.alert("SOS Sent", "Your emergency contacts have been notified.");
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Could not trigger SOS.");
  }
};