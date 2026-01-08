import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Button } from '../../components';
import api from '../../services/api';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type ChangePasswordScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export function ChangePasswordScreen({ navigation }: ChangePasswordScreenProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await api.changePassword({
        old_password: currentPassword,
        new_password: newPassword,
      });

      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      const oldPasswordError = error.response?.data?.old_password;

      if (oldPasswordError) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        Alert.alert('Error', detail || 'Failed to change password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Instructions */}
        <Card style={styles.instructionsCard}>
          <Text style={styles.instructionsText}>
            Enter your current password and choose a new password. Your password must be at least 8 characters long.
          </Text>
        </Card>

        {/* Password Form */}
        <Card style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={[styles.input, errors.currentPassword && styles.inputError]}
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                if (errors.currentPassword) {
                  setErrors((prev) => ({ ...prev, currentPassword: '' }));
                }
              }}
              placeholder="Enter current password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.currentPassword && (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={[styles.input, errors.newPassword && styles.inputError]}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (errors.newPassword) {
                  setErrors((prev) => ({ ...prev, newPassword: '' }));
                }
              }}
              placeholder="Enter new password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }
              }}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>
        </Card>

        {/* Password Requirements */}
        <Card style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>Password Requirements</Text>
          <View style={styles.requirement}>
            <Text style={[
              styles.requirementIcon,
              newPassword.length >= 8 && styles.requirementMet
            ]}>
              {newPassword.length >= 8 ? '✓' : '○'}
            </Text>
            <Text style={styles.requirementText}>At least 8 characters</Text>
          </View>
          <View style={styles.requirement}>
            <Text style={[
              styles.requirementIcon,
              /[A-Z]/.test(newPassword) && styles.requirementMet
            ]}>
              {/[A-Z]/.test(newPassword) ? '✓' : '○'}
            </Text>
            <Text style={styles.requirementText}>One uppercase letter (recommended)</Text>
          </View>
          <View style={styles.requirement}>
            <Text style={[
              styles.requirementIcon,
              /[0-9]/.test(newPassword) && styles.requirementMet
            ]}>
              {/[0-9]/.test(newPassword) ? '✓' : '○'}
            </Text>
            <Text style={styles.requirementText}>One number (recommended)</Text>
          </View>
        </Card>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Change Password"
            onPress={handleChangePassword}
            loading={isLoading}
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    padding: spacing.md,
  },
  instructionsCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.clientAccentMuted,
  },
  instructionsText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  formCard: {
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  requirementsCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundTertiary,
  },
  requirementsTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  requirementIcon: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginRight: spacing.sm,
    width: 20,
  },
  requirementMet: {
    color: colors.success,
  },
  requirementText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
});
