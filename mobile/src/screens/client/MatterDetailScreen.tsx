import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components';
import api from '../../services/api';
import { Matter } from '../../types';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type MatterDetailScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ params: { matterId: string } }, 'params'>;
};

export function MatterDetailScreen({ navigation, route }: MatterDetailScreenProps) {
  const { matterId } = route.params;
  const [matter, setMatter] = useState<Matter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatter = useCallback(async () => {
    try {
      const data = await api.getMatter(matterId);
      setMatter(data);
    } catch (error) {
      console.error('Failed to fetch matter:', error);
      Alert.alert('Error', 'Failed to load matter details');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [matterId]);

  useEffect(() => {
    fetchMatter();
  }, [fetchMatter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMatter();
  }, [fetchMatter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#065F46';
      case 'pending':
        return '#D97706';
      case 'completed':
        return '#2563EB';
      case 'closed':
        return '#6B7280';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'active':
        return '#D1FAE5';
      case 'pending':
        return '#FEF3C7';
      case 'completed':
        return '#DBEAFE';
      case 'closed':
        return '#F3F4F6';
      default:
        return colors.backgroundTertiary;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.clientAccent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!matter) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Matter not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.clientAccent}
          />
        }
      >
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.matterType}>{matter.matter_type}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusBackground(matter.status) },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(matter.status) }]}>
                {matter.status}
              </Text>
            </View>
          </View>
          <Text style={styles.matterTitle}>{matter.title || 'Legal Matter'}</Text>
          <Text style={styles.createdDate}>
            Created {new Date(matter.created_at).toLocaleDateString()}
          </Text>
        </Card>

        {/* Description */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {matter.description || 'No description provided'}
          </Text>
        </Card>

        {/* Details */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Jurisdiction</Text>
            <Text style={styles.detailValue}>{matter.jurisdiction || 'Not specified'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Urgency</Text>
            <Text style={styles.detailValue}>{matter.urgency || 'Normal'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference #</Text>
            <Text style={styles.detailValue}>{matter.reference_number || 'N/A'}</Text>
          </View>
        </Card>

        {/* Assigned Attorney */}
        {matter.assigned_attorney && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Assigned Attorney</Text>
            <TouchableOpacity
              style={styles.attorneyRow}
              onPress={() =>
                navigation.navigate('AttorneyProfile', {
                  attorneyId: matter.assigned_attorney.id,
                })
              }
            >
              <View style={styles.attorneyAvatar}>
                <Text style={styles.avatarText}>
                  {matter.assigned_attorney.first_name?.[0] || '?'}
                </Text>
              </View>
              <View style={styles.attorneyInfo}>
                <Text style={styles.attorneyName}>
                  {matter.assigned_attorney.first_name} {matter.assigned_attorney.last_name}
                </Text>
                <Text style={styles.attorneyEmail}>{matter.assigned_attorney.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </Card>
        )}

        {/* Parties */}
        {matter.parties && matter.parties.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Parties Involved</Text>
            {matter.parties.map((party, index) => (
              <View key={party.id || index} style={styles.partyRow}>
                <View style={styles.partyIcon}>
                  <Ionicons
                    name={party.party_type === 'individual' ? 'person-outline' : 'business-outline'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </View>
                <View style={styles.partyInfo}>
                  <Text style={styles.partyName}>{party.name}</Text>
                  <Text style={styles.partyRole}>{party.role}</Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {matter.assigned_attorney && (
            <Button
              title="Message Attorney"
              onPress={() =>
                navigation.navigate('Messages', {
                  screen: 'Messaging',
                  params: { matterId: matter.id },
                })
              }
              fullWidth
              style={styles.actionButton}
            />
          )}

          <Button
            title="View Documents"
            onPress={() =>
              navigation.navigate('Documents', {
                screen: 'DocumentsList',
                params: { matterId: matter.id },
              })
            }
            variant="outline"
            fullWidth
            style={styles.actionButton}
          />

          {matter.status === 'active' && matter.assigned_attorney && (
            <Button
              title="Book Appointment"
              onPress={() =>
                navigation.navigate('BookAppointment', {
                  attorneyId: matter.assigned_attorney.id,
                  matterId: matter.id,
                })
              }
              variant="outline"
              fullWidth
              style={styles.actionButton}
            />
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  scrollContent: {
    padding: spacing.md,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  matterType: {
    fontSize: fontSize.sm,
    color: colors.clientAccent,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  matterTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  createdDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  attorneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attorneyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.clientAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  attorneyInfo: {
    flex: 1,
  },
  attorneyName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  attorneyEmail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  partyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  partyRole: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  actionButtons: {
    marginTop: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
});
