import EmergencyLoader from '@/components/EmergencyLoader';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeInDown,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

// Firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

const { width } = Dimensions.get('window');

// --- FLOATING INPUT COMPONENT ---
interface FloatingInputProps {
  label: string; 
  value: string; 
  onChangeText: (text: string) => void;
  icon: any; 
  secureTextEntry?: boolean; 
  colors: any;
}

const FloatingInput = ({ label, value, onChangeText, icon, secureTextEntry = false, colors }: FloatingInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); 
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
        style={[styles.styledInput, { color: colors.text, borderColor: isFocused ? colors.text : 'grey' }]}
        value={value} 
        onChangeText={onChangeText} 
        onFocus={() => setIsFocused(true)} 
        onBlur={() => setIsFocused(false)}
        secureTextEntry={secureTextEntry && !isPasswordVisible} 
        placeholder="" 
      />
      {secureTextEntry && (
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
          <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={22} color="#888" />
        </TouchableOpacity>
      )}
      <Animated.Text style={[styles.inputLabel, animatedLabelStyle]}>{label}</Animated.Text>
    </View>
  );
};

// --- MAIN AUTH SCREEN ---
export default function AuthScreen() {
  const router = useRouter();
  const themeName = useColorScheme();
  const colors = Colors[themeName ?? 'light'];
  
  const [showLoader, setShowLoader] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateContactNumber = (number: string) => {
    const numberRegex = /^\d+$/;
    return numberRegex.test(number) && number.length === 11;
  };

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(activeTab === 'login' ? 0 : (width - 110) / 2) }],
  }));

  const handleAuth = async () => {
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (activeTab === 'signup') {
      if (!fullName.trim()) {
        setError('Full name is required');
        return;
      }

      if (!validateEmail(cleanEmail)) {
        setError('Please enter a valid email address');
        return;
      }

      if (!contactNumber.trim()) {
        setError('Contact number is required');
        return;
      }

      if (!validateContactNumber(contactNumber)) {
        setError('Contact number must be exactly 11 digits');
        return;
      }

      if (!confirmPassword) {
        setError('Please confirm your password');
        return;
      }

      if (cleanPassword !== confirmPassword.trim()) {
        setError('Passwords do not match');
        return;
      }
    }

    setShowLoader(true);

    try {
      if (activeTab === 'login') {
        // This creates the session that is "remembered"
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      } else {
        // Create user and save their profile
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          fullName: fullName.trim(),
          email: cleanEmail,
          contactNumber: contactNumber.trim(),
          createdAt: new Date().toISOString(),
          emergencyStatus: { isActive: false } 
        });
      }
      // Note: We don't need router.replace here because the _layout.tsx 
      // is watching the auth state and will redirect us automatically!
    } catch (error: any) {
      setShowLoader(false);
      let message = error.message;
      if (error.code === 'auth/email-already-in-use') message = "Email already registered.";
      if (error.code === 'auth/invalid-credential') message = "Incorrect email or password.";
      setError(message);
    }
  };

  if (showLoader) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmergencyLoader />
        <Text style={[styles.loaderText, { color: colors.text }]}>Deploying Rescue Team...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.delay(200)} style={styles.logoHeader}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Ionicons name="shield-checkmark" size={45} color="#FFF" />
          </View>
          <Text style={[styles.logoText, { color: colors.text }]}>ALERT PH</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(800)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.toggleContainer, { backgroundColor: themeName === 'dark' ? '#2A2A2A' : '#F0F0F0' }]}>
            <Animated.View style={[styles.slider, sliderStyle, { backgroundColor: colors.primary }]} />
            <TouchableOpacity style={styles.toggleBtn} onPress={() => { setActiveTab('login'); setError(''); setConfirmPassword(''); }}>
              <Text style={[styles.toggleText, { color: activeTab === 'login' ? '#FFF' : colors.text }]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toggleBtn} onPress={() => { setActiveTab('signup'); setError(''); setConfirmPassword(''); }}>
              <Text style={[styles.toggleText, { color: activeTab === 'signup' ? '#FFF' : colors.text }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {activeTab === 'signup' && (
              <>
                <FloatingInput label="Full Name" icon="person-outline" value={fullName} onChangeText={setFullName} colors={colors} />
                <FloatingInput 
                  label="Contact Number" 
                  icon="call-outline" 
                  value={contactNumber} 
                  onChangeText={(value) => {
                    // Only allow numbers, max 11 digits
                    const filtered = value.replace(/[^0-9]/g, '').slice(0, 11);
                    setContactNumber(filtered);
                  }} 
                  colors={colors} 
                />
              </>
            )}
            <FloatingInput label="Email" icon="mail-outline" value={email} onChangeText={setEmail} colors={colors} />
            <FloatingInput label="Password" icon="lock-closed-outline" value={password} onChangeText={setPassword} secureTextEntry colors={colors} />
            
            {activeTab === 'signup' && (
              <FloatingInput label="Confirm Password" icon="lock-closed-outline" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry colors={colors} />
            )}

            {error ? (
              <Text style={[styles.errorText, { color: '#FF6B6B' }]}>{error}</Text>
            ) : null}
            
            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: colors.primary }]} onPress={handleAuth}>
              <Text style={styles.mainBtnText}>{activeTab === 'login' ? 'LOGIN' : 'SIGN UP'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  logoHeader: { alignItems: 'center', marginBottom: 25 },
  logoCircle: { width: 80, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 8 },
  logoText: { fontSize: 26, fontWeight: '900', letterSpacing: 3 },
  card: { width: width - 50, padding: 25, borderRadius: 35, borderWidth: 1, elevation: 10, alignSelf: 'center' },
  toggleContainer: { flexDirection: 'row', height: 50, borderRadius: 25, marginBottom: 35, position: 'relative' },
  slider: { position: 'absolute', width: '50%', height: '100%', borderRadius: 25 },
  toggleBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  toggleText: { fontWeight: 'bold', fontSize: 15 },
  form: { width: '100%' },
  inputContainer: { position: 'relative', marginBottom: 25, width: '100%' },
  inputIcon: { position: 'absolute', left: 15, top: 15, zIndex: 1 },
  eyeIcon: { position: 'absolute', right: 15, top: 15, zIndex: 2 },
  styledInput: { width: '100%', padding: 14, paddingLeft: 45, paddingRight: 45, fontSize: 16, borderWidth: 1.5, borderRadius: 30 },
  inputLabel: { position: 'absolute', pointerEvents: 'none', fontWeight: '500' },
  mainBtn: { height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  mainBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 18, letterSpacing: 2 },
  loaderText: { marginTop: 20, fontSize: 16, fontWeight: '600', letterSpacing: 1, opacity: 0.8 },
  errorText: { fontSize: 12, marginBottom: 16, textAlign: 'center', fontWeight: '500', marginTop: -15 }
});