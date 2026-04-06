import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

// Firebase Imports
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isDarkMode, toggleDarkMode } = useTheme();
  const router = useRouter();
  
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);

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
          <SettingsItem icon="shield-checkmark" label="Privacy Policy" iconColor="rgba(63, 81, 181, 0.15)" onPress={() => setPrivacyModalVisible(true)} />
          <SettingsItem icon="document-text" label="Terms and Conditions" iconColor="rgba(121, 85, 72, 0.15)" onPress={() => setTermsModalVisible(true)} />
          <SettingsItem icon="mail" label="Contact" iconColor="rgba(244, 67, 54, 0.15)" onPress={() => setContactModalVisible(true)} />
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

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setPrivacyModalVisible(false)}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Privacy Policy</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalText, { color: colors.text }]}>
              <Text style={{ fontWeight: 'bold' }}>Privacy Policy for ALERT PH                                                    </Text>
              
              <Text style={{ fontWeight: '600' }}>1. Information We Collect </Text>
              We collect information you provide including your full name, email address, contact number, and emergency status information. This data is securely stored to help emergency responders reach you when needed.
              
              {'\n\n'}<Text style={{ fontWeight: '600' }}>2. How We Use Your Information </Text>
              Your information is used exclusively to provide emergency alert services. We may contact you via the provided phone number or email during emergencies. Your location data aids in emergency response.
              
              {'\n\n'}<Text style={{ fontWeight: '600' }}>3. Data Security </Text>
              We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
              
              {'\n\n'}<Text style={{ fontWeight: '600' }}>4. Third-Party Sharing </Text>
              We do not sell or share your personal information with third parties without your explicit consent, except when required by law for emergency response purposes.
              
              {'\n\n'}<Text style={{ fontWeight: '600' }}>5. Contact Us </Text>
              If you have privacy concerns, please contact us at privacy@alertph.com
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Terms and Conditions Modal */}
      <Modal
        visible={termsModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setTermsModalVisible(false)}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Terms and Conditions</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalText, { color: colors.text }]}>
              <Text style={{ fontWeight: 'bold' }}>Terms and Conditions for ALERT PH                            </Text>
              
              <Text style={{ fontWeight: '600' }}>1. Acceptance of Terms </Text>
              By using ALERT PH, you agree to comply with these terms and conditions. If you do not agree, please do not use the application.
              
              {'\n\n'}<Text style={{ fontWeight: '600' }}>2. Use License </Text>
              ALERT PH grants you a limited, non-exclusive, non-transferable license to use the application for personal emergency alert purposes.
              
              {'\n\n'}<Text style={{ fontWeight: '600' }}>3. Disclaimer </Text>
              The application is provided "as is" without warranties. We are not liable for delays in emergency notifications due to network issues or technical failures.
              
              {'\n\n'}<Text style={{ fontWeight: '600' }}>4. User Responsibilities </Text>
              You are responsible for maintaining accurate and current information in your profile. You agree not to use the service for illegal purposes.
              
              {'\n\n'}<Text style={{ fontWeight: '600' }}>5. Limitation of Liability </Text>
              ALERT PH shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use or inability to use the service.
              
              {'\n\n'}<Text style={{ fontWeight: '600' }}>6. Changes to Terms </Text>
              We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of changes.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Contact Information Modal */}
      <Modal
        visible={contactModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setContactModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setContactModalVisible(false)}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Contact Us</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalText, { color: colors.text }]}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Get in Touch                                                                      </Text>
              
              <Text style={{ fontWeight: '600' }}>📧 Email Support </Text>
              support@alertph.com{'\n\n'}
              
              <Text style={{ fontWeight: '600' }}>📱 Emergency Hotline </Text>
              +63 999 445 7512{'\n\n'}
              
              <Text style={{ fontWeight: '600' }}>🕐 Business Hours </Text>
              Monday - Friday: 9:00 AM - 6:00 PM{'\n'}
              Saturday - Sunday: 9:00 AM - 12:00 PM{'\n'}
              (Philippine Standard Time){'\n\n'}
              
              <Text style={{ fontWeight: '600' }}>📍 Office Address </Text>
              ALERT PH Operations Center{'\n'}
              Manila, Philippines{'\n\n'}
              
              <Text style={{ fontWeight: '600' }}>💬 Social Media </Text>
              Facebook: @AlertPH{'\n'}
              Twitter: @AlertPH_Alerts{'\n'}
              Instagram: @alertph_official{'\n\n'}
              
              <Text style={{ fontWeight: '600' }}>🆘 Report Issues\n</Text>
              If you experience any issues with the app, please email your detailed report to support@alertph.com with a screenshot if possible.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  versionText: { textAlign: 'center', marginTop: 30, fontSize: 12, marginBottom: 40 },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: StyleSheet.hairlineWidth },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalContent: { flex: 1, padding: 20 },
  modalText: { fontSize: 14, lineHeight: 22 }
});