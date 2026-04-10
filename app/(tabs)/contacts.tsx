import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  Dimensions,
  FlatList, KeyboardAvoidingView,
  Linking, Modal, Platform, SafeAreaView, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate, interpolate, interpolateColor,
  useAnimatedStyle, useSharedValue, withTiming
} from 'react-native-reanimated';

// Firebase Imports
import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

const { width, height } = Dimensions.get('window');

// --- TYPES ---
interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface FloatingInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: any;
  keyboardType?: 'default' | 'phone-pad' | 'numeric';
  maxLength?: number;
  colors: any;
}

// --- FLOATING INPUT COMPONENT ---
const FloatingInput = ({ label, value, onChangeText, icon, keyboardType = 'default', maxLength, colors }: FloatingInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    animatedValue.value = withTiming(isFocused || value ? 1 : 0, { duration: 200 });
  }, [isFocused, value]);

  const animatedLabelStyle = useAnimatedStyle(() => ({
    top: interpolate(animatedValue.value, [0, 1], [14, -10]),
    left: interpolate(animatedValue.value, [0, 1], [45, 15]),
    fontSize: interpolate(animatedValue.value, [0, 1], [16, 12]),
    color: interpolateColor(animatedValue.value, [0, 1], ['#888', isFocused ? colors.primary : '#888']),
    backgroundColor: animatedValue.value > 0.5 ? colors.card : 'transparent',
    paddingHorizontal: interpolate(animatedValue.value, [0, 1], [0, 6]),
  }));

  return (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color={isFocused ? colors.primary : "#888"} style={styles.inputIcon} />
      <TextInput
        style={[styles.styledInput, { color: colors.text, borderColor: isFocused ? colors.text : 'grey', backgroundColor: colors.background }]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType}
        maxLength={maxLength}
        placeholder=""
      />
      <Animated.Text style={[styles.inputLabel, animatedLabelStyle]}>{label}</Animated.Text>
    </View>
  );
};

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
          const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Contact[];
          setContacts(fetched);
          setLoading(false);
        }, (error) => { setLoading(false); });
        return () => unsubscribeSnapshot();
      } else { setLoading(false); }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleAddContact = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!newContact.name.trim() || !newContact.phone.trim() || !newContact.relationship.trim()) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }
    try {
      await addDoc(collection(db, 'users', user.uid, 'contacts'), { ...newContact, createdAt: serverTimestamp() });
      setNewContact({ name: '', phone: '', relationship: '' });
      setModalVisible(false);
    } catch (error) { Alert.alert("Error", "Could not save contact."); }
  };

  const handleDelete = async (contactId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    try { await deleteDoc(doc(db, 'users', user.uid, 'contacts', contactId)); } catch (e) { Alert.alert("Error", "Delete failed."); }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => Alert.alert('Error', 'Call not supported.'));
  };

  const ContactItem = ({ item }: { item: Contact }) => {
    const isExpanded = expandedId === item.id;
    const animation = useSharedValue(isExpanded ? 1 : 0);
    useEffect(() => { animation.value = withTiming(isExpanded ? 1 : 0, { duration: 300 }); }, [isExpanded]);
    const animatedStyle = useAnimatedStyle(() => ({
      height: interpolate(animation.value, [0, 1], [0, 80], Extrapolate.CLAMP),
      opacity: animation.value,
    }));
    const renderRightActions = () => (
      <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(item.id)}>
        <Ionicons name="trash-outline" size={24} color="#FFF" />
      </TouchableOpacity>
    );
    return (
      <Swipeable renderRightActions={renderRightActions} containerStyle={styles.swipeableContainer}>
        <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.contactHeader} onPress={() => setExpandedId(isExpanded ? null : item.id)} activeOpacity={0.7}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}><Text style={styles.avatarText}>{item.name[0]?.toUpperCase()}</Text></View>
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
            <TouchableOpacity style={[styles.callButton, { backgroundColor: colors.primary }]} onPress={() => handleCall(item.phone)}>
              <Ionicons size={20} name="call" color="#FFFFFF" /><Text style={styles.callButtonText}>Call</Text>
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
          <TouchableOpacity style={[styles.addButtonTop, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
            <Ionicons size={24} name="add" color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : (
          <FlatList
            data={contacts}
            renderItem={({ item }) => <ContactItem item={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}

        <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
           {/* THIS IS THE KEY: The KeyboardAvoidingView must wrap the entire Modal interior */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
          >
            <ScrollView 
              contentContainerStyle={styles.modalScrollContainer} 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.modalHeaderRow}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Add Contact</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeIconBtn}>
                    <Ionicons name="close" size={28} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <FloatingInput label="Full Name" icon="person-outline" value={newContact.name} onChangeText={(t) => setNewContact({...newContact, name: t})} colors={colors} />
                <FloatingInput label="Contact Number" icon="call-outline" value={newContact.phone} onChangeText={(t) => setNewContact({...newContact, phone: t.replace(/[^0-9]/g, '').slice(0, 11)})} keyboardType="phone-pad" colors={colors} />
                <FloatingInput label="Relationship" icon="people-outline" value={newContact.relationship} onChangeText={(t) => setNewContact({...newContact, relationship: t})} colors={colors} />

                <View style={styles.modalButtonGroup}>
                  <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setModalVisible(false)}>
                    <Text style={[styles.cancelBtnText, { color: colors.text }]}>CANCEL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAddContact}>
                    <Text style={styles.saveBtnText}>SAVE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  addButtonTop: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  swipeableContainer: { marginBottom: 12 },
  contactCard: { borderRadius: 16, borderWidth: 1, elevation: 2 },
  contactHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: 'bold' },
  contactRelationship: { fontSize: 12 },
  contactDetails: { borderTopWidth: 1, paddingHorizontal: 16 },
  detailRow: { flexDirection: 'row', marginVertical: 8 },
  detailLabel: { fontSize: 12, fontWeight: '600', marginRight: 8, minWidth: 50 },
  detailValue: { fontSize: 12, flex: 1 },
  callButton: { flexDirection: 'row', borderRadius: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  callButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
  deleteAction: { backgroundColor: '#F83D3D', justifyContent: 'center', alignItems: 'center', width: 70, height: '100%', borderRadius: 16, marginLeft: 10 },
  
  // MODAL CENTERING LOGIC (MATCHING LOGIN.TSX)
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalScrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', // This keeps the card in the middle vertically
    alignItems: 'center', 
    width: width, // Important to ensure the ScrollView takes full width
    paddingVertical: 20 
  },
  card: { 
    width: width - 40, 
    padding: 25, 
    borderRadius: 35, 
    borderWidth: 1, 
    elevation: 10, 
    alignSelf: 'center' 
  },
  modalHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 25 
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    letterSpacing: 1 
  },
  closeIconBtn: { 
    padding: 4 
  },
  
  // INPUT STYLES
  inputContainer: { position: 'relative', marginBottom: 25, width: '100%' },
  inputIcon: { position: 'absolute', left: 15, top: 15, zIndex: 1 },
  styledInput: { width: '100%', padding: 14, paddingLeft: 45, fontSize: 16, borderWidth: 1.5, borderRadius: 30 },
  inputLabel: { position: 'absolute', pointerEvents: 'none', fontWeight: '500' },
  
  // BUTTONS
  modalButtonGroup: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  saveBtn: { flex: 1, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
});