import EmergencyLoader from '@/components/EmergencyLoader'; // <-- IMPORTED YOUR NEW LOADER!
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0.5, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: isLogin ? -20 : 20, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    });
  }, [isLogin]);

  const handleAuth = () => {
    if (isLogin && (!email || !password)) return;
    if (!isLogin && (!fullName || !email || !contactNumber || !password)) return;

    setIsLoading(true);

    // Fake delay to show off the awesome animation and let Android breathe
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 2500); // Bumped to 2.5 seconds so you can actually see the ambulance drive!
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.primary }]}>ALERT PH</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>Emergency Safety App</Text>

          <View style={[styles.toggleContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.toggleButton, isLogin && { backgroundColor: colors.primary }]}
              onPress={() => setIsLogin(true)}
              disabled={isLoading}
            >
              <Text style={[styles.toggleText, { color: isLogin ? '#FFFFFF' : colors.text }]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isLogin && { backgroundColor: colors.primary }]}
              onPress={() => setIsLogin(false)}
              disabled={isLoading}
            >
              <Text style={[styles.toggleText, { color: !isLogin ? '#FFFFFF' : colors.text }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <Animated.View
            style={[
              styles.card,
              { 
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {isLogin ? (
              <>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Login</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Email"
                  placeholderTextColor={colors.icon}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  editable={!isLoading}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Password"
                  placeholderTextColor={colors.icon}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </>
            ) : (
              <>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Sign Up</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Full Name"
                  placeholderTextColor={colors.icon}
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!isLoading}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Email"
                  placeholderTextColor={colors.icon}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  editable={!isLoading}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Contact Number"
                  placeholderTextColor={colors.icon}
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Password"
                  placeholderTextColor={colors.icon}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </>
            )}

            {/* MAGIC HAPPENS HERE: Show the ambulance OR the button */}
            {isLoading ? (
              <View style={styles.loaderWrapper}>
                <EmergencyLoader />
                <Text style={[styles.loadingText, { color: colors.primary }]}>
                  {isLogin ? 'Authenticating...' : 'Creating Account...'}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={handleAuth}
              >
                <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
              </TouchableOpacity>
            )}
            
          </Animated.View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20, minHeight: '100%' },
  title: { fontSize: 42, fontWeight: 'bold', marginBottom: 8, letterSpacing: 2, marginTop: 60 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  toggleContainer: { flexDirection: 'row', width: '100%', borderRadius: 12, borderWidth: 1, marginBottom: 20, padding: 4, gap: 4 },
  toggleButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toggleText: { fontSize: 14, fontWeight: '600' },
  card: { width: '100%', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, borderWidth: 1 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, fontSize: 14 },
  button: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginTop: 10, alignItems: 'center', justifyContent: 'center', minHeight: 50 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  
  // New styles for the ambulance loader area
  loaderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    height: 120, // Gives the animation enough room to breathe
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});