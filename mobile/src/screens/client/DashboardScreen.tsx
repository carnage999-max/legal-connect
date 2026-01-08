import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Button } from '../../components';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Matter, Notification } from '../../types';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface DashboardData {
  active_matters: number;
  upcoming_appointments: number;
  unread_messages: number;
  recent_matters: Matter[];
}

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [dashboard, notifs] = await Promise.all([
        api.getClientDashboard(),
        api.getNotifications({ is_read: false, page_size: 5 }),
      ]);
      setDashboardData(dashboard);
      setNotifications(notifs.results || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: colors.textSecondary,
      submitted: colors.info,
      under_review: colors.warning,
      matched: colors.clientAccent,
      active: colors.success,
      completed: colors.success,
      cancelled: colors.error,
    };
    return statusColors[status] || colors.textSecondary;
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.clientAccent}
          />
        }
      >
        {/* Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello, {user?.first_name || 'there'}
          </Text>
          <Text style={styles.subGreeting}>
            What can we help you with today?
          </Text>
        </View>

        {/* Quick Action */}
        <Card style={styles.quickAction} variant="elevated">
          <Text style={styles.quickActionTitle}>Need legal help?</Text>
          <Text style={styles.quickActionText}>
            Start a new intake to get matched with qualified attorneys.
          </Text>
          <Button
            title="Start Legal Intake"
            onPress={() => navigation.navigate('NewMatter')}
            size="md"
          />
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} variant="outlined">
            <Text style={styles.statNumber}>{dashboardData?.active_matters || 0}</Text>
            <Text style={styles.statLabel}>Active Matters</Text>
          </Card>
          <Card style={styles.statCard} variant="outlined">
            <Text style={styles.statNumber}>{dashboardData?.upcoming_appointments || 0}</Text>
            <Text style={styles.statLabel}>Appointments</Text>
          </Card>
          <Card style={styles.statCard} variant="outlined">
            <Text style={styles.statNumber}>{dashboardData?.unread_messages || 0}</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </Card>
        </View>

        {/* Recent Matters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Matters</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Matters')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {!dashboardData?.recent_matters || dashboardData.recent_matters.length === 0 ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <Text style={styles.emptyText}>No matters yet</Text>
              <Text style={styles.emptySubtext}>
                Start an intake to create your first matter
              </Text>
            </Card>
          ) : (
            dashboardData.recent_matters.slice(0, 3).map((matter) => (
              <Card
                key={matter.id}
                variant="outlined"
                style={styles.matterCard}
                onPress={() => navigation.navigate('MatterDetail', { matterId: matter.id })}
              >
                <View style={styles.matterHeader}>
                  <Text style={styles.matterTitle} numberOfLines={1}>
                    {matter.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(matter.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(matter.status) },
                      ]}
                    >
                      {matter.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                {matter.attorney && (
                  <Text style={styles.matterAttorney}>
                    Attorney: {matter.attorney.user.full_name}
                  </Text>
                )}
                <Text style={styles.matterType}>
                  {matter.matter_type} • {matter.reference_number}
                </Text>
              </Card>
            ))
          )}
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickLinksRow}>
            <TouchableOpacity
              style={styles.quickLink}
              onPress={() => navigation.navigate('Appointments')}
            >
              <Text style={styles.quickLinkText}>View Appointments</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickLink}
              onPress={() => navigation.navigate('Messages')}
            >
              <Text style={styles.quickLinkText}>Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickLink}
              onPress={() => navigation.navigate('Documents')}
            >
              <Text style={styles.quickLinkText}>Documents</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        {notifications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {notifications.map((notification) => (
              <Card
                key={notification.id}
                variant="outlined"
                style={styles.notificationCard}
              >
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
              </Card>
            ))}
          </View>
        )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  subGreeting: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  quickAction: {
    marginBottom: spacing.lg,
    backgroundColor: colors.clientAccentMuted,
  },
  quickActionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.clientAccent,
    marginBottom: spacing.xs,
  },
  quickActionText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.clientAccent,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  matterCard: {
    marginBottom: spacing.sm,
  },
  matterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  matterTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
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
  matterAttorney: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  matterType: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xs,
  },
  statNumber: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.clientAccent,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  quickLinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickLink: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickLinkText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.clientAccent,
    textAlign: 'center',
  },
  notificationCard: {
    marginBottom: spacing.sm,
  },
  notificationTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  notificationMessage: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
