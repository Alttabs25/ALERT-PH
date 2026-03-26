import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<any>({ personal: false, relationships: false, medical: false });

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserData(docSnap.data());
            }
          } catch (error) {
            console.error("Fetch error:", error);
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
          router.replace('/(auth)/login');
        }
      });
      return () => unsubscribe();
    }, [])
  );

  // Helper to get the first letter
  const getInitial = () => {
    if (userData?.fullName) return userData.fullName.charAt(0).toUpperCase();
    return "U";
  };

  const sections = [
    { id: 'personal', title: 'Personal Details', items: [
      { label: 'Age', value: userData?.age || 'Not set' },
      { label: 'Birthday', value: userData?.birthday || 'Not set' },
      { label: 'Address', value: userData?.address || 'Not set' }
    ]},
    { id: 'relationships', title: 'Relationships', items: [
      { label: 'Father', value: userData?.father || 'Not set' },
      { label: 'Mother', value: userData?.mother || 'Not set' },
      { label: 'Sister', value: userData?.sister || 'Not set' },
      { label: 'Brother', value: userData?.brother || 'Not set' }
    ]},
    { id: 'medical', title: 'Medical Records', items: [
      { label: 'Blood Type', value: userData?.bloodType || 'Not set' },
      { label: 'Conditions', value: userData?.conditions || 'None' },
      { label: 'Allergies', value: userData?.allergies || 'None' },
      { label: 'Medications', value: userData?.medications || 'None' }
    ]}
  ];

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsCogButton}>
          <Ionicons size={24} name="settings" color={colors.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }}>
        <View style={styles.headerSection}>
          {/* GOOGLE STYLE INITIAL AVATAR */}
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarLetter}>{getInitial()}</Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{userData?.fullName || "User"}</Text>
          <Text style={[styles.userLocation, { color: colors.icon }]}>{userData?.address || "Location not set"}</Text>
        </View>

        {sections.map((section) => (
          <View key={section.id} style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity 
              style={styles.sectionHeader} 
              onPress={() => setExpandedSections({ ...expandedSections, [section.id]: !expandedSections[section.id] })}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              <Ionicons size={20} name={expandedSections[section.id] ? 'chevron-down' : 'chevron-forward'} color={colors.primary} />
            </TouchableOpacity>
            
            {expandedSections[section.id] && section.items.map((item, i) => (
              <View key={i} style={[styles.sectionItem, { borderTopColor: colors.border }]}>
                <Text style={[styles.itemLabel, { color: colors.icon }]}>{item.label}</Text>
                <Text style={[styles.itemValue, { color: colors.text }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        ))}

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={() => router.push('/edit-profile')}>
          <Ionicons size={20} name="pencil" color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  topHeader: { alignItems: 'flex-end', padding: 16 },
  settingsCogButton: { padding: 8 },
  container: { flex: 1 },
  headerSection: { alignItems: 'center', marginBottom: 20 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  avatarLetter: { color: '#FFFFFF', fontSize: 40, fontWeight: 'bold' },
  userName: { fontSize: 24, fontWeight: 'bold', marginTop: 15 },
  userLocation: { fontSize: 14, marginTop: 4 },
  section: { marginHorizontal: 20, marginBottom: 12, borderRadius: 12, borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  sectionTitle: { fontWeight: '600', fontSize: 15 },
  sectionItem: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 0.5 },
  itemLabel: { fontSize: 14 },
  itemValue: { fontSize: 14, fontWeight: 'bold' },
  actionButton: { margin: 20, height: 55, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  actionButtonText: { color: '#FFF', fontWeight: 'bold', marginLeft: 10, fontSize: 16 }
});