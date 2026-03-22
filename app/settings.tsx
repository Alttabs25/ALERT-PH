import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isDarkMode, toggleDarkMode } = useTheme();
  const router = useRouter();

  const SettingsItem = ({ icon, label, onPress, showSwitch, switchValue, onSwitchChange, iconColor, isLast }: any) => (
    <TouchableOpacity 
      style={[styles.itemRow, !isLast && { borderBottomColor: colors.border, borderBottomWidth: 1 }]} 
      onPress={onPress}
      disabled={showSwitch}
      activeOpacity={0.7}
    >
      <View style={styles.settingLabelContainer}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <Ionicons size={18} name={icon} color="#FFFFFF" />
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
          <SettingsItem icon="log-out" label="Logout" isLast iconColor="rgba(158, 158, 158, 0.2)" onPress={() => router.replace('/(auth)/login')} />
        </View>
        
        <Text style={[styles.versionText, { color: colors.icon }]}>Version 1.0.26</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // FIX: This forces Android to push the content down below the battery/clock icons!
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  leftCol: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerCol: {
    flex: 1,
    alignItems: 'center',
  },
  rightCol: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 14,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 12,
    marginBottom: 40,
  }
});