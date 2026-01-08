import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components';
import api from '../../services/api';
import { attorneyColors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type BillingScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface EarningsSummary {
  total_earned: number;
  pending_payout: number;
  this_month: number;
  last_month: number;
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at?: string;
}

interface Invoice {
  id: string;
  matter_title: string;
  client_name: string;
  amount: number;
  status: string;
  created_at: string;
  due_date?: string;
}

export function BillingScreen({ navigation }: BillingScreenProps) {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payouts'>('overview');

  const fetchData = useCallback(async () => {
    try {
      const [summaryData, payoutsData, invoicesData] = await Promise.all([
        api.getEarningsSummary().catch(() => ({
          total_earned: 0,
          pending_payout: 0,
          this_month: 0,
          last_month: 0,
        })),
        api.getPayoutHistory().catch(() => ({ results: [] })),
        api.getInvoices().catch(() => ({ results: [] })),
      ]);
      setSummary(summaryData);
      setPayouts(payoutsData.results || payoutsData || []);
      setInvoices(invoicesData.results || invoicesData || []);
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'overdue':
      case 'failed':
        return '#EF4444';
      default:
        return attorneyColors.textSecondary;
    }
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
        {/* Earnings Summary */}
        <View style={styles.summarySection}>
          <Card style={styles.mainEarningsCard}>
            <Text style={styles.earningsLabel}>Total Earnings</Text>
            <Text style={styles.earningsAmount}>
              {formatCurrency(summary?.total_earned || 0)}
            </Text>
            <View style={styles.pendingRow}>
              <Text style={styles.pendingLabel}>Pending Payout:</Text>
              <Text style={styles.pendingAmount}>
                {formatCurrency(summary?.pending_payout || 0)}
              </Text>
            </View>
          </Card>

          <View style={styles.monthlyCards}>
            <Card style={styles.monthCard}>
              <Text style={styles.monthLabel}>This Month</Text>
              <Text style={styles.monthAmount}>
                {formatCurrency(summary?.this_month || 0)}
              </Text>
            </Card>
            <Card style={styles.monthCard}>
              <Text style={styles.monthLabel}>Last Month</Text>
              <Text style={styles.monthAmount}>
                {formatCurrency(summary?.last_month || 0)}
              </Text>
            </Card>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'invoices' && styles.tabActive]}
            onPress={() => setActiveTab('invoices')}
          >
            <Text style={[styles.tabText, activeTab === 'invoices' && styles.tabTextActive]}>
              Invoices
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'payouts' && styles.tabActive]}
            onPress={() => setActiveTab('payouts')}
          >
            <Text style={[styles.tabText, activeTab === 'payouts' && styles.tabTextActive]}>
              Payouts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View style={styles.overviewContent}>
            <Card style={styles.actionCard}>
              <Text style={styles.actionTitle}>Payment Settings</Text>
              <Text style={styles.actionDescription}>
                Manage your payout methods and payment preferences
              </Text>
              <Button
                title="Manage Payment Methods"
                onPress={() => navigation.navigate('AddPaymentMethod')}
                color={attorneyColors.accent}
              />
            </Card>

            <Card style={styles.actionCard}>
              <Text style={styles.actionTitle}>Create Invoice</Text>
              <Text style={styles.actionDescription}>
                Generate a new invoice for your services
              </Text>
              <Button
                title="Create Invoice"
                onPress={() => navigation.navigate('CreateInvoice')}
                color={attorneyColors.accent}
              />
            </Card>
          </View>
        )}

        {activeTab === 'invoices' && (
          <View style={styles.listContent}>
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <Card key={invoice.id} style={styles.listCard}>
                  <View style={styles.listHeader}>
                    <Text style={styles.listTitle} numberOfLines={1}>
                      {invoice.matter_title}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(invoice.status)}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(invoice.status) },
                        ]}
                      >
                        {invoice.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.listSubtitle}>{invoice.client_name}</Text>
                  <View style={styles.listFooter}>
                    <Text style={styles.listAmount}>{formatCurrency(invoice.amount)}</Text>
                    <Text style={styles.listDate}>{formatDate(invoice.created_at)}</Text>
                  </View>
                </Card>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color={attorneyColors.textSecondary} />
                <Text style={styles.emptyTitle}>No Invoices</Text>
                <Text style={styles.emptyText}>
                  Your invoices will appear here once you create them.
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'payouts' && (
          <View style={styles.listContent}>
            {payouts.length > 0 ? (
              payouts.map((payout) => (
                <Card key={payout.id} style={styles.listCard}>
                  <View style={styles.listHeader}>
                    <Text style={styles.listAmount}>{formatCurrency(payout.amount)}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(payout.status)}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(payout.status) },
                        ]}
                      >
                        {payout.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.listFooter}>
                    <Text style={styles.listDate}>Initiated: {formatDate(payout.created_at)}</Text>
                    {payout.paid_at && (
                      <Text style={styles.listDate}>Paid: {formatDate(payout.paid_at)}</Text>
                    )}
                  </View>
                </Card>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="wallet-outline" size={48} color={attorneyColors.textSecondary} />
                <Text style={styles.emptyTitle}>No Payouts Yet</Text>
                <Text style={styles.emptyText}>
                  Your payout history will appear here.
                </Text>
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
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  summarySection: {
    padding: spacing.md,
  },
  mainEarningsCard: {
    backgroundColor: attorneyColors.accent,
    borderColor: attorneyColors.accent,
    marginBottom: spacing.md,
  },
  earningsLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xs,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  pendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  pendingLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  pendingAmount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: '#FFFFFF',
  },
  monthlyCards: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  monthCard: {
    flex: 1,
    backgroundColor: attorneyColors.bgSecondary,
    borderColor: attorneyColors.border,
  },
  monthLabel: {
    fontSize: fontSize.xs,
    color: attorneyColors.textSecondary,
    marginBottom: spacing.xs,
  },
  monthAmount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
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
  overviewContent: {
    padding: spacing.md,
  },
  actionCard: {
    backgroundColor: attorneyColors.bgSecondary,
    borderColor: attorneyColors.border,
    marginBottom: spacing.md,
  },
  actionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
    marginBottom: spacing.xs,
  },
  actionDescription: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
    marginBottom: spacing.md,
  },
  listContent: {
    padding: spacing.md,
  },
  listCard: {
    backgroundColor: attorneyColors.bgSecondary,
    borderColor: attorneyColors.border,
    marginBottom: spacing.sm,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  listTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: attorneyColors.textPrimary,
    marginRight: spacing.sm,
  },
  listSubtitle: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
    marginBottom: spacing.sm,
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listAmount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.accent,
  },
  listDate: {
    fontSize: fontSize.xs,
    color: attorneyColors.textSecondary,
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
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: attorneyColors.textSecondary,
    textAlign: 'center',
  },
});
