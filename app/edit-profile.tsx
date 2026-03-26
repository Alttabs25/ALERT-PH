import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Firebase
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

// --- FIX 1: MOVE OUTSIDE TO STOP KEYBOARD BUG ---
const InputField = ({ label, value, onChangeText, colors }: any) => (
  <View style={[styles.inputWrapper, { borderBottomColor: colors.border }]}>
    <Text style={[styles.inputLabel, { color: colors.icon }]}>{label}</Text>
    <TextInput 
      style={[styles.textInput, { color: colors.text }]} 
      value={value} 
      onChangeText={onChangeText} 
      placeholder="Not set"
      placeholderTextColor={colors.icon} 
    />
  </View>
);

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', age: '', birthday: 'Select Date', address: '',
    father: '', mother: '', sister: '', brother: '',
    bloodType: 'Unknown', conditions: '', allergies: '', medications: '',
  });

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBloodTypeModal, setShowBloodTypeModal] = useState(false);

  // LOAD DATA FROM FIRESTORE
  useEffect(() => {
    const loadData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.fullName || '',
            age: data.age || '',
            birthday: data.birthday || 'Select Date',
            address: data.address || '',
            father: data.father || '',
            mother: data.mother || '',
            sister: data.sister || '',
            brother: data.brother || '',
            bloodType: data.bloodType || 'Unknown',
            conditions: data.conditions || '',
            allergies: data.allergies || '',
            medications: data.medications || '',
          });
          if (data.birthday && data.birthday !== 'Select Date') {
            setDate(new Date(data.birthday));
          }
        }
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const updateForm = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      updateForm('birthday', formattedDate);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          fullName: formData.name, age: formData.age, birthday: formData.birthday, address: formData.address,
          father: formData.father, mother: formData.mother, sister: formData.sister, brother: formData.brother,
          bloodType: formData.bloodType, conditions: formData.conditions, allergies: formData.allergies, medications: formData.medications,
        });
        Alert.alert("Success", "Profile updated!");
        router.back();
      }
    } catch (e) {
      Alert.alert("Error", "Could not save to database.");
    } finally { setSaving(false); }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  if (loading) return <View style={{flex: 1, backgroundColor: colors.background, justifyContent: 'center'}}><ActivityIndicator color={colors.primary}/></View>;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}><Text style={[styles.headerButton, { color: colors.icon }]}>Cancel</Text></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={[styles.headerButton, { color: colors.primary, fontWeight: 'bold' }]}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
            {image ? <Image source={{ uri: image }} style={styles.profileImage} /> : <View style={[styles.profilePlaceholder, { backgroundColor: colors.primary }]}><Ionicons size={50} name="person" color="#FFFFFF" /></View>}
            <View style={styles.editBadge}><Ionicons size={16} name="camera" color="#FFFFFF" /></View>
          </TouchableOpacity>
          <Text style={[styles.changePhotoText, { color: colors.primary }]} onPress={pickImage}>Change Profile Photo</Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Details</Text>
          <InputField label="Full Name" value={formData.name} onChangeText={(t: string) => updateForm('name', t)} colors={colors} />
          <InputField label="Age" value={formData.age} onChangeText={(t: string) => updateForm('age', t)} colors={colors} />
          
          {/* --- FIX 2: WEB-READY CALENDAR TRIGGER --- */}
          <View style={[styles.inputWrapper, { borderBottomColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.icon }]}>Birthday</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                style={{ flex: 0.65, backgroundColor: 'transparent', color: colors.text, border: 'none', fontSize: '15px', outline: 'none' }}
                value={date.toISOString().split('T')[0]}
                onChange={(e) => onDateChange({}, new Date(e.target.value))}
              />
            ) : (
              <TouchableOpacity style={{ flex: 0.65 }} onPress={() => setShowDatePicker(true)}>
                <Text style={{ fontSize: 15, color: colors.text }}>{formData.birthday}</Text>
              </TouchableOpacity>
            )}
          </View>

          {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} maximumDate={new Date()} />
          )}
          <InputField label="Address" value={formData.address} onChangeText={(t: string) => updateForm('address', t)} colors={colors} />
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Relationships</Text>
          <InputField label="Father" value={formData.father} onChangeText={(t: string) => updateForm('father', t)} colors={colors} />
          <InputField label="Mother" value={formData.mother} onChangeText={(t: string) => updateForm('mother', t)} colors={colors} />
          <InputField label="Sister" value={formData.sister} onChangeText={(t: string) => updateForm('sister', t)} colors={colors} />
          <InputField label="Brother" value={formData.brother} onChangeText={(t: string) => updateForm('brother', t)} colors={colors} />
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Medical Records</Text>
          <View style={[styles.inputWrapper, { borderBottomColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.icon }]}>Blood Type</Text>
            <TouchableOpacity style={{ flex: 0.65, flexDirection: 'row', justifyContent: 'space-between' }} onPress={() => setShowBloodTypeModal(true)}>
              <Text style={{ color: colors.text }}>{formData.bloodType}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.icon} />
            </TouchableOpacity>
          </View>
          <InputField label="Conditions" value={formData.conditions} onChangeText={(t: string) => updateForm('conditions', t)} colors={colors} />
          <InputField label="Allergies" value={formData.allergies} onChangeText={(t: string) => updateForm('allergies', t)} colors={colors} />
          <InputField label="Medications" value={formData.medications} onChangeText={(t: string) => updateForm('medications', t)} colors={colors} />
        </View>
      </ScrollView>

      <Modal visible={showBloodTypeModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowBloodTypeModal(false)}>
          <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dropdownTitle, { color: colors.icon }]}>Select Blood Type</Text>
            {BLOOD_TYPES.map(type => (
              <TouchableOpacity key={type} style={styles.dropdownItem} onPress={() => { updateForm('bloodType', type); setShowBloodTypeModal(false); }}>
                <Text style={{ color: colors.text }}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
  headerButton: { fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  photoSection: { alignItems: 'center', paddingVertical: 24 },
  photoContainer: { position: 'relative' },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  profilePlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#333', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#FFF' },
  changePhotoText: { fontSize: 15, fontWeight: '600', marginTop: 12 },
  formCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingVertical: 12 },
  inputLabel: { flex: 0.35, fontSize: 14 },
  textInput: { flex: 0.65, fontSize: 15, padding: 0 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  dropdownMenu: { width: '80%', borderRadius: 16, borderWidth: 1, padding: 10 },
  dropdownTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', paddingHorizontal: 12, paddingVertical: 10 },
  dropdownItem: { paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#333' }
});