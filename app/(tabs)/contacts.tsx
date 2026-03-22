import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons'; // <-- Universal Icons
import { useState } from 'react';
import { Alert, FlatList, Linking, Modal, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

const mockContacts: Contact[] = [
  { id: '1', name: 'Mother', phone: '+63 917 123 4567', relationship: 'Family' },
  { id: '2', name: 'Father', phone: '+63 917 234 5678', relationship: 'Family' },
  { id: '3', name: 'Sister', phone: '+63 917 345 6789', relationship: 'Family' },
  { id: '4', name: 'Brother', phone: '+63 917 456 7890', relationship: 'Family' },
];

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
  });
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleAddContact = () => {
    if (newContact.name.trim() && newContact.phone.trim() && newContact.relationship.trim()) {
      const contact: Contact = {
        id: String(contacts.length + 1),
        ...newContact,
      };
      setContacts([...contacts, contact]);
      setNewContact({ name: '', phone: '', relationship: '' });
      setModalVisible(false);
    } else {
      Alert.alert("Error", "Please fill out all fields.");
    }
  };

  // NEW: Real phone dialing function
  const handleCall = (phone: string) => {
    const formattedNumber = phone.replace(/\s+/g, '');
    const url = `tel:${formattedNumber}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Error', 'This device does not support phone calls.');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const renderContactItem = ({ item }: { item: Contact }) => {
    const isExpanded = expandedId === item.id;

    return (
      <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={styles.contactHeader}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{item.name[0]}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.contactRelationship, { color: colors.icon }]}>{item.relationship}</Text>
          </View>
          {/* UPDATED TO IONICONS */}
          <Ionicons
            size={20}
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            color={colors.primary}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={[styles.contactDetails, { borderTopColor: colors.border }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.icon }]}>Phone:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{item.phone}</Text>
            </View>
            <TouchableOpacity
              style={[styles.callButton, { backgroundColor: colors.primary }]}
              onPress={() => handleCall(item.phone)} // Triggers real call
              activeOpacity={0.8}
            >
              {/* UPDATED TO IONICONS */}
              <Ionicons size={20} name="call" color="#FFFFFF" />
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Emergency Contacts</Text>
        <TouchableOpacity
          style={[styles.addButtonTop, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          {/* UPDATED TO IONICONS */}
          <Ionicons size={24} name="add" color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Emergency Contact</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                {/* UPDATED TO IONICONS */}
                <Ionicons size={28} name="close" color={colors.icon} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter contact name"
                placeholderTextColor={colors.icon}
                value={newContact.name}
                onChangeText={(text) => setNewContact({ ...newContact, name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter phone number"
                placeholderTextColor={colors.icon}
                keyboardType="phone-pad"
                value={newContact.phone}
                onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Relationship</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Family, Friend, Doctor"
                placeholderTextColor={colors.icon}
                value={newContact.relationship}
                onChangeText={(text) => setNewContact({ ...newContact, relationship: text })}
              />
            </View>

            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={handleAddContact}
              >
                <Text style={styles.addButtonText}>Add Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // FIX: Push content down below status bar on Android
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20, // Adjusted since we are using SafeAreaView
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  addButtonTop: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 150, // FIX: Clear the bottom tab bar!
  },
  contactCard: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden', // Keeps the expanding card clean
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactRelationship: {
    fontSize: 12,
  },
  contactDetails: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
    minWidth: 50,
  },
  detailValue: {
    fontSize: 12,
    flex: 1,
  },
  callButton: {
    flexDirection: 'row',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 12,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalButtonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});