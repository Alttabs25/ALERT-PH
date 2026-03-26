import EmergencyLoader from '@/components/EmergencyLoader';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

// --- NEW IMPORTS FOR ICON FIX ---
import * as Font from 'expo-font';

// Firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

const { width } = Dimensions.get('window');

interface FloatingInputProps {
  label: string; value: string; onChangeText: (text: string) => void;
  icon: any; secureTextEntry?: boolean; colors: any;
}

const FloatingInput = ({ label, value, onChangeText, icon, secureTextEntry = false, colors }: FloatingInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useSharedValue(value ? 1 : 0);
  useEffect(() => { animatedValue.value = withTiming(isFocused || value ? 1 : 0, { duration: 200 }); }, [isFocused, value]);
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
      <TextInput style={[styles.styledInput, { color: colors.text, borderColor: isFocused ? colors.text : 'grey' }]}
        value={value} onChangeText={onChangeText} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
        secureTextEntry={secureTextEntry} placeholder="" />
      <Animated.Text style={[styles.inputLabel, animatedLabelStyle]}>{label}</Animated.Text>
    </View>
  );
};

export default function AuthScreen() {
  const router = useRouter();
  const colors = Colors[useColorScheme() ?? 'light'];
  
  // --- STATE FOR FONT LOADING ---
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  // Load Ionicons explicitly for Web Hosting
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

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(activeTab === 'login' ? 0 : (width - 110) / 2) }],
  }));

  const handleAuth = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill in all fields");
    setShowLoader(true); 

    try {
      if (activeTab === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          fullName, email, contactNumber, createdAt: new Date().toISOString(),
        });
      }
      setTimeout(() => { router.replace('/(tabs)'); }, 2500);
    } catch (error: any) {
      setShowLoader(false);
      Alert.alert("Failed", error.message);
    }
  };

  // Block rendering until fonts are ready OR show ambulance if logging in
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeInDown.delay(200)} style={styles.logoHeader}>
        <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}><Ionicons name="shield-checkmark" size={45} color="#FFF" /></View>
        <Text style={[styles.logoText, { color: colors.text }]}>ALERT PH</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(800)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.toggleContainer, { backgroundColor: useColorScheme() === 'dark' ? '#2A2A2A' : '#F0F0F0' }]}>
          <Animated.View style={[styles.slider, sliderStyle, { backgroundColor: colors.primary }]} />
          <TouchableOpacity style={styles.toggleBtn} onPress={() => setActiveTab('login')}><Text style={[styles.toggleText, { color: activeTab === 'login' ? '#FFF' : colors.text }]}>Login</Text></TouchableOpacity>
          <TouchableOpacity style={styles.toggleBtn} onPress={() => setActiveTab('signup')}><Text style={[styles.toggleText, { color: activeTab === 'signup' ? '#FFF' : colors.text }]}>Sign Up</Text></TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 40 },
  logoHeader: { alignItems: 'center', marginBottom: 25 },
  logoCircle: { width: 80, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 8 },
  logoText: { fontSize: 26, fontWeight: '900', letterSpacing: 3 },
  card: { width: width - 50, padding: 25, borderRadius: 35, borderWidth: 1, elevation: 10, alignSelf: 'center' },
  toggleContainer: { flexDirection: 'row', height: 50, borderRadius: 25, marginBottom: 35, position: 'relative' },
  slider: { position: 'absolute', width: '50%', height: '100%', borderRadius: 25 },
  toggleBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  toggleText: { fontWeight: 'bold', fontSize: 15 },
  form: { width: '100%' },
  inputContainer: { position: 'relative', marginBottom: 25 },
  inputIcon: { position: 'absolute', left: 15, top: 15, zIndex: 1 },
  styledInput: { width: '100%', padding: 14, paddingLeft: 45, fontSize: 16, borderWidth: 1.5, borderRadius: 30 },
  inputLabel: { position: 'absolute', pointerEvents: 'none', fontWeight: '500' },
  mainBtn: { height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  mainBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 18, letterSpacing: 2 },
  loaderText: { marginTop: 20, fontSize: 16, fontWeight: '600', letterSpacing: 1, opacity: 0.8 }
});