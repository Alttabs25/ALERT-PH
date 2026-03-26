import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, Modal, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import Animated, { Extrapolate, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// Firebase Imports
import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const contactsRef = collection(db, 'users', user.uid, 'contacts');
        const q = query(contactsRef, orderBy('createdAt', 'desc'));

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const fetched = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Contact[];
          setContacts(fetched);
          setLoading(false);
        }, (error) => {
          console.error("Firestore Error:", error);
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleAddContact = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (newContact.name.trim() && newContact.phone.trim() && newContact.relationship.trim()) {
      try {
        const contactsRef = collection(db, 'users', user.uid, 'contacts');
        await addDoc(contactsRef, {
          ...newContact,
          createdAt: serverTimestamp(),
        });
        setNewContact({ name: '', phone: '', relationship: '' });
        setModalVisible(false);
      } catch (error) {
        Alert.alert("Error", "Could not save contact.");
      }
    } else {
      Alert.alert("Error", "Please fill out all fields.");
    }
  };

  const handleDelete = async (contactId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'contacts', contactId));
    } catch (error) {
      Alert.alert("Error", "Could not delete contact.");
    }
  };

  const handleCall = (phone: string) => {
    const url = `tel:${phone.replace(/\s+/g, '')}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Call not supported.'));
  };

  const ContactItem = ({ item }: { item: Contact }) => {
    const isExpanded = expandedId === item.id;
    const animation = useSharedValue(isExpanded ? 1 : 0);

    useEffect(() => {
      animation.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
    }, [isExpanded]);

    const animatedStyle = useAnimatedStyle(() => ({
      height: interpolate(animation.value, [0, 1], [0, 80], Extrapolate.CLAMP),
      opacity: animation.value,
    }));

    const renderRightActions = () => (
      <TouchableOpacity 
        style={styles.deleteAction} 
        onPress={() => handleDelete(item.id)}
      >
        <Ionicons name="trash-outline" size={24} color="#FFF" />
      </TouchableOpacity>
    );

    return (
      <Swipeable renderRightActions={renderRightActions} containerStyle={styles.swipeableContainer}>
        <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.contactHeader}
            onPress={() => setExpandedId(isExpanded ? null : item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{item.name[0]?.toUpperCase()}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.contactRelationship, { color: colors.icon }]}>{item.relationship}</Text>
            </View>
            <Ionicons size={20} name={isExpanded ? 'chevron-up' : 'chevron-down'} color={colors.primary} />
          </TouchableOpacity>

          <Animated.View style={[styles.contactDetails, { borderTopColor: colors.border, overflow: 'hidden' }, animatedStyle]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.icon }]}>Phone:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{item.phone}</Text>
            </View>
            <TouchableOpacity
              style={[styles.callButton, { backgroundColor: colors.primary }]}
              onPress={() => handleCall(item.phone)}
              activeOpacity={0.8}
            >
              <Ionicons size={20} name="call" color="#FFFFFF" />
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Emergency Contacts</Text>
          <TouchableOpacity
            style={[styles.addButtonTop, { backgroundColor: colors.primary }]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons size={24} name="add" color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{color: colors.icon, marginTop: 10}}>Loading Contacts...</Text>
          </View>
        ) : contacts.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="people-outline" size={60} color={colors.icon} />
            <Text style={[styles.emptyText, { color: colors.icon }]}>No contacts added yet.</Text>
          </View>
        ) : (
          <FlatList
            data={contacts}
            renderItem={({ item }) => <ContactItem item={item} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Modal design remains exactly as you provided */}
        <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Add Emergency Contact</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons size={28} name="close" color={colors.icon} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Name"
                  placeholderTextColor={colors.icon}
                  value={newContact.name}
                  onChangeText={(text) => setNewContact({ ...newContact, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="09..."
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
                  placeholder="Relationship"
                  placeholderTextColor={colors.icon}
                  value={newContact.relationship}
                  onChangeText={(text) => setNewContact({ ...newContact, relationship: text })}
                />
              </View>

              <View style={styles.modalButtonGroup}>
                <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleAddContact}>
                  <Text style={styles.addButtonText}>Add Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', flex: 1 },
  addButtonTop: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  listContent: { paddingHorizontal: 20, paddingBottom: 150 },
  emptyText: { fontSize: 16, marginTop: 10, fontWeight: '500' },
  swipeableContainer: { marginBottom: 12, borderRadius: 12 },
  contactCard: { borderRadius: 12, borderWidth: 1, elevation: 2 },
  contactHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  contactRelationship: { fontSize: 12 },
  contactDetails: { borderTopWidth: 1, paddingHorizontal: 16 },
  detailRow: { flexDirection: 'row', marginVertical: 8 },
  detailLabel: { fontSize: 12, fontWeight: '600', marginRight: 8, minWidth: 50 },
  detailValue: { fontSize: 12, flex: 1 },
  callButton: { flexDirection: 'row', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  callButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
  deleteAction: { backgroundColor: '#F83D3D', justifyContent: 'center', alignItems: 'center', width: 80, height: '100%', borderRadius: 12, marginLeft: 10 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderRadius: 16, padding: 24, width: '90%', elevation: 8 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  modalButtonGroup: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  cancelButtonText: { fontSize: 16, fontWeight: '600' },
  addButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});