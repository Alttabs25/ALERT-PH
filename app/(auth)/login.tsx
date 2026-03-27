import EmergencyLoader from '@/components/EmergencyLoader';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Eye Toggle State
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

      {/* EYE ICON TOGGLE */}
      {secureTextEntry && (
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Ionicons 
            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
            size={22} 
            color="#888" 
          />
        </TouchableOpacity>
      )}

      <Animated.Text style={[styles.inputLabel, animatedLabelStyle]}>{label}</Animated.Text>
    </View>
  );
};

export default function AuthScreen() {
  const router = useRouter();
  const colors = Colors[useColorScheme() ?? 'light'];
  
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(activeTab === 'login' ? 0 : (width - 110) / 2) }],
  }));

  useEffect(() => {
    async function loadIcons() {
      try {
        await Font.loadAsync(Ionicons.font);
      } catch (e) {
        console.warn("Font loading failed", e);
      } finally {
        setFontsLoaded(true);
      }
    }
    loadIcons();
  }, []);

  const handleAuth = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) return Alert.alert("Error", "Please fill in all fields");
    setShowLoader(true); 

    try {
      if (activeTab === 'login') {
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        router.replace('/(tabs)'); 
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          fullName: fullName.trim(),
          email: cleanEmail,
          contactNumber: contactNumber.trim(),
          createdAt: new Date().toISOString(),
        });
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      setShowLoader(false);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert("Account Exists", "This email is already registered. Switch to Login.");
      } else if (error.code === 'auth/invalid-credential') {
        Alert.alert("Login Failed", "Incorrect email or password.");
      } else {
        Alert.alert("Error", error.message);
      }
    }
  };

  if (!fontsLoaded || showLoader) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmergencyLoader />
        <Text style={[styles.loaderText, { color: colors.text }]}>
          {!fontsLoaded ? "Preparing Assets..." : "Deploying Rescue Team..."}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(200)} style={styles.logoHeader}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Ionicons name="shield-checkmark" size={45} color="#FFF" />
          </View>
          <Text style={[styles.logoText, { color: colors.text }]}>ALERT PH</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(800)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.toggleContainer, { backgroundColor: useColorScheme() === 'dark' ? '#2A2A2A' : '#F0F0F0' }]}>
            <Animated.View style={[styles.slider, sliderStyle, { backgroundColor: colors.primary }]} />
            <TouchableOpacity style={styles.toggleBtn} onPress={() => setActiveTab('login')}>
              <Text style={[styles.toggleText, { color: activeTab === 'login' ? '#FFF' : colors.text }]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toggleBtn} onPress={() => setActiveTab('signup')}>
              <Text style={[styles.toggleText, { color: activeTab === 'signup' ? '#FFF' : colors.text }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {activeTab === 'signup' && (
              <>
                <FloatingInput label="Full Name" icon="person-outline" value={fullName} onChangeText={setFullName} colors={colors} />
                <FloatingInput label="Contact Number" icon="call-outline" value={contactNumber} onChangeText={setContactNumber} colors={colors} />
              </>
            )}
            <FloatingInput label="Email" icon="mail-outline" value={email} onChangeText={setEmail} colors={colors} />
            <FloatingInput label="Password" icon="lock-closed-outline" value={password} onChangeText={setPassword} secureTextEntry colors={colors} />
            
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
  loaderText: { marginTop: 20, fontSize: 16, fontWeight: '600', letterSpacing: 1, opacity: 0.8 }
});