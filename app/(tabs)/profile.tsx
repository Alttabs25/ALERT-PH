import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SectionConfig {
  id: string;
  title: string;
  items: { label: string; value: string }[];
}

// Restored: Your saved contacts for the picker
const SAVED_CONTACTS = [
  { id: '1', name: 'Jane Doe', relation: 'Sister', phone: '+63 917 123 4567' },
  { id: '2', name: 'Juan Doe', relation: 'Father', phone: '+63 917 111 2222' },
  { id: '3', name: 'Maria Doe', relation: 'Mother', phone: '+63 917 333 4444' },
  { id: '4', name: 'Pedro Doe', relation: 'Brother', phone: '+63 917 555 6666' },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    personal: false, relationships: false, medical: false,
  });

  // Restored: State for the emergency contact picker
  const [primaryContact, setPrimaryContact] = useState(SAVED_CONTACTS[0]);
  const [showContactModal, setShowContactModal] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleEmergencyCall = () => {
    const formattedNumber = primaryContact.phone.replace(/\s+/g, '');
    const url = `tel:${formattedNumber}`;

    Linking.canOpenURL(url).then((supported) => {
      if (!supported) {
        Alert.alert('Error', 'This device does not support phone calls.');
      } else {
        return Linking.openURL(url);
      }
    }).catch((err) => console.error('An error occurred', err));
  };

  const sections: SectionConfig[] = [
    {
      id: 'personal', title: 'Personal Details',
      items: [
        { label: 'Age', value: '28 years' },
        { label: 'Birthday', value: 'March 14, 1998' },
        { label: 'Address', value: '123 Main Street, Manila' },
      ],
    },
    {
      id: 'relationships', title: 'Relationships',
      items: [
        { label: 'Father', value: 'Juan Doe' },
        { label: 'Mother', value: 'Maria Doe' },
        { label: 'Sister', value: 'Jane Doe' },
        { label: 'Brother', value: 'Pedro Doe' },
      ],
    },
    {
      id: 'medical', title: 'Medical Records',
      items: [
        { label: 'Blood Type', value: 'O+' },
        { label: 'Medical Conditions', value: 'None' },
        { label: 'Allergies', value: 'Penicillin' },
        { label: 'Medications', value: 'Aspirin (as needed)' },
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
          <Text style={[styles.userName, { color: colors.text }]}>John Doe</Text>
          <Text style={[styles.userLocation, { color: colors.icon }]}>Manila, Philippines</Text>
        </View>

        <View style={[styles.emergencyContactSection, { backgroundColor: colors.primary }]}>
          <View style={styles.emergencyContactContent}>
            <View style={styles.emergencyContactHeaderRow}>
              <Text style={styles.emergencyContactLabel}>Primary Emergency Contact</Text>
              
              {/* Restored: The pencil icon to edit the primary contact */}
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
          {/* Restored: Actually pushes you to the Edit Profile screen instead of the alert! */}
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={() => router.push('/edit-profile')}>
            <Ionicons size={20} name="pencil" color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Restored: The bottom sheet modal to pick a new contact */}
      <Modal visible={showContactModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Emergency Contact</Text>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <Ionicons size={24} name="close" color={colors.icon} />
              </TouchableOpacity>
            </View>
            {SAVED_CONTACTS.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={[styles.contactOption, { borderBottomColor: colors.border }]}
                onPress={() => { setPrimaryContact(contact); setShowContactModal(false); }}
              >
                <Text style={[styles.contactOptionName, { color: colors.text }]}>{contact.name} ({contact.relation})</Text>
                <Text style={[styles.contactOptionPhone, { color: colors.icon }]}>{contact.phone}</Text>
              </TouchableOpacity>
            ))}
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
  profilePicture: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  userName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  userLocation: { fontSize: 14 },
  emergencyContactSection: { marginHorizontal: 20, marginBottom: 20, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  emergencyContactContent: { flex: 1 },
  emergencyContactHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  emergencyContactLabel: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 },
  editContactButton: { backgroundColor: 'rgba(255, 255, 255, 0.25)', padding: 4, borderRadius: 12, marginLeft: 8 },
  emergencyContactName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  emergencyContactPhone: { color: '#FFFFFF', fontSize: 12 },
  emergencyCallButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  section: { marginHorizontal: 20, marginBottom: 12, borderRadius: 12, overflow: 'hidden', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  sectionItem: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLabel: { fontSize: 13, flex: 0.4 },
  itemValue: { fontSize: 13, fontWeight: '500', flex: 0.6, textAlign: 'right' },
  actionSection: { paddingHorizontal: 20, paddingVertical: 20, marginBottom: 40 },
  actionButton: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  actionButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  contactOption: { paddingVertical: 16, borderBottomWidth: 1 },
  contactOptionName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  contactOptionPhone: { fontSize: 14 },
});