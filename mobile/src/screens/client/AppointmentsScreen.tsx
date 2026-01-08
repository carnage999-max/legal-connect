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
import { Card } from '../../components';
import api from '../../services/api';
import { Appointment } from '../../types';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type AppointmentsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const STATUS_FILTERS = ['upcoming', 'past', 'cancelled'];

export function AppointmentsScreen({ navigation }: AppointmentsScreenProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('upcoming');

  const fetchAppointments = useCallback(async () => {
    try {
      const params: Record<string, any> = {};
      if (selectedFilter === 'upcoming') {
        params.upcoming = true;
      } else if (selectedFilter === 'past') {
        params.past = true;
      } else if (selectedFilter === 'cancelled') {
        params.status = 'cancelled';
      }
      const data = await api.getAppointments(params);
      setAppointments(data.results || data || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [selectedFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments();
  }, [fetchAppointments]);

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: colors.warning,
      confirmed: colors.success,
      completed: colors.textSecondary,
      cancelled: colors.error,
    };
    return statusColors[status] || colors.textSecondary;
  };

  const getMeetingTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'video':
        return 'videocam-outline';
      case 'phone':
        return 'call-outline';
      case 'in_person':
        return 'person-outline';
      default:
        return 'calendar-outline';
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <Card variant="outlined" style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateDay}>
            {new Date(item.date).getDate()}
          </Text>
          <Text style={styles.dateMonth}>
            {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
          </Text>
        </View>

        <View style={styles.appointmentInfo}>
          <Text style={styles.appointmentTitle}>
            {item.appointment_type?.replace('_', ' ') || 'Consultation'}
          </Text>
          <Text style={styles.appointmentTime}>
            {formatTime(item.start_time)} - {formatTime(item.end_time)}
          </Text>
          {item.attorney && (
            <Text style={styles.attorneyName}>
              with {item.attorney.user?.full_name || 'Attorney'}
            </Text>
          )}
          {item.matter && (
            <Text style={styles.matterTitle} numberOfLines={1}>
              Re: {item.matter.title}
            </Text>
          )}
        </View>

        <View style={styles.rightSection}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '20' },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor(item.status) }]}
            >
              {item.status}
            </Text>
          </View>
          <View style={styles.meetingType}>
            <Ionicons
              name={getMeetingTypeIcon(item.meeting_type)}
              size={20}
              color={colors.clientAccent}
            />
          </View>
        </View>
      </View>

      {item.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          {item.notes}
        </Text>
      )}

      {item.meeting_link && item.meeting_type === 'video' && (
        <TouchableOpacity style={styles.joinButton}>
          <Ionicons name="videocam" size={16} color={colors.white} />
          <Text style={styles.joinButtonText}>Join Meeting</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Appointments</Text>
      <Text style={styles.emptyText}>
        {selectedFilter === 'upcoming'
          ? "You don't have any upcoming appointments."
          : selectedFilter === 'past'
          ? "You don't have any past appointments."
          : "No cancelled appointments."}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === filter && styles.filterTabTextActive,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Appointments List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.clientAccent} />
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: colors.clientAccent,
  },
  filterTabText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  filterTabTextActive: {
    color: colors.clientAccent,
    fontWeight: fontWeight.semibold,
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
  appointmentCard: {
    marginBottom: spacing.md,
  },
  appointmentHeader: {
    flexDirection: 'row',
  },
  dateContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dateDay: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.clientAccent,
  },
  dateMonth: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  appointmentTime: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  attorneyName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  matterTitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  meetingType: {
    padding: spacing.xs,
  },
  notes: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.clientAccent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
  },
  joinButtonText: {
    color: colors.white,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.xs,
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
  },
});
