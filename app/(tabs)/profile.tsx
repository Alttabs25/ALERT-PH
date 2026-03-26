import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router'; // Added useFocusEffect
import { useCallback, useState } from 'react'; // Added useCallback
import { ActivityIndicator, Alert, Linking, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Firebase Imports
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

interface SectionConfig {
  id: string;
  title: string;
  items: { label: string; value: string }[];
}

const SAVED_CONTACTS = [
  { id: '1', name: 'Add Contact', relation: 'N/A', phone: 'None' },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    personal: false, relationships: false, medical: false,
  });

  const [primaryContact, setPrimaryContact] = useState(SAVED_CONTACTS[0]);
  const [showContactModal, setShowContactModal] = useState(false);

  // FIX: This ensures the data refreshes EVERY TIME you open the Profile tab
  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          const user = auth.currentUser;
          if (user) {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              setUserData(data);
              
              // If they have an emergency contact saved, set it
              if (data.emergencyContact) {
                setPrimaryContact(data.emergencyContact);
              } else if (data.father || data.mother) {
                // Fallback: If no official emergency contact, show the parent
                setPrimaryContact({
                    id: 'fallback',
                    name: data.father || data.mother,
                    relation: data.father ? 'Father' : 'Mother',
                    phone: 'Check Records'
                });
              }
            }
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }, [])
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleEmergencyCall = () => {
    if (primaryContact.phone === 'None' || primaryContact.phone === 'Check Records') {
        return Alert.alert("Error", "Please set a valid phone number in Edit Profile.");
    }
    const formattedNumber = primaryContact.phone.replace(/\s+/g, '');
    const url = `tel:${formattedNumber}`;
    Linking.openURL(url);
  };

  const sections: SectionConfig[] = [
    {
      id: 'personal', title: 'Personal Details',
      items: [
        { label: 'Age', value: userData?.age || 'Not set' },
        { label: 'Birthday', value: userData?.birthday || 'Not set' },
        { label: 'Address', value: userData?.address || 'Not set' },
      ],
    },
    {
      id: 'relationships', title: 'Relationships',
      items: [
        { label: 'Father', value: userData?.father || 'Not set' },
        { label: 'Mother', value: userData?.mother || 'Not set' },
        { label: 'Sister', value: userData?.sister || 'Not set' },
        { label: 'Brother', value: userData?.brother || 'Not set' },
      ],
    },
    {
      id: 'medical', title: 'Medical Records',
      items: [
        { label: 'Blood Type', value: userData?.bloodType || 'Not set' },
        { label: 'Medical Conditions', value: userData?.conditions || 'None' },
        { label: 'Allergies', value: userData?.allergies || 'None' },
        { label: 'Medications', value: userData?.medications || 'None' },
      ],
    },
  ];

  const ProfileSection = ({ section }: { section: SectionConfig }) => {
    const isExpanded = expandedSections[section.id];
    return (
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(section.id)} activeOpacity={0.7}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
          <Ionicons size={20} name={isExpanded ? 'chevron-down' : 'chevron-forward'} color={colors.primary} />
        </TouchableOpacity>
        {isExpanded && (
          <View>
            {section.items.map((item, index) => (
              <View key={index} style={[styles.sectionItem, index !== section.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                <Text style={[styles.itemLabel, { color: colors.icon }]}>{item.label}</Text>
                <Text style={[styles.itemValue, { color: colors.text }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }} /> 
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsCogButton} activeOpacity={0.7}>
          <Ionicons size={24} name="settings" color={colors.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={[styles.profilePicture, { backgroundColor: colors.primary }]}>
            <Ionicons size={60} name="person" color="#FFFFFF" />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{userData?.fullName || "User"}</Text>
          <Text style={[styles.userLocation, { color: colors.icon }]}>{userData?.address || "Location not set"}</Text>
        </View>

        <View style={[styles.emergencyContactSection, { backgroundColor: colors.primary }]}>
          <View style={styles.emergencyContactContent}>
            <View style={styles.emergencyContactHeaderRow}>
              <Text style={styles.emergencyContactLabel}>Primary Emergency Contact</Text>
              <TouchableOpacity style={styles.editContactButton} onPress={() => setShowContactModal(true)}>
                <Ionicons size={12} name="pencil" color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.emergencyContactName}>{primaryContact.name} ({primaryContact.relation})</Text>
            <Text style={styles.emergencyContactPhone}>{primaryContact.phone}</Text>
          </View>
          <TouchableOpacity style={styles.emergencyCallButton} onPress={handleEmergencyCall} activeOpacity={0.7}>
            <Ionicons size={24} name="call" color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {sections.map((section) => (
          <ProfileSection key={section.id} section={section} />
        ))}

        <View style={styles.actionSection}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={() => router.push('/edit-profile')}>
            <Ionicons size={20} name="pencil" color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showContactModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Emergency Contact</Text>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <Ionicons size={24} name="close" color={colors.icon} />
              </TouchableOpacity>
            </View>
            <Text style={{color: colors.icon, textAlign: 'center', marginVertical: 20}}>Please add contacts in Edit Profile.</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  topHeader: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 5 },
  settingsCogButton: { padding: 8 },
  container: { flex: 1 },
  headerSection: { alignItems: 'center', paddingVertical: 10, marginBottom: 20 },
  profilePicture: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 5 },
  userName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  userLocation: { fontSize: 14 },
  emergencyContactSection: { marginHorizontal: 20, marginBottom: 20, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 5 },
  emergencyContactContent: { flex: 1 },
  emergencyContactHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  emergencyContactLabel: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 },
  editContactButton: { backgroundColor: 'rgba(255, 255, 255, 0.25)', padding: 4, borderRadius: 12, marginLeft: 8 },
  emergencyContactName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  emergencyContactPhone: { color: '#FFFFFF', fontSize: 12 },
  emergencyCallButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  section: { marginHorizontal: 20, marginBottom: 12, borderRadius: 12, overflow: 'hidden', borderWidth: 1, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  sectionItem: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLabel: { fontSize: 13, flex: 0.4 },
  itemValue: { fontSize: 13, fontWeight: '500', flex: 0.6, textAlign: 'right' },
  actionSection: { paddingHorizontal: 20, paddingVertical: 20, marginBottom: 40 },
  actionButton: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', elevation: 3 },
  actionButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  contactOption: { paddingVertical: 16, borderBottomWidth: 1 },
  contactOptionName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  contactOptionPhone: { fontSize: 14 },
});