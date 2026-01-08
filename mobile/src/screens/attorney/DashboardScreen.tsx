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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { attorneyColors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface DashboardData {
  newRequests: number;
  activeCases: number;
  todayAppointments: any[];
  earnings: {
    thisMonth: number;
    total: number;
  };
  recentRequests: any[];
}

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData>({
    newRequests: 0,
    activeCases: 0,
    todayAppointments: [],
    earnings: { thisMonth: 0, total: 0 },
    recentRequests: [],
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const [requests, cases, appointments, earnings] = await Promise.all([
        api.getIncomingRequests({ status: 'pending' }).catch(() => ({ results: [] })),
        api.getAttorneyMatters({ status: 'active' }).catch(() => ({ results: [] })),
        api.getAppointments({ date: new Date().toISOString().split('T')[0] }).catch(() => ({ results: [] })),
        api.getPayouts().catch(() => ({ results: [] })),
      ]);

      const thisMonthEarnings = (earnings.results || [])
        .filter((p: any) => new Date(p.created_at).getMonth() === new Date().getMonth())
        .reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0);

      const totalEarnings = (earnings.results || [])
        .reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0);

      setData({
        newRequests: (requests.results || requests || []).length,
        activeCases: (cases.results || cases || []).length,
        todayAppointments: appointments.results || appointments || [],
        earnings: { thisMonth: thisMonthEarnings, total: totalEarnings },
        recentRequests: (requests.results || requests || []).slice(0, 5),
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={attorneyColors.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={attorneyColors.accent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Welcome back, {user?.first_name || 'Counselor'}
          </Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('Requests')}
          >
            <Text style={styles.statValue}>{data.newRequests}</Text>
            <Text style={styles.statLabel}>New Requests</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('Clients')}
          >
            <Text style={styles.statValue}>{data.activeCases}</Text>
            <Text style={styles.statLabel}>Active Cases</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('Calendar')}
          >
            <Text style={styles.statValue}>{data.todayAppointments.length}</Text>
            <Text style={styles.statLabel}>Today's Meetings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('Billing')}
          >
            <Text style={styles.statValue}>${data.earnings.thisMonth.toFixed(0)}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Appointments</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {data.todayAppointments.length > 0 ? (
            data.todayAppointments.map((apt) => (
              <Card key={apt.id} variant="outlined" style={styles.appointmentCard}>
                <View style={styles.appointmentTime}>
                  <Text style={styles.timeText}>
                    {new Date(apt.start_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentTitle}>{apt.title}</Text>
                  <Text style={styles.appointmentClient}>
                    with {apt.client_name || 'Client'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, styles[`status_${apt.status}`]]}>
                  <Text style={styles.statusText}>{apt.status}</Text>
                </View>
              </Card>
            ))
          ) : (
            <Card variant="outlined" style={styles.emptyCard}>
              <Text style={styles.emptyText}>No appointments scheduled for today</Text>
            </Card>
          )}
        </View>

        {/* New Referral Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Referral Requests</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Requests')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {data.recentRequests.length > 0 ? (
            data.recentRequests.map((request) => (
              <TouchableOpacity
                key={request.id}
                onPress={() => navigation.navigate('RequestDetail', { requestId: request.id })}
              >
                <Card variant="outlined" style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestTitle}>{request.matter_type || 'Legal Matter'}</Text>
                    <Text style={styles.requestTime}>
                      {new Date(request.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.requestDescription} numberOfLines={2}>
                    {request.description || 'No description provided'}
                  </Text>
                  <View style={styles.requestFooter}>
                    <Text style={styles.requestJurisdiction}>
                      {request.jurisdiction || 'Not specified'}
                    </Text>
                    <View style={styles.urgencyBadge}>
                      <Text style={styles.urgencyText}>{request.urgency || 'Normal'}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          ) : (
            <Card variant="outlined" style={styles.emptyCard}>
              <Text style={styles.emptyText}>No new requests at this time</Text>
            </Card>
          )}
        </View>

        {/* Earnings Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings Summary</Text>
          <Card variant="outlined" style={styles.earningsCard}>
            <View style={styles.earningsRow}>
              <View style={styles.earningsItem}>
                <Text style={styles.earningsLabel}>This Month</Text>
                <Text style={styles.earningsValue}>${data.earnings.thisMonth.toFixed(2)}</Text>
              </View>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsItem}>
                <Text style={styles.earningsLabel}>Total Earned</Text>
                <Text style={styles.earningsValue}>${data.earnings.total.toFixed(2)}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewBillingButton}
              onPress={() => navigation.navigate('Billing')}
            >
              <Text style={styles.viewBillingText}>View Billing Details</Text>
            </TouchableOpacity>
          </Card>
        </View>
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
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
  },
  date: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: attorneyColors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: attorneyColors.border,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: attorneyColors.accent,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
    marginTop: spacing.xs,
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
    color: attorneyColors.textPrimary,
  },
  sectionLink: {
    fontSize: fontSize.sm,
    color: attorneyColors.accent,
    fontWeight: fontWeight.medium,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: attorneyColors.bgSecondary,
    borderColor: attorneyColors.border,
  },
  appointmentTime: {
    width: 70,
    alignItems: 'center',
    paddingRight: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: attorneyColors.border,
  },
  timeText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.accent,
  },
  appointmentInfo: {
    flex: 1,
    paddingLeft: spacing.sm,
  },
  appointmentTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: attorneyColors.textPrimary,
  },
  appointmentClient: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: attorneyColors.border,
  },
  status_confirmed: {
    backgroundColor: '#065F46',
  },
  status_pending: {
    backgroundColor: '#92400E',
  },
  statusText: {
    fontSize: fontSize.xs,
    color: attorneyColors.textPrimary,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  requestCard: {
    marginBottom: spacing.sm,
    backgroundColor: attorneyColors.bgSecondary,
    borderColor: attorneyColors.border,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  requestTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
  },
  requestTime: {
    fontSize: fontSize.xs,
    color: attorneyColors.textSecondary,
  },
  requestDescription: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestJurisdiction: {
    fontSize: fontSize.xs,
    color: attorneyColors.textSecondary,
  },
  urgencyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: attorneyColors.accent,
  },
  urgencyText: {
    fontSize: fontSize.xs,
    color: attorneyColors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  emptyCard: {
    backgroundColor: attorneyColors.bgSecondary,
    borderColor: attorneyColors.border,
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
  },
  earningsCard: {
    backgroundColor: attorneyColors.bgSecondary,
    borderColor: attorneyColors.border,
  },
  earningsRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  earningsItem: {
    flex: 1,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
    marginBottom: spacing.xs,
  },
  earningsValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: attorneyColors.accent,
  },
  earningsDivider: {
    width: 1,
    backgroundColor: attorneyColors.border,
    marginHorizontal: spacing.md,
  },
  viewBillingButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: attorneyColors.border,
  },
  viewBillingText: {
    fontSize: fontSize.sm,
    color: attorneyColors.accent,
    fontWeight: fontWeight.medium,
  },
});
