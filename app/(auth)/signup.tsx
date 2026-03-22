import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSignup = () => {
    if (fullName && email && contactNumber && password) {
      // Navigate to home after signup
      router.replace('/(tabs)');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.primary }]}>ALERT PH</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>Create Your Account</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Sign Up</Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Full Name"
            placeholderTextColor={colors.icon}
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={colors.icon}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Contact Number"
            placeholderTextColor={colors.icon}
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Password"
            placeholderTextColor={colors.icon}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSignup}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
              <Text style={[styles.link, { color: colors.primary }]}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
