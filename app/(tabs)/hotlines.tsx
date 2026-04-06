import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
// Added Firebase imports
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function HotlinesScreen() {
  const [searchText, setSearchText] = useState('');
  const [hotlines, setHotlines] = useState<any[]>([]); // Dynamic state
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // --- FETCH DYNAMIC DATA FROM FIREBASE ---
  useEffect(() => {
    const q = query(collection(db, "hotlines"), orderBy("name", "asc"));
    
    // Real-time listener: if you change a number in Firebase, it updates here instantly
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hotlineData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHotlines(hotlineData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching hotlines: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- SEARCH LOGIC (STAYS THE SAME) ---
  const filteredHotlines = hotlines.filter((hotline) =>
    hotline.name?.toLowerCase().includes(searchText.toLowerCase()) || 
    hotline.phone?.includes(searchText)
  );

  const handleCall = (phone: string) => {
    const formattedNumber = phone.replace(/\s+/g, '');
    const url = `tel:${formattedNumber}`;
    Linking.canOpenURL(url).then((supported) => {
      if (!supported) Alert.alert('Error', 'This device does not support phone calls.');
      else Linking.openURL(url);
    });
  };

  const renderHotlineItem = ({ item }: any) => (
    <View style={[styles.hotlineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.hotlineContent}>
        <View style={[styles.phoneIcon, { backgroundColor: colors.primary }]}>
          <Ionicons size={24} name="call" color="#FFFFFF" />
        </View>
        <View style={styles.hotlineInfo}>
          <Text style={[styles.hotlineName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.hotlineDescription, { color: colors.icon }]}>{item.description}</Text>
          <Text style={[styles.hotlinePhone, { color: colors.primary }]}>{item.phone}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.quickCallButton, { backgroundColor: colors.primary }]} 
        onPress={() => handleCall(item.phone)} 
        activeOpacity={0.7}
      >
        <Ionicons size={20} name="call" color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Emergency Hotlines</Text>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons size={20} name="search" color={colors.icon} />
        <TextInput 
          style={[styles.searchInput, { color: colors.text }]} 
          placeholder="Search hotlines..." 
          placeholderTextColor={colors.icon} 
          value={searchText} 
          onChangeText={setSearchText} 
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList 
          data={filteredHotlines} 
          renderItem={renderHotlineItem} 
          keyExtractor={(item) => item.id} 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.listContent} 
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: colors.icon, marginTop: 20 }}>No hotlines found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  searchContainer: { marginHorizontal: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 12, fontSize: 14 },
  listContent: { paddingHorizontal: 20, paddingBottom: 150 },
  hotlineCard: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  hotlineContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  phoneIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  hotlineInfo: { flex: 1 },
  hotlineName: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  hotlineDescription: { fontSize: 12, marginBottom: 4 },
  hotlinePhone: { fontSize: 14, fontWeight: 'bold' },
  quickCallButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});