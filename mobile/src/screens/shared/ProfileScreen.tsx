import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Card, Button } from '../../components';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type IconName = keyof typeof Ionicons.glyphMap;

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout, refreshUser } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [attorneyProfile, setAttorneyProfile] = useState<any | null>(null);
  const [isLoadingAttorney, setIsLoadingAttorney] = useState(false);

  useEffect(() => {
    const loadAttorneyProfile = async () => {
      if (user?.user_type !== 'attorney') return;
      if (user?.has_attorney_profile === false) return;
      try {
        setIsLoadingAttorney(true);
        const data = await api.getMyAttorneyProfile();
        setAttorneyProfile(data);
      } catch (e) {
        setAttorneyProfile(null);
      } finally {
        setIsLoadingAttorney(false);
      }
    };
    loadAttorneyProfile();
  }, [user]);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleUpdateAvatar = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'image/*', copyToCacheDirectory: true });
    if (!result.canceled && result.assets?.[0]) {
      try {
        const formData = new FormData();
        formData.append('avatar', {
          uri: result.assets[0].uri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        } as any);

        // Prefer dedicated avatar endpoint; fallback to profile PATCH
        try {
          await api.uploadAvatar(formData);
        } catch (e) {
          await api.updateProfile(formData);
        }
        await refreshUser();
        Alert.alert('Success', 'Profile photo updated');
      } catch (error) {
        Alert.alert('Error', 'Failed to update profile photo');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteAccount();
              logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  const menuSections: {
    title: string;
    items: {
      label: string;
      icon: IconName;
      onPress?: () => void;
      toggle?: boolean;
      value?: boolean;
      onToggle?: (value: boolean) => void;
    }[];
  }[] = [
    {
      title: 'Account',
      items: [
        { label: 'Edit Profile', onPress: handleEditProfile, icon: 'person-outline' },
        { label: 'Change Password', onPress: handleChangePassword, icon: 'lock-closed-outline' },
        { label: 'Payment Methods', onPress: () => navigation.navigate('Payments'), icon: 'card-outline' },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          label: 'Push Notifications',
          icon: 'notifications-outline',
          toggle: true,
          value: pushEnabled,
          onToggle: setPushEnabled,
        },
        {
          label: 'Email Notifications',
          icon: 'mail-outline',
          toggle: true,
          value: emailEnabled,
          onToggle: setEmailEnabled,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', onPress: () => navigation.navigate('HelpCenter'), icon: 'help-circle-outline' },
        { label: 'Contact Support', onPress: () => Linking.openURL('mailto:info@legalconnectapp.com?subject=Support Request'), icon: 'chatbubble-outline' },
        { label: 'Terms of Service', onPress: () => Linking.openURL('https://www.legalconnectapp.com/terms'), icon: 'document-text-outline' },
        { label: 'Privacy Policy', onPress: () => Linking.openURL('https://www.legalconnectapp.com/privacy'), icon: 'shield-checkmark-outline' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleUpdateAvatar}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.first_name?.[0] || '?'}
                  {user?.last_name?.[0] || ''}
                </Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.user_type === 'attorney' ? 'Attorney' : 'Client'}
            </Text>
          </View>
        </View>

        {/* Attorney Professional Profile (read-only) */}
        {user?.user_type === 'attorney' && attorneyProfile && (
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Professional Profile</Text>
            <Card variant="outlined" style={styles.menuCard}>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Headline</Text>
                <Text style={styles.profileValue}>{attorneyProfile.headline || '—'}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.profileRowColumn}>
                <Text style={styles.profileLabel}>Biography</Text>
                <Text style={styles.profileValueMultiline}>{attorneyProfile.biography || '—'}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Experience</Text>
                <Text style={styles.profileValue}>{attorneyProfile.years_of_experience ?? '—'} yrs</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Verification</Text>
                <Text style={styles.profileValue}>{String(attorneyProfile.verification_status || 'pending').replace('_',' ')}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.profileRowColumn}>
                <Text style={styles.profileLabel}>Practice Areas</Text>
                <Text style={styles.profileValueMultiline}>
                  {(attorneyProfile.practice_areas || []).map((p: any) => p.name).join(', ') || '—'}
                </Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.profileRowColumn}>
                <Text style={styles.profileLabel}>Jurisdictions</Text>
                <Text style={styles.profileValueMultiline}>
                  {(attorneyProfile.jurisdictions || []).map((j: any) => j.name).join(', ') || '—'}
                </Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Fee Structure</Text>
                <Text style={styles.profileValue}>{attorneyProfile.fee_structure || '—'}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Hourly Rate</Text>
                <Text style={styles.profileValue}>
                  {attorneyProfile.hourly_rate != null ? `$${attorneyProfile.hourly_rate}` : '—'}
                </Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Consultation Fee</Text>
                <Text style={styles.profileValue}>
                  {attorneyProfile.consultation_fee != null ? `$${attorneyProfile.consultation_fee}` : '—'}
                </Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Free Consultation</Text>
                <Text style={styles.profileValue}>{attorneyProfile.free_consultation ? 'Yes' : 'No'}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Office</Text>
                <Text style={styles.profileValue}>
                  {[
                    attorneyProfile.office_city,
                    attorneyProfile.office_state,
                  ].filter(Boolean).join(', ') || '—'}
                </Text>
              </View>
              {isLoadingAttorney && (
                <View style={{ padding: 12 }}>
                  <Text style={styles.menuLabel}>Loading profile…</Text>
                </View>
              )}
            </Card>
          </View>
        )}

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card variant="outlined" style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={item.toggle ? undefined : item.onPress}
                  disabled={item.toggle}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name={item.icon} size={22} color={colors.textSecondary} style={styles.menuIcon} />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>

                  {item.toggle ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.border, true: colors.clientAccent }}
                      thumbColor={colors.white}
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout & Delete */}
        <View style={styles.dangerZone}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />

          <TouchableOpacity onPress={handleDeleteAccount}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Legal Connect v1.0.0</Text>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.clientAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.clientAccentMuted,
  },
  roleText: {
    fontSize: fontSize.sm,
    color: colors.clientAccent,
    fontWeight: fontWeight.medium,
  },
  menuSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    padding: 0,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  profileRowColumn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  profileLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  profileValue: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    maxWidth: '60%',
    textAlign: 'right',
  },
  profileValueMultiline: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    marginTop: 2,
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: spacing.md,
  },
  menuLabel: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  dangerZone: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  logoutButton: {
    minWidth: 200,
    marginBottom: spacing.md,
  },
  deleteText: {
    fontSize: fontSize.sm,
    color: '#DC2626',
  },
  versionText: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
});
