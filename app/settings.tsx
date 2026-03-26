import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

// Firebase Imports
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isDarkMode, toggleDarkMode } = useTheme();
  const router = useRouter();

  // FIX: Universal Logout Logic that works on Web
  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await signOut(auth);
        // Clear session markers
        if (Platform.OS === 'web') {
          localStorage.clear(); 
        }
        router.replace('/(auth)/login');
      } catch (error) {
        console.error("Logout Error:", error);
        if (Platform.OS === 'web') {
          window.alert("Failed to log out.");
        } else {
          Alert.alert("Error", "Failed to log out.");
        }
      }
    };

    if (Platform.OS === 'web') {
      // Browsers handle window.confirm much better than Alert.alert
      if (window.confirm("Are you sure you want to log out of ALERT PH?")) {
        await performLogout();
      }
    } else {
      // Mobile native Alert
      Alert.alert(
        "Logout",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Logout", style: "destructive", onPress: performLogout }
        ]
      );
    }
  };

  const SettingsItem = ({ icon, label, onPress, showSwitch, switchValue, onSwitchChange, iconColor, isLast }: any) => (
    <TouchableOpacity 
      style={[styles.itemRow, !isLast && { borderBottomColor: colors.border, borderBottomWidth: 1 }]} 
      onPress={onPress}
      // Only disable if there is a switch AND no onPress action
      disabled={showSwitch && !onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLabelContainer}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <Ionicons size={18} name={icon} color={showSwitch ? "#FFFFFF" : colors.primary} />
        </View>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      </View>
      
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.icon, true: colors.primary }}
          thumbColor={switchValue ? colors.primary : colors.card}
        />
      ) : (
        <Ionicons size={18} name="chevron-forward" color={colors.icon} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.leftCol} onPress={() => router.back()}>
          <Ionicons size={22} name="chevron-back" color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.centerCol}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        </View>
        <View style={styles.rightCol}></View>
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionHeader, { color: colors.icon }]}>General</Text>
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingsItem icon="notifications" label="Notification" iconColor="rgba(76, 175, 80, 0.15)" showSwitch switchValue={true} />
          <SettingsItem icon={isDarkMode ? "moon" : "sunny"} label="Dark Mode" iconColor="rgba(33, 150, 243, 0.15)" showSwitch switchValue={isDarkMode} onSwitchChange={toggleDarkMode} />
          <SettingsItem icon="star" label="Rate App" iconColor="rgba(255, 193, 7, 0.15)" />
          <SettingsItem icon="share" label="Share App" iconColor="rgba(156, 39, 176, 0.15)" />
        </View>

        <Text style={[styles.sectionHeader, { color: colors.icon }]}>App Info</Text>
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingsItem icon="shield-checkmark" label="Privacy Policy" iconColor="rgba(63, 81, 181, 0.15)" />
          <SettingsItem icon="document-text" label="Terms and Conditions" iconColor="rgba(121, 85, 72, 0.15)" />
          <SettingsItem icon="mail" label="Contact" iconColor="rgba(244, 67, 54, 0.15)" />
          {/* LOGOUT BUTTON */}
          <SettingsItem 
            icon="log-out" 
            label="Logout" 
            isLast 
            iconColor="rgba(244, 67, 54, 0.15)" 
            onPress={handleLogout} 
          />
        </View>
        
        <Text style={[styles.versionText, { color: colors.icon }]}>Version 1.0.26</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc' },
  leftCol: { width: 40, alignItems: 'flex-start' },
  centerCol: { flex: 1, alignItems: 'center' },
  rightCol: { width: 40 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  sectionHeader: { fontSize: 13, fontWeight: '600', marginTop: 24, marginBottom: 8, textTransform: 'uppercase' },
  listCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15 },
  settingLabelContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 16, fontWeight: '500', marginLeft: 14 },
  versionText: { textAlign: 'center', marginTop: 30, fontSize: 12, marginBottom: 40 }
});