import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { attorneyColors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type ClientsListScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface Client {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
  };
  active_matters_count: number;
  total_matters_count: number;
  last_activity?: string;
}

export function ClientsListScreen({ navigation }: ClientsListScreenProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClients = useCallback(async () => {
    try {
      const data = await api.getAttorneyClients();
      const clientList = data.results || data || [];
      setClients(clientList);
      setFilteredClients(clientList);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchClients();
    });
    return unsubscribe;
  }, [navigation, fetchClients]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = clients.filter(
        (client) =>
          client.user.first_name.toLowerCase().includes(query) ||
          client.user.last_name.toLowerCase().includes(query) ||
          client.user.email.toLowerCase().includes(query)
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClients();
  }, [fetchClients]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No activity';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderClient = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={styles.clientCard}
      onPress={() =>
        navigation.navigate('ClientDetail', { clientId: item.id })
      }
    >
      <View style={styles.avatarContainer}>
        {item.user.avatar ? (
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.user.first_name?.[0]}
              {item.user.last_name?.[0]}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>
          {item.user.first_name} {item.user.last_name}
        </Text>
        <Text style={styles.clientEmail}>{item.user.email}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.active_matters_count || 0}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.total_matters_count || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      <View style={styles.activityContainer}>
        <Text style={styles.activityLabel}>Last Activity</Text>
        <Text style={styles.activityDate}>{formatDate(item.last_activity)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={attorneyColors.textSecondary} />
      <Text style={styles.emptyTitle}>No Clients Yet</Text>
      <Text style={styles.emptyText}>
        Your client list will appear here once you start working with clients.
      </Text>
    </View>
  );

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
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search clients..."
          placeholderTextColor={attorneyColors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Client Stats */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{clients.length}</Text>
          <Text style={styles.summaryLabel}>Total Clients</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {clients.filter((c) => c.active_matters_count > 0).length}
          </Text>
          <Text style={styles.summaryLabel}>Active Clients</Text>
        </View>
      </View>

      <FlatList
        data={filteredClients}
        renderItem={renderClient}
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
  searchContainer: {
    padding: spacing.md,
    backgroundColor: attorneyColors.bgSecondary,
  },
  searchInput: {
    backgroundColor: attorneyColors.bgPrimary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: attorneyColors.textPrimary,
    borderWidth: 1,
    borderColor: attorneyColors.border,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: attorneyColors.bgSecondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: attorneyColors.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: attorneyColors.accent,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    color: attorneyColors.textSecondary,
    marginTop: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: attorneyColors.border,
    marginVertical: spacing.xs,
  },
  listContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  clientCard: {
    flexDirection: 'row',
    backgroundColor: attorneyColors.bgSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: attorneyColors.border,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: attorneyColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: '#FFFFFF',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
    marginBottom: spacing.xs,
  },
  clientEmail: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.accent,
    marginRight: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: attorneyColors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: attorneyColors.border,
    marginHorizontal: spacing.sm,
  },
  activityContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  activityLabel: {
    fontSize: fontSize.xs,
    color: attorneyColors.textSecondary,
    marginBottom: spacing.xs,
  },
  activityDate: {
    fontSize: fontSize.xs,
    color: attorneyColors.textPrimary,
  },
  separator: {
    height: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
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
