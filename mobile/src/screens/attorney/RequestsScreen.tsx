import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Button } from '../../components';
import api from '../../services/api';
import { attorneyColors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type RequestsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface ReferralRequest {
  id: string;
  matter_type: string;
  description: string;
  jurisdiction: string;
  urgency: string;
  client_name?: string;
  created_at: string;
  status: string;
  parties_count?: number;
}

export function RequestsScreen({ navigation }: RequestsScreenProps) {
  const [requests, setRequests] = useState<ReferralRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'declined'>('pending');

  const fetchRequests = useCallback(async () => {
    try {
      const data = await api.getIncomingRequests({ status: activeTab });
      setRequests(data.results || data || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      Alert.alert('Error', 'Failed to load requests');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setIsLoading(true);
    fetchRequests();
  }, [fetchRequests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = async (requestId: string) => {
    try {
      await api.respondToRequest(requestId, { action: 'accept' });
      Alert.alert('Success', 'Request accepted successfully');
      fetchRequests();
    } catch (error) {
      console.error('Failed to accept request:', error);
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const handleDecline = async (requestId: string) => {
    Alert.alert(
      'Decline Request',
      'Are you sure you want to decline this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.respondToRequest(requestId, { action: 'decline' });
              Alert.alert('Success', 'Request declined');
              fetchRequests();
            } catch (error) {
              console.error('Failed to decline request:', error);
              Alert.alert('Error', 'Failed to decline request');
            }
          },
        },
      ]
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'high':
        return '#DC2626';
      case 'medium':
        return '#F59E0B';
      default:
        return attorneyColors.textSecondary;
    }
  };

  const renderRequestCard = ({ item }: { item: ReferralRequest }) => (
    <Card variant="outlined" style={styles.requestCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.typeContainer}>
            <Text style={styles.matterType}>{item.matter_type || 'Legal Matter'}</Text>
            <View
              style={[
                styles.urgencyBadge,
                { backgroundColor: getUrgencyColor(item.urgency) },
              ]}
            >
              <Text style={styles.urgencyText}>{item.urgency || 'Normal'}</Text>
            </View>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {item.description || 'No description provided'}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Jurisdiction</Text>
            <Text style={styles.metaValue}>{item.jurisdiction || 'Not specified'}</Text>
          </View>
          {item.parties_count && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Parties</Text>
              <Text style={styles.metaValue}>{item.parties_count}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {activeTab === 'pending' && (
        <View style={styles.actionButtons}>
          <Button
            title="Decline"
            onPress={() => handleDecline(item.id)}
            variant="outline"
            size="sm"
            style={styles.declineButton}
          />
          <Button
            title="Accept"
            onPress={() => handleAccept(item.id)}
            size="sm"
            style={styles.acceptButton}
          />
        </View>
      )}

      {activeTab === 'accepted' && (
        <TouchableOpacity
          style={styles.viewClientButton}
          onPress={() => navigation.navigate('ClientDetail', { matterId: item.id })}
        >
          <Text style={styles.viewClientText}>View Client Details</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>
        {activeTab === 'pending'
          ? 'No Pending Requests'
          : activeTab === 'accepted'
          ? 'No Accepted Requests'
          : 'No Declined Requests'}
      </Text>
      <Text style={styles.emptyText}>
        {activeTab === 'pending'
          ? 'New client referrals will appear here when they match your profile.'
          : activeTab === 'accepted'
          ? 'Requests you accept will be listed here.'
          : 'Requests you decline will be listed here.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Referral Requests</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {(['pending', 'accepted', 'declined'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Request List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={attorneyColors.accent} />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={attorneyColors.accent}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: attorneyColors.bgPrimary,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: attorneyColors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: attorneyColors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: attorneyColors.accent,
  },
  tabText: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  tabTextActive: {
    color: attorneyColors.accent,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  requestCard: {
    marginBottom: spacing.md,
    backgroundColor: attorneyColors.bgSecondary,
    borderColor: attorneyColors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  matterType: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
  },
  urgencyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  urgencyText: {
    fontSize: fontSize.xs,
    color: '#FFFFFF',
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: fontSize.xs,
    color: attorneyColors.textSecondary,
  },
  description: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  metaItem: {},
  metaLabel: {
    fontSize: fontSize.xs,
    color: attorneyColors.textSecondary,
    marginBottom: spacing.xs,
  },
  metaValue: {
    fontSize: fontSize.sm,
    color: attorneyColors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: attorneyColors.border,
  },
  declineButton: {
    flex: 1,
    borderColor: attorneyColors.border,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: attorneyColors.accent,
  },
  viewClientButton: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: attorneyColors.border,
    alignItems: 'center',
  },
  viewClientText: {
    fontSize: fontSize.sm,
    color: attorneyColors.accent,
    fontWeight: fontWeight.medium,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
