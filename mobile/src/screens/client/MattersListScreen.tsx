import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components';
import api from '../../services/api';
import { Matter } from '../../types';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type MattersListScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const STATUS_FILTERS = ['all', 'draft', 'submitted', 'active', 'completed'];

export function MattersListScreen({ navigation }: MattersListScreenProps) {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchMatters = useCallback(async () => {
    try {
      const params: Record<string, any> = {};
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      const data = await api.getMatters(params);
      setMatters(data.results || data || []);
    } catch (error) {
      console.error('Failed to fetch matters:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchMatters();
  }, [fetchMatters]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMatters();
  }, [fetchMatters]);

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

  const renderMatter = ({ item }: { item: Matter }) => (
    <Card
      variant="outlined"
      style={styles.matterCard}
      onPress={() => navigation.navigate('MatterDetail', { matterId: item.id })}
    >
      <View style={styles.matterHeader}>
        <Text style={styles.matterTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <Text style={styles.matterType}>
        {item.matter_type} {item.reference_number ? `• ${item.reference_number}` : ''}
      </Text>

      {item.attorney && (
        <View style={styles.attorneyInfo}>
          <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.attorneyName}>{item.attorney.user.full_name}</Text>
        </View>
      )}

      <Text style={styles.matterDate}>
        Created: {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="briefcase-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Matters Found</Text>
      <Text style={styles.emptyText}>
        Start a new legal intake to create your first matter.
      </Text>
      <Button
        title="Start New Matter"
        onPress={() => navigation.navigate('NewMatter')}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedStatus === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedStatus(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedStatus === item && styles.filterChipTextActive,
                ]}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Matters List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.clientAccent} />
        </View>
      ) : (
        <FlatList
          data={matters}
          renderItem={renderMatter}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.clientAccent}
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewMatter')}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  filterContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterList: {
    paddingHorizontal: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundTertiary,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.clientAccent,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: fontWeight.medium,
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
  matterCard: {
    marginBottom: spacing.md,
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
  matterType: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginBottom: spacing.xs,
  },
  attorneyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  attorneyName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  matterDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.clientAccent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
