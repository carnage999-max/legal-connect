import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Card, Button } from '../../components';
import api from '../../services/api';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type BookAppointmentScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ params: { attorneyId: string; matterId?: string } }, 'params'>;
};

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface AttorneyInfo {
  id: string;
  user: {
    first_name: string;
    last_name: string;
  };
  hourly_rate: number;
}

export function BookAppointmentScreen({ navigation, route }: BookAppointmentScreenProps) {
  const { attorneyId, matterId } = route.params;
  const [attorney, setAttorney] = useState<AttorneyInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  useEffect(() => {
    // Generate next 7 days
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    setWeekDates(dates);
  }, []);

  const fetchAttorney = useCallback(async () => {
    try {
      const data = await api.getAttorneyProfile(attorneyId);
      setAttorney(data);
    } catch (error) {
      console.error('Failed to fetch attorney:', error);
    }
  }, [attorneyId]);

  const fetchSlots = useCallback(async () => {
    try {
      setIsLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const data = await api.getAvailableSlots({
        attorney_id: attorneyId,
        date: dateStr,
      });
      const raw = (data && (data.slots || data.results || data)) || [];
      const mapped: TimeSlot[] = raw.map((slot: any, idx: number) => ({
        id: `${dateStr}-${slot.start_time}-${slot.end_time}-${idx}`,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_available: !!slot.is_available,
      }));
      setAvailableSlots(mapped);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  }, [attorneyId, selectedDate]);

  useEffect(() => {
    fetchAttorney();
  }, [fetchAttorney]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleBook = async () => {
    if (!selectedSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    setIsBooking(true);
    try {
      await api.createAppointment({
        attorney_id: attorneyId,
        matter_id: matterId,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        notes,
      });

      Alert.alert('Success', 'Appointment booked successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to book appointment';
      Alert.alert('Error', message);
    } finally {
      setIsBooking(false);
    }
  };

  const formatTime = (hhmm: string) => {
    // Expect 'HH:MM'; format to 'h:MM AM/PM'
    const [hStr, mStr] = hhmm.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr || '0', 10);
    if (Number.isNaN(h)) return hhmm;
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const mm = m.toString().padStart(2, '0');
    return `${hour12}:${mm} ${period}`;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Attorney Info */}
        {attorney && (
          <Card style={styles.attorneyCard}>
            <Text style={styles.bookingWith}>Booking with</Text>
            <Text style={styles.attorneyName}>
              {attorney.user.first_name} {attorney.user.last_name}
            </Text>
            <Text style={styles.rate}>${attorney.hourly_rate}/hour</Text>
          </Card>
        )}

        {/* Date Selection */}
        <View style={styles.dateSection}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Text style={styles.monthText}>
            {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {weekDates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateCard,
                  isSameDay(date, selectedDate) && styles.dateCardSelected,
                  isToday(date) && styles.dateCardToday,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text
                  style={[
                    styles.dayName,
                    isSameDay(date, selectedDate) && styles.dateTextSelected,
                  ]}
                >
                  {DAYS[date.getDay()]}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    isSameDay(date, selectedDate) && styles.dateTextSelected,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Slots */}
        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>Available Times</Text>

          {isLoading ? (
            <View style={styles.loadingSlots}>
              <ActivityIndicator size="small" color={colors.clientAccent} />
            </View>
          ) : availableSlots.length > 0 ? (
            <View style={styles.slotsGrid}>
              {availableSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slotButton,
                    selectedSlot?.id === slot.id && styles.slotButtonSelected,
                    !slot.is_available && styles.slotButtonDisabled,
                  ]}
                  onPress={() => slot.is_available && setSelectedSlot(slot)}
                  disabled={!slot.is_available}
                >
                  <Text
                    style={[
                      styles.slotText,
                      selectedSlot?.id === slot.id && styles.slotTextSelected,
                      !slot.is_available && styles.slotTextDisabled,
                    ]}
                  >
                    {formatTime(slot.start_time)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noSlots}>
              <Text style={styles.noSlotsText}>No available slots for this date</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any notes for the attorney..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Summary */}
        {selectedSlot && (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Appointment Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date</Text>
              <Text style={styles.summaryValue}>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time</Text>
              <Text style={styles.summaryValue}>
                {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
              </Text>
            </View>
            {attorney && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Cost</Text>
                <Text style={styles.summaryValue}>${attorney.hourly_rate}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Book Button */}
        <View style={styles.bookButtonContainer}>
          <Button
            title="Confirm Booking"
            onPress={handleBook}
            loading={isBooking}
            disabled={!selectedSlot}
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    padding: spacing.md,
  },
  attorneyCard: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  bookingWith: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  attorneyName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  rate: {
    fontSize: fontSize.md,
    color: colors.clientAccent,
    fontWeight: fontWeight.medium,
  },
  dateSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  monthText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  dateScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  dateCard: {
    width: 60,
    height: 70,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateCardSelected: {
    backgroundColor: colors.clientAccent,
    borderColor: colors.clientAccent,
  },
  dateCardToday: {
    borderColor: colors.clientAccent,
    borderWidth: 2,
  },
  dayName: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dayNumber: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  dateTextSelected: {
    color: colors.white,
  },
  timeSection: {
    marginBottom: spacing.lg,
  },
  loadingSlots: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 90,
    alignItems: 'center',
  },
  slotButtonSelected: {
    backgroundColor: colors.clientAccent,
    borderColor: colors.clientAccent,
  },
  slotButtonDisabled: {
    backgroundColor: colors.backgroundTertiary,
    borderColor: colors.border,
  },
  slotText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  slotTextSelected: {
    color: colors.white,
  },
  slotTextDisabled: {
    color: colors.textSecondary,
  },
  noSlots: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
  },
  noSlotsText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  notesSection: {
    marginBottom: spacing.lg,
  },
  notesInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    minHeight: 100,
  },
  summaryCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.clientAccentMuted,
  },
  summaryTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.clientAccent,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  bookButtonContainer: {
    marginTop: spacing.md,
  },
});
