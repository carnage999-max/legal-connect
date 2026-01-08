import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Button } from '../../components';
import api from '../../services/api';
import { attorneyColors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type CalendarScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface Appointment {
  id: string;
  title: string;
  client_name: string;
  matter_type: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function CalendarScreen({ navigation }: CalendarScreenProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  useEffect(() => {
    // Generate week dates
    const today = new Date();
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    setWeekDates(dates);
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const data = await api.getAppointments({ date: dateStr });
      setAppointments(data.results || data || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await api.confirmAppointment(appointmentId);
      Alert.alert('Success', 'Appointment confirmed');
      fetchAppointments();
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.cancelAppointment(appointmentId);
              Alert.alert('Success', 'Appointment cancelled');
              fetchAppointments();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          },
        },
      ]
    );
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#065F46';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#DC2626';
      default:
        return attorneyColors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <TouchableOpacity
          style={styles.availabilityButton}
          onPress={() => navigation.navigate('ManageAvailability')}
        >
          <Text style={styles.availabilityButtonText}>Manage Availability</Text>
        </TouchableOpacity>
      </View>

      {/* Month Header */}
      <View style={styles.monthHeader}>
        <Text style={styles.monthText}>
          {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </Text>
      </View>

      {/* Week View */}
      <View style={styles.weekContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weekDates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCard,
                isSameDay(date, selectedDate) && styles.dayCardSelected,
                isToday(date) && styles.dayCardToday,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dayName,
                  isSameDay(date, selectedDate) && styles.dayTextSelected,
                ]}
              >
                {DAYS[date.getDay()]}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSameDay(date, selectedDate) && styles.dayTextSelected,
                ]}
              >
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Selected Date */}
      <View style={styles.selectedDateHeader}>
        <Text style={styles.selectedDateText}>
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Appointments */}
      <ScrollView style={styles.appointmentsContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={attorneyColors.accent} />
          </View>
        ) : appointments.length > 0 ? (
          appointments.map((apt) => (
            <Card key={apt.id} variant="outlined" style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>
                    {new Date(apt.start_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.timeDivider}>-</Text>
                  <Text style={styles.timeText}>
                    {new Date(apt.end_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(apt.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{apt.status}</Text>
                </View>
              </View>

              <Text style={styles.appointmentTitle}>{apt.title}</Text>
              <Text style={styles.clientName}>with {apt.client_name}</Text>

              {apt.matter_type && (
                <View style={styles.matterBadge}>
                  <Text style={styles.matterText}>{apt.matter_type}</Text>
                </View>
              )}

              {apt.notes && (
                <Text style={styles.notes}>{apt.notes}</Text>
              )}

              {apt.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <Button
                    title="Decline"
                    onPress={() => handleCancelAppointment(apt.id)}
                    variant="outline"
                    size="sm"
                    style={styles.declineBtn}
                  />
                  <Button
                    title="Confirm"
                    onPress={() => handleConfirmAppointment(apt.id)}
                    size="sm"
                    style={styles.confirmBtn}
                  />
                </View>
              )}

              {apt.status === 'confirmed' && (
                <View style={styles.actionButtons}>
                  <Button
                    title="Message Client"
                    onPress={() => navigation.navigate('Messaging', { appointmentId: apt.id })}
                    variant="outline"
                    size="sm"
                    style={styles.messageBtn}
                  />
                  <Button
                    title="Cancel"
                    onPress={() => handleCancelAppointment(apt.id)}
                    variant="ghost"
                    size="sm"
                  />
                </View>
              )}
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Appointments</Text>
            <Text style={styles.emptyText}>
              You have no appointments scheduled for this day.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: attorneyColors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: attorneyColors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
  },
  availabilityButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: attorneyColors.accent,
  },
  availabilityButtonText: {
    fontSize: fontSize.sm,
    color: attorneyColors.accent,
    fontWeight: fontWeight.medium,
  },
  monthHeader: {
    padding: spacing.md,
    alignItems: 'center',
  },
  monthText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
  },
  weekContainer: {
    borderBottomWidth: 1,
    borderBottomColor: attorneyColors.border,
    paddingBottom: spacing.md,
  },
  dayCard: {
    width: 50,
    height: 70,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: attorneyColors.bgSecondary,
  },
  dayCardSelected: {
    backgroundColor: attorneyColors.accent,
  },
  dayCardToday: {
    borderWidth: 2,
    borderColor: attorneyColors.accent,
  },
  dayName: {
    fontSize: fontSize.xs,
    color: attorneyColors.textSecondary,
    marginBottom: spacing.xs,
  },
  dayNumber: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  selectedDateHeader: {
    padding: spacing.md,
    backgroundColor: attorneyColors.bgSecondary,
  },
  selectedDateText: {
    fontSize: fontSize.md,
    color: attorneyColors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  appointmentsContainer: {
    flex: 1,
    padding: spacing.md,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  appointmentCard: {
    marginBottom: spacing.md,
    backgroundColor: attorneyColors.bgSecondary,
    borderColor: attorneyColors.border,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.accent,
  },
  timeDivider: {
    color: attorneyColors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    color: '#FFFFFF',
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  appointmentTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
    marginBottom: spacing.xs,
  },
  clientName: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
    marginBottom: spacing.sm,
  },
  matterBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: attorneyColors.border,
    marginBottom: spacing.sm,
  },
  matterText: {
    fontSize: fontSize.xs,
    color: attorneyColors.textPrimary,
  },
  notes: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: attorneyColors.border,
  },
  declineBtn: {
    flex: 1,
    borderColor: attorneyColors.border,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: attorneyColors.accent,
  },
  messageBtn: {
    flex: 1,
    borderColor: attorneyColors.accent,
  },
  emptyState: {
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
  },
});
