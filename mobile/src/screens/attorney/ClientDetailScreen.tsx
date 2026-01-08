import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components';
import api from '../../services/api';
import { attorneyColors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type ClientDetailScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ params: { clientId: string } }, 'params'>;
};

interface ClientDetail {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at: string;
}

interface Matter {
  id: string;
  title: string;
  status: string;
  practice_area: { name: string };
  created_at: string;
}

export function ClientDetailScreen({ navigation, route }: ClientDetailScreenProps) {
  const { clientId } = route.params;
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'matters'>('info');

  const fetchData = useCallback(async () => {
    try {
      const [clientData, mattersData] = await Promise.all([
        api.getClientProfile(clientId),
        api.getClientMatters(clientId).catch(() => ({ results: [] })),
      ]);
      setClient(clientData);
      setMatters(mattersData.results || mattersData || []);
    } catch (error) {
      console.error('Failed to fetch client details:', error);
      Alert.alert('Error', 'Failed to load client details');
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'closed':
        return '#6B7280';
      default:
        return attorneyColors.textSecondary;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={attorneyColors.accent} />
        </View>
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Client not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Client Header */}
        <View style={styles.header}>
          {client.user.avatar ? (
            <Image source={{ uri: client.user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {client.user.first_name?.[0]}
                {client.user.last_name?.[0]}
              </Text>
            </View>
          )}
          <Text style={styles.clientName}>
            {client.user.first_name} {client.user.last_name}
          </Text>
          <Text style={styles.clientSince}>
            Client since {formatDate(client.created_at)}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {matters.filter((m) => m.status.toLowerCase() === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active Matters</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{matters.length}</Text>
            <Text style={styles.statLabel}>Total Matters</Text>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'info' && styles.tabActive]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
              Contact Info
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'matters' && styles.tabActive]}
            onPress={() => setActiveTab('matters')}
          >
            <Text style={[styles.tabText, activeTab === 'matters' && styles.tabTextActive]}>
              Matters ({matters.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'info' ? (
          <View style={styles.infoContent}>
            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{client.user.email}</Text>
              </View>
              {client.user.phone && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{client.user.phone}</Text>
                </View>
              )}
              {client.address && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>
                    {client.address}
                    {client.city && `, ${client.city}`}
                    {client.state && `, ${client.state}`}
                    {client.zip_code && ` ${client.zip_code}`}
                  </Text>
                </View>
              )}
            </Card>

            {/* Quick Actions */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate('Messaging', {
                      clientId: client.id,
                      title: `${client.user.first_name} ${client.user.last_name}`,
                    })
                  }
                >
                  <Ionicons name="chatbubble-outline" size={24} color={attorneyColors.accent} />
                  <Text style={styles.actionText}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => Alert.alert('Info', 'Email client feature coming soon')}
                >
                  <Ionicons name="mail-outline" size={24} color={attorneyColors.accent} />
                  <Text style={styles.actionText}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => Alert.alert('Info', 'Call client feature coming soon')}
                >
                  <Ionicons name="call-outline" size={24} color={attorneyColors.accent} />
                  <Text style={styles.actionText}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.mattersContent}>
            {matters.length > 0 ? (
              matters.map((matter) => (
                <TouchableOpacity
                  key={matter.id}
                  style={styles.matterCard}
                  onPress={() =>
                    navigation.navigate('MatterDetail', { matterId: matter.id })
                  }
                >
                  <View style={styles.matterHeader}>
                    <Text style={styles.matterTitle} numberOfLines={1}>
                      {matter.title}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(matter.status)}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(matter.status) },
                        ]}
                      >
                        {matter.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.matterArea}>{matter.practice_area?.name}</Text>
                  <Text style={styles.matterDate}>
                    Created {formatDate(matter.created_at)}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyMatters}>
                <Text style={styles.emptyText}>No matters with this client</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: attorneyColors.bgPrimary,
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
    color: attorneyColors.textSecondary,
    marginBottom: spacing.lg,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: attorneyColors.bgSecondary,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: attorneyColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: '#FFFFFF',
  },
  clientName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
    marginBottom: spacing.xs,
  },
  clientSince: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: attorneyColors.bgSecondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: attorneyColors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: attorneyColors.accent,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: attorneyColors.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: attorneyColors.border,
    marginVertical: spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: attorneyColors.bgSecondary,
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
  infoContent: {
    padding: spacing.md,
  },
  infoCard: {
    backgroundColor: attorneyColors.bgSecondary,
    borderColor: attorneyColors.border,
    marginBottom: spacing.md,
  },
  infoRow: {
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: attorneyColors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: fontSize.md,
    color: attorneyColors.textPrimary,
  },
  actionsSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: attorneyColors.bgSecondary,
    borderRadius: borderRadius.md,
    minWidth: 80,
    borderWidth: 1,
    borderColor: attorneyColors.border,
  },
  actionIcon: {
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: fontSize.sm,
    color: attorneyColors.textPrimary,
  },
  mattersContent: {
    padding: spacing.md,
  },
  matterCard: {
    backgroundColor: attorneyColors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: attorneyColors.border,
  },
  matterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  matterTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: attorneyColors.textPrimary,
    marginRight: spacing.sm,
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
  matterArea: {
    fontSize: fontSize.sm,
    color: attorneyColors.accent,
    marginBottom: spacing.xs,
  },
  matterDate: {
    fontSize: fontSize.xs,
    color: attorneyColors.textSecondary,
  },
  emptyMatters: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: attorneyColors.textSecondary,
  },
});
