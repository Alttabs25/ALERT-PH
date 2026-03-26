import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({
    fullName: '', age: '', birthday: 'Select Date', address: '',
    father: '', mother: '', sister: '', brother: '',
    bloodType: 'Unknown', conditions: '', allergies: '', medications: '',
  });

  const [showBloodTypeModal, setShowBloodTypeModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              fullName: data.fullName || '',
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
          }
        } catch (e) {
          console.error("Fetch Error:", e);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not found");

      await setDoc(doc(db, "users", user.uid), {
        ...formData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSaving(false);
      router.back();
    } catch (e: any) {
      setSaving(false);
      console.error("Save error:", e);
      Alert.alert("Save Failed", "Please check your internet connection.");
    }
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator color={colors.primary} size="large" /></View>;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
          <Text style={{ color: colors.icon, fontSize: 16 }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} style={{ padding: 10 }}>
          {saving ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
        {/* AVATAR PREVIEW (NON-EDITABLE) */}
        <View style={styles.photoSection}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarLetter}>{formData.fullName.charAt(0).toUpperCase() || "U"}</Text>
          </View>
          <Text style={{ color: colors.icon, marginTop: 10, fontSize: 12 }}>Avatar generated from name</Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Details</Text>
          <InputField label="Full Name" value={formData.fullName} onChangeText={(t: string) => setFormData({...formData, fullName: t})} colors={colors} />
          <InputField label="Age" value={formData.age} onChangeText={(t: string) => setFormData({...formData, age: t})} colors={colors} />
          <InputField label="Birthday" value={formData.birthday} onChangeText={(t: string) => setFormData({...formData, birthday: t})} colors={colors} />
          <InputField label="Address" value={formData.address} onChangeText={(t: string) => setFormData({...formData, address: t})} colors={colors} />
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Relationships</Text>
          <InputField label="Father" value={formData.father} onChangeText={(t: string) => setFormData({...formData, father: t})} colors={colors} />
          <InputField label="Mother" value={formData.mother} onChangeText={(t: string) => setFormData({...formData, mother: t})} colors={colors} />
          <InputField label="Sister" value={formData.sister} onChangeText={(t: string) => setFormData({...formData, sister: t})} colors={colors} />
          <InputField label="Brother" value={formData.brother} onChangeText={(t: string) => setFormData({...formData, brother: t})} colors={colors} />
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

      <Modal visible={showBloodTypeModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowBloodTypeModal(false)}>
          <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {BLOOD_TYPES.map(type => (
              <TouchableOpacity key={type} style={styles.dropdownItem} onPress={() => { setFormData({...formData, bloodType: type}); setShowBloodTypeModal(false); }}>
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
  loader: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
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
  dropdownMenu: { width: '80%', borderRadius: 16, borderWidth: 1, padding: 10 },
  dropdownItem: { paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#333' }
});