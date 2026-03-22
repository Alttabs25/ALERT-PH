import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons'; // <-- Universal icons restored
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [image, setImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: 'John Doe', age: '28 years', birthday: 'March 14, 1998', address: '123 Main Street, Manila',
    father: 'Juan Doe', mother: 'Maria Doe', sister: 'Jane Doe', brother: 'Pedro Doe',
    bloodType: 'O+', conditions: 'None', allergies: 'Penicillin', medications: 'Aspirin (as needed)',
  });

  const [date, setDate] = useState(new Date(1998, 2, 14));
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // NEW: State to control our custom sleek dropdown
  const [showBloodTypeModal, setShowBloodTypeModal] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const updateForm = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      updateForm('birthday', formattedDate);
    }
  };

  const InputField = ({ label, value, onChangeText }: any) => (
    <View style={[styles.inputWrapper, { borderBottomColor: colors.border }]}>
      <Text style={[styles.inputLabel, { color: colors.icon }]}>{label}</Text>
      <TextInput style={[styles.textInput, { color: colors.text }]} value={value} onChangeText={onChangeText} placeholderTextColor={colors.icon} />
    </View>
  );

  const handleSave = () => {
    Alert.alert("Success", "Profile updated successfully!");
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}><Text style={[styles.headerButton, { color: colors.icon }]}>Cancel</Text></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}><Text style={[styles.headerButton, { color: colors.primary, fontWeight: 'bold' }]}>Save</Text></TouchableOpacity>
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
          <InputField label="Full Name" value={formData.name} onChangeText={(t: string) => updateForm('name', t)} />
          <InputField label="Age" value={formData.age} onChangeText={(t: string) => updateForm('age', t)} />
          
          {/* BIRTHDAY CALENDAR PICKER */}
          <View style={[styles.inputWrapper, { borderBottomColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.icon }]}>Birthday</Text>
            <TouchableOpacity style={{ flex: 0.65, paddingVertical: Platform.OS === 'ios' ? 8 : 0 }} onPress={() => setShowDatePicker(!showDatePicker)}>
              <Text style={[{ fontSize: 15, color: colors.text }]}>{formData.birthday}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <View style={{ marginTop: 10, marginBottom: 10, alignItems: 'center' }}>
              <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} maximumDate={new Date()} themeVariant={colorScheme === 'dark' ? 'dark' : 'light'} />
              {Platform.OS === 'ios' && (
                <TouchableOpacity style={{ marginTop: 10, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 }} onPress={() => setShowDatePicker(false)}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          <InputField label="Address" value={formData.address} onChangeText={(t: string) => updateForm('address', t)} />
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Relationships</Text>
          <InputField label="Father" value={formData.father} onChangeText={(t: string) => updateForm('father', t)} />
          <InputField label="Mother" value={formData.mother} onChangeText={(t: string) => updateForm('mother', t)} />
          <InputField label="Sister" value={formData.sister} onChangeText={(t: string) => updateForm('sister', t)} />
          <InputField label="Brother" value={formData.brother} onChangeText={(t: string) => updateForm('brother', t)} />
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Medical Records</Text>
          
          {/* THE NEW SLEEK DROPDOWN TRIGGER */}
          <View style={[styles.inputWrapper, { borderBottomColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.icon }]}>Blood Type</Text>
            <TouchableOpacity 
              style={{ flex: 0.65, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Platform.OS === 'ios' ? 8 : 0 }} 
              onPress={() => setShowBloodTypeModal(true)}
              activeOpacity={0.7}
            >
              <Text style={[{ fontSize: 15, color: colors.text }]}>{formData.bloodType}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.icon} />
            </TouchableOpacity>
          </View>

          <InputField label="Conditions" value={formData.conditions} onChangeText={(t: string) => updateForm('conditions', t)} />
          <InputField label="Allergies" value={formData.allergies} onChangeText={(t: string) => updateForm('allergies', t)} />
          <InputField label="Medications" value={formData.medications} onChangeText={(t: string) => updateForm('medications', t)} />
        </View>
      </ScrollView>

      {/* THE NEW SLEEK DROPDOWN MODAL */}
      <Modal visible={showBloodTypeModal} transparent={true} animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowBloodTypeModal(false)} // Closes if you tap outside the menu
        >
          <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dropdownTitle, { color: colors.icon }]}>Select Blood Type</Text>
            {BLOOD_TYPES.map((type, index) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.dropdownItem, 
                  index !== BLOOD_TYPES.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }
                ]}
                onPress={() => {
                  updateForm('bloodType', type);
                  setShowBloodTypeModal(false);
                }}
              >
                <Text style={[
                  styles.dropdownItemText, 
                  { color: formData.bloodType === type ? colors.primary : colors.text, fontWeight: formData.bloodType === type ? 'bold' : 'normal' }
                ]}>
                  {type}
                </Text>
                {formData.bloodType === type && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Android notch fix restored!
  },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1 },
  headerButton: { fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  photoSection: { alignItems: 'center', paddingVertical: 24 },
  photoContainer: { position: 'relative', marginBottom: 12 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  profilePlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#333', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#FFF' },
  changePhotoText: { fontSize: 15, fontWeight: '600' },
  formCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingVertical: 12 },
  inputLabel: { flex: 0.35, fontSize: 14 },
  textInput: { flex: 0.65, fontSize: 15, padding: 0 },
  
  // Custom Sleek Dropdown Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    width: '80%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  dropdownTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 16,
  },
});