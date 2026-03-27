import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Components & Context
import EmergencyLoader from '@/components/EmergencyLoader';
import { useUser } from '@/context/UserContext';

// Firebase
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

const InputField = ({ label, value, onChangeText, colors }: any) => (
  <View style={[styles.inputWrapper, { borderBottomColor: colors.border }]}>
    <Text style={[styles.inputLabel, { color: colors.icon }]}>{label}</Text>
    <TextInput 
      style={[styles.textInput, { color: colors.text }]} 
      value={value || ''} 
      onChangeText={onChangeText} 
      placeholder="Not set"
      placeholderTextColor="#555" 
    />
  </View>
);

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { userData } = useUser();

  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Stable date for the wheel
  const [pickerDate, setPickerDate] = useState(new Date(2005, 5, 25));

  const [formData, setFormData] = useState<any>({
    fullName: userData?.fullName || '',
    age: userData?.age || '',
    birthday: userData?.birthday || '',
    address: userData?.address || '',
    father: userData?.father || '',
    mother: userData?.mother || '',
    bloodType: userData?.bloodType || 'Unknown',
    conditions: userData?.conditions || '',
    allergies: userData?.allergies || '',
    medications: userData?.medications || '',
  });

  const [showBloodTypeModal, setShowBloodTypeModal] = useState(false);

  // --- DATE LOGIC ---
  const updateBirthdayState = (date: Date) => {
    const formatted = date.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
    setFormData((prev: any) => ({ ...prev, birthday: formatted }));
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setPickerDate(selectedDate);
        updateBirthdayState(selectedDate);
      }
    } else {
      // iOS: Just update the temp wheel state
      if (selectedDate) setPickerDate(selectedDate);
    }
  };

  const handleConfirmIOS = () => {
    updateBirthdayState(pickerDate);
    setShowDatePicker(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      await setDoc(doc(db, "users", user.uid), {
        ...formData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setTimeout(() => {
        setSaving(false);
        router.back();
      }, 1800);
    } catch (e) {
      setSaving(false);
      Alert.alert("Error", "Failed to save.");
    }
  };

  if (saving) return (
    <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
      <EmergencyLoader />
      <Text style={[styles.loaderText, { color: colors.text }]}>Saving Information...</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Text style={{ color: colors.icon, fontSize: 16 }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} style={styles.navBtn}>
            <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarLetter}>{formData.fullName?.charAt(0).toUpperCase() || "U"}</Text>
          </View>
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Details</Text>
          <InputField label="Full Name" value={formData.fullName} onChangeText={(t: string) => setFormData({...formData, fullName: t})} colors={colors} />
          <InputField label="Age" value={formData.age} onChangeText={(t: string) => setFormData({...formData, age: t})} colors={colors} />
          
          <TouchableOpacity 
            style={[styles.inputWrapper, { borderBottomColor: colors.border }]} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.inputLabel, { color: colors.icon }]}>Birthday</Text>
            <View style={{ flex: 0.65, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: formData.birthday ? colors.text : '#555', fontSize: 15 }}>
                {formData.birthday || 'Select Date'}
              </Text>
              <Ionicons name="calendar-outline" size={16} color={colors.icon} />
            </View>
          </TouchableOpacity>

          <InputField label="Address" value={formData.address} onChangeText={(t: string) => setFormData({...formData, address: t})} colors={colors} />
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Relationships</Text>
          <InputField label="Father" value={formData.father} onChangeText={(t: string) => setFormData({...formData, father: t})} colors={colors} />
          <InputField label="Mother" value={formData.mother} onChangeText={(t: string) => setFormData({...formData, mother: t})} colors={colors} />
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Medical Records</Text>
          <TouchableOpacity 
            style={[styles.inputWrapper, { borderBottomColor: colors.border }]} 
            onPress={() => setShowBloodTypeModal(true)}
          >
            <Text style={[styles.inputLabel, { color: colors.icon }]}>Blood Type</Text>
            <View style={{ flex: 0.65, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text }}>{formData.bloodType}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.icon} />
            </View>
          </TouchableOpacity>
          <InputField label="Conditions" value={formData.conditions} onChangeText={(t: string) => setFormData({...formData, conditions: t})} colors={colors} />
          <InputField label="Allergies" value={formData.allergies} onChangeText={(t: string) => setFormData({...formData, allergies: t})} colors={colors} />
          <InputField label="Medications" value={formData.medications} onChangeText={(t: string) => setFormData({...formData, medications: t})} colors={colors} />
        </View>
      </ScrollView>

      {/* --- CROSS-PLATFORM PICKER --- */}
      {showDatePicker && (
        <>
          {Platform.OS === 'ios' ? (
            <Modal transparent animationType="slide">
              <View style={styles.iosOverlay}>
                <View style={[styles.iosPickerBox, { backgroundColor: colors.card }]}>
                  <View style={styles.iosHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={{ color: colors.icon }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleConfirmIOS}>
                      <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={pickerDate}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={pickerDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </>
      )}

      {/* Blood Type Modal */}
      <Modal visible={showBloodTypeModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowBloodTypeModal(false)}>
          <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {BLOOD_TYPES.map(type => (
                <TouchableOpacity key={type} style={styles.dropdownItem} onPress={() => { setFormData({...formData, bloodType: type}); setShowBloodTypeModal(false); }}>
                  <Text style={{ color: colors.text }}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 20, fontSize: 16, fontWeight: '600', letterSpacing: 1 },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  navBtn: { padding: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  photoSection: { alignItems: 'center', paddingVertical: 24 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  avatarLetter: { color: '#FFFFFF', fontSize: 40, fontWeight: 'bold' },
  formCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingVertical: 12 },
  inputLabel: { flex: 0.35, fontSize: 14 },
  textInput: { flex: 0.65, fontSize: 15, padding: 0 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  dropdownMenu: { width: '80%', maxHeight: '50%', borderRadius: 16, borderWidth: 1, padding: 10 },
  dropdownItem: { paddingVertical: 14, paddingHorizontal: 12 },
  // iOS Specific Styles
  iosOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  iosPickerBox: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
  iosHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#444' }
});