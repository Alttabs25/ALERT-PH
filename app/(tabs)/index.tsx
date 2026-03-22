import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Linking, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const handleEmergencyCall = () => {
    const url = 'tel:911';
    Linking.canOpenURL(url).then((supported) => {
      if (!supported) Alert.alert('Error', 'This device does not support phone calls.');
      else Linking.openURL(url);
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>Welcome</Text>
          <Text style={[styles.appName, { color: colors.primary }]}>ALERT PH</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity style={[styles.emergencyButton, { backgroundColor: colors.primary }]} activeOpacity={0.8} onPress={handleEmergencyCall}>
            <Ionicons size={64} name="call" color="#FFFFFF" />
            <Text style={styles.emergencyButtonText}>Emergency Call</Text>
            <Text style={styles.emergencyButtonSubtext}>Tap to call emergency services</Text>
          </TouchableOpacity>

          <View style={styles.dashboardGrid}>
            <TouchableOpacity style={[styles.dashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/map')} activeOpacity={0.7}>
              <Ionicons size={32} name="map" color={colors.primary} />
              <Text style={[styles.dashboardCardTitle, { color: colors.text }]}>Find Help</Text>
              <Text style={[styles.dashboardCardSubtext, { color: colors.icon }]}>Nearby services</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.dashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/hotlines')} activeOpacity={0.7}>
              <Ionicons size={32} name="call" color={colors.primary} />
              <Text style={[styles.dashboardCardTitle, { color: colors.text }]}>Hotlines</Text>
              <Text style={[styles.dashboardCardSubtext, { color: colors.icon }]}>Quick access</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.dashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/contacts')} activeOpacity={0.7}>
              <Ionicons size={32} name="people" color={colors.primary} />
              <Text style={[styles.dashboardCardTitle, { color: colors.text }]}>Contacts</Text>
              <Text style={[styles.dashboardCardSubtext, { color: colors.icon }]}>Emergency contacts</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.dashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => alert('Location Sharing coming soon!')} activeOpacity={0.7}>
              <Ionicons size={32} name="location" color={colors.primary} />
              <Text style={[styles.dashboardCardTitle, { color: colors.text }]}>Location</Text>
              <Text style={[styles.dashboardCardSubtext, { color: colors.icon }]}>Share location</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.tipsSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.tipsSectionTitle, { color: colors.text }]}>Safety Tips</Text>
            <Text style={[styles.tipsText, { color: colors.icon }]}>
              • Always keep your emergency contacts updated{'\n'}
              • Share your location with trusted people{'\n'}
              • Keep your phone charged{'\n'}
              • Know your exact location when calling for help
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, marginBottom: 10 },
  greeting: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  appName: { fontSize: 32, fontWeight: 'bold', letterSpacing: 1 },
  content: { paddingHorizontal: 20 },
  emergencyButton: { borderRadius: 20, padding: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  emergencyButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginTop: 12 },
  emergencyButtonSubtext: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, marginTop: 4 },
  dashboardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  dashboardCard: { width: '48%', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  dashboardCardTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 8 },
  dashboardCardSubtext: { fontSize: 11, marginTop: 2 },
  tipsSection: { borderRadius: 16, padding: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tipsSectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  tipsText: { fontSize: 12, lineHeight: 22 },
});