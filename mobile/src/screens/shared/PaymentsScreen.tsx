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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Button } from '../../components';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Payment } from '../../types';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type PaymentsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export function PaymentsScreen({ navigation }: PaymentsScreenProps) {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'methods'>('history');
  const [savedMethods, setSavedMethods] = useState<any[]>([]);

  const fetchPayments = useCallback(async () => {
    try {
      const data = await api.getPayments();
      setPayments(data.results || data || []);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const data = await api.getPaymentMethods();
      setSavedMethods(data.results || data || []);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchPaymentMethods();
  }, [fetchPayments, fetchPaymentMethods]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPayments();
    fetchPaymentMethods();
  }, [fetchPayments, fetchPaymentMethods]);

  const handleAddPaymentMethod = () => {
    navigation.navigate('AddPaymentMethod');
  };

  const handleRemovePaymentMethod = (methodId: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.removePaymentMethod(methodId);
              fetchPaymentMethods();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove payment method');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'succeeded':
        return '#065F46';
      case 'pending':
        return '#D97706';
      case 'failed':
      case 'refunded':
        return '#DC2626';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'completed':
      case 'succeeded':
        return '#D1FAE5';
      case 'pending':
        return '#FEF3C7';
      case 'failed':
      case 'refunded':
        return '#FEE2E2';
      default:
        return colors.backgroundTertiary;
    }
  };

  const getCardIcon = (brand: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳 Visa';
      case 'mastercard':
        return '💳 Mastercard';
      case 'amex':
        return '💳 Amex';
      default:
        return '💳 Card';
    }
  };

  const renderPayment = ({ item }: { item: Payment }) => (
    <Card variant="outlined" style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View>
          <Text style={styles.paymentDescription}>
            {item.description || 'Payment'}
          </Text>
          <Text style={styles.paymentDate}>
            {new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.paymentRight}>
          <Text style={styles.paymentAmount}>
            ${parseFloat(item.amount).toFixed(2)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBackground(item.status) },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      {item.matter_title && (
        <Text style={styles.matterInfo}>For: {item.matter_title}</Text>
      )}

      {item.receipt_url && (
        <TouchableOpacity
          style={styles.receiptButton}
          onPress={() => {/* Open receipt */}}
        >
          <Text style={styles.receiptText}>View Receipt</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  const renderPaymentMethod = ({ item }: { item: any }) => (
    <Card variant="outlined" style={styles.methodCard}>
      <View style={styles.methodContent}>
        <View style={styles.methodInfo}>
          <Text style={styles.methodBrand}>{getCardIcon(item.brand)}</Text>
          <Text style={styles.methodLast4}>•••• {item.last4}</Text>
          <Text style={styles.methodExpiry}>
            Expires {item.exp_month}/{item.exp_year}
          </Text>
        </View>
        {item.is_default && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      <View style={styles.methodActions}>
        {!item.is_default && (
          <TouchableOpacity
            style={styles.methodAction}
            onPress={async () => {
              try {
                await api.setDefaultPaymentMethod(item.id);
                fetchPaymentMethods();
              } catch (error) {
                Alert.alert('Error', 'Failed to set default');
              }
            }}
          >
            <Text style={styles.methodActionText}>Set Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.methodAction}
          onPress={() => handleRemovePaymentMethod(item.id)}
        >
          <Text style={[styles.methodActionText, styles.removeText]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderEmptyPayments = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Payments</Text>
      <Text style={styles.emptyText}>
        Your payment history will appear here after you make a payment.
      </Text>
    </View>
  );

  const renderEmptyMethods = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Payment Methods</Text>
      <Text style={styles.emptyText}>
        Add a payment method to make payments quickly and securely.
      </Text>
      <Button
        title="Add Payment Method"
        onPress={handleAddPaymentMethod}
        style={styles.addButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Payments</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}
          >
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'methods' && styles.tabActive]}
          onPress={() => setActiveTab('methods')}
        >
          <Text
            style={[styles.tabText, activeTab === 'methods' && styles.tabTextActive]}
          >
            Payment Methods
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.clientAccent} />
        </View>
      ) : activeTab === 'history' ? (
        <FlatList
          data={payments}
          renderItem={renderPayment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyPayments}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.clientAccent}
            />
          }
        />
      ) : (
        <View style={styles.methodsContainer}>
          <FlatList
            data={savedMethods}
            renderItem={renderPaymentMethod}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyMethods}
            ListFooterComponent={
              savedMethods.length > 0 ? (
                <Button
                  title="Add Payment Method"
                  onPress={handleAddPaymentMethod}
                  variant="outline"
                  style={styles.addMethodButton}
                />
              ) : null
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.clientAccent,
  },
  tabText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  tabTextActive: {
    color: colors.clientAccent,
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
  paymentCard: {
    marginBottom: spacing.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paymentDescription: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  paymentDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
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
  matterInfo: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  receiptButton: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  receiptText: {
    fontSize: fontSize.sm,
    color: colors.clientAccent,
    fontWeight: fontWeight.medium,
  },
  methodsContainer: {
    flex: 1,
  },
  methodCard: {
    marginBottom: spacing.md,
  },
  methodContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  methodBrand: {
    fontSize: fontSize.md,
  },
  methodLast4: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  methodExpiry: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  defaultBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.clientAccentMuted,
  },
  defaultText: {
    fontSize: fontSize.xs,
    color: colors.clientAccent,
    fontWeight: fontWeight.medium,
  },
  methodActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  methodAction: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  methodActionText: {
    fontSize: fontSize.sm,
    color: colors.clientAccent,
    fontWeight: fontWeight.medium,
  },
  removeText: {
    color: '#DC2626',
  },
  addMethodButton: {
    marginTop: spacing.md,
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
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  addButton: {
    minWidth: 200,
  },
});
