import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type UserType = 'client' | 'attorney';

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { register, isAuthenticating } = useAuth();
  const [userType, setUserType] = useState<UserType>('client');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 10) {
      newErrors.password = 'Password must be at least 10 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      console.log('[Register] Attempting registration for:', email);
      await register({
        email,
        password1: password,
        password2: confirmPassword,
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
      });
      Alert.alert(
        'Registration Successful',
        'Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      console.log('[Register] Error:', error);
      console.log('[Register] Error response:', error.response);
      console.log('[Register] Error message:', error.message);

      const errorData = error.response?.data;
      if (errorData) {
        // Handle different error formats
        let errorMessages: string;
        if (typeof errorData === 'string') {
          errorMessages = errorData;
        } else if (errorData.detail) {
          errorMessages = errorData.detail;
        } else {
          errorMessages = Object.entries(errorData)
            .map(([key, value]) => {
              const messages = Array.isArray(value) ? value.join(', ') : value;
              return `${key}: ${messages}`;
            })
            .join('\n');
        }
        Alert.alert('Registration Failed', errorMessages);
      } else if (error.message === 'Network Error') {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please check:\n\n' +
          '1. Your backend server is running\n' +
          '2. Your device can reach the server\n' +
          '3. Check the console logs for the API URL being used'
        );
      } else {
        Alert.alert('Registration Failed', error.message || 'An error occurred. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Sign up to get started with Legal Connect
            </Text>
          </View>

          {/* User Type Selection */}
          <View style={styles.userTypeContainer}>
            <Text style={styles.userTypeLabel}>I am a:</Text>
            <View style={styles.userTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'client' && styles.userTypeButtonActive,
                ]}
                onPress={() => setUserType('client')}
              >
                <Text
                  style={[
                    styles.userTypeButtonText,
                    userType === 'client' && styles.userTypeButtonTextActive,
                  ]}
                >
                  Client
                </Text>
                <Text style={styles.userTypeDescription}>
                  Seeking legal help
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'attorney' && styles.userTypeButtonActive,
                ]}
                onPress={() => setUserType('attorney')}
              >
                <Text
                  style={[
                    styles.userTypeButtonText,
                    userType === 'attorney' && styles.userTypeButtonTextActive,
                  ]}
                >
                  Attorney
                </Text>
                <Text style={styles.userTypeDescription}>
                  Licensed lawyer
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <Input
                  label="First Name"
                  placeholder="John"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  error={errors.firstName}
                />
              </View>
              <View style={styles.nameField}>
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  error={errors.lastName}
                />
              </View>
            </View>

            <Input
              label="Email"
              placeholder="john@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoCapitalize="none"
              error={errors.password}
              hint="At least 10 characters"
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              autoCapitalize="none"
              error={errors.confirmPassword}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isAuthenticating}
              fullWidth
              size="lg"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('Login')}
              >
                Sign in
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    width: 60,
    height: 60,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  userTypeContainer: {
    marginBottom: spacing.lg,
  },
  userTypeLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  userTypeButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  userTypeButtonActive: {
    borderColor: colors.clientAccent,
    backgroundColor: colors.clientAccentMuted,
  },
  userTypeButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userTypeButtonTextActive: {
    color: colors.clientAccent,
  },
  userTypeDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  nameField: {
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  footerText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  link: {
    color: colors.clientAccent,
    fontWeight: fontWeight.semibold,
  },
});
