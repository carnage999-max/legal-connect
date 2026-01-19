import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Button } from '../../components';
import api from '../../services/api';
import { attorneyColors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

type ManageAvailabilityScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  // API returns `is_active` for availability slots
  is_active: boolean;
}

// Backend maps Monday=0 ... Sunday=6. Keep UI aligned with backend.
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00',
];

export function ManageAvailabilityScreen({ navigation }: ManageAvailabilityScreenProps) {
  const { user } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // Monday index is 0 to match backend DayOfWeek (MONDAY=0)
  const [selectedDay, setSelectedDay] = useState(0);
  const [dayEnabled, setDayEnabled] = useState<Record<number, boolean>>({});
  const [selectedSlots, setSelectedSlots] = useState<Record<string, boolean>>({});

  const fetchAvailability = useCallback(async () => {
    try {
      const data = await api.getAttorneyAvailability();
      const fetchedSlots = data.results || data || [];
      setSlots(fetchedSlots);

      // Build day enabled state
      const dayState: Record<number, boolean> = {};
      const slotState: Record<string, boolean> = {};

      fetchedSlots.forEach((slot: AvailabilitySlot) => {
        dayState[slot.day_of_week] = true;
        // API field is `is_active`
        slotState[`${slot.day_of_week}-${slot.start_time}`] = !!(slot as any).is_active;
      });

      setDayEnabled(dayState);
      setSelectedSlots(slotState);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const toggleDayEnabled = (day: number) => {
    setDayEnabled((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const toggleSlot = (day: number, time: string) => {
    const key = `${day}-${time}`;
    setSelectedSlots((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isSlotSelected = (day: number, time: string) => {
    return selectedSlots[`${day}-${time}`] || false;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Build availability data
      const availabilityData: any[] = [];

      Object.keys(dayEnabled).forEach((dayStr) => {
        const day = parseInt(dayStr);
        if (dayEnabled[day]) {
          TIME_SLOTS.forEach((time) => {
            if (isSlotSelected(day, time)) {
              const endTime = getEndTime(time);
              availabilityData.push({
                day_of_week: day,
                start_time: time,
                end_time: endTime,
                is_available: true,
                // include is_active for backend compatibility
                is_active: true,
              });
            }
          });
        }
      });

      await api.updateAttorneyAvailability({ slots: availabilityData });

      Alert.alert('Success', 'Availability updated successfully');
      navigation.goBack();
    } catch (error: any) {
      // Try to surface useful server messages
      const data = error?.response?.data;
      const detail = data?.detail || data?.message;
      const fromFields = data && typeof data === 'object'
        ? Object.values(data).flat().join('\n')
        : undefined;
      const message = detail || fromFields || 'Failed to update availability';
      console.error('Availability save error:', {
        status: error?.response?.status,
        data: error?.response?.data,
      });
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  const getEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = minutes + 30;
    const endHours = endMinutes >= 60 ? hours + 1 : hours;
    const finalMinutes = endMinutes >= 60 ? endMinutes - 60 : endMinutes;
    return `${endHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // If attorney profile is not completed, guide user to onboarding
  if (!isLoading && user?.has_attorney_profile === false) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.instructionsCard}>
            <Text style={styles.instructionsText}>
              Complete your attorney profile before setting availability. This lets clients find and book you.
            </Text>
          </Card>
          <View style={styles.saveContainer}>
            <Button
              title="Complete Profile"
              onPress={() => navigation.navigate('Dashboard' as any, { screen: 'AttorneyOnboarding' })}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Instructions */}
        <Card style={styles.instructionsCard}>
          <Text style={styles.instructionsText}>
            Set your weekly availability. Clients will only be able to book
            appointments during the time slots you mark as available.
          </Text>
        </Card>

        {/* Day Selection */}
        <View style={styles.daySelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DAYS.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  selectedDay === index && styles.dayButtonSelected,
                ]}
                onPress={() => setSelectedDay(index)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    selectedDay === index && styles.dayButtonTextSelected,
                  ]}
                >
                  {day.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Day Toggle */}
        <Card style={styles.dayToggleCard}>
          <View style={styles.dayToggleRow}>
            <Text style={styles.dayToggleLabel}>{DAYS[selectedDay]}</Text>
            <Switch
              value={dayEnabled[selectedDay] || false}
              onValueChange={() => toggleDayEnabled(selectedDay)}
              trackColor={{ false: attorneyColors.border, true: attorneyColors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.dayToggleHint}>
            {dayEnabled[selectedDay]
              ? 'Select available time slots below'
              : 'Toggle on to set availability for this day'}
          </Text>
        </Card>

        {/* Time Slots */}
        {dayEnabled[selectedDay] && (
          <View style={styles.timeSlotsSection}>
            <Text style={styles.sectionTitle}>Available Times</Text>
            <View style={styles.timeSlotsGrid}>
              {TIME_SLOTS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    isSlotSelected(selectedDay, time) && styles.timeSlotSelected,
                  ]}
                  onPress={() => toggleSlot(selectedDay, time)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      isSlotSelected(selectedDay, time) && styles.timeSlotTextSelected,
                    ]}
                  >
                    {formatTime(time)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              const newState: Record<string, boolean> = { ...selectedSlots };
              TIME_SLOTS.forEach((time) => {
                newState[`${selectedDay}-${time}`] = true;
              });
              setSelectedSlots(newState);
              setDayEnabled((prev) => ({ ...prev, [selectedDay]: true }));
            }}
          >
            <Text style={styles.quickActionText}>Select All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              const newState: Record<string, boolean> = { ...selectedSlots };
              TIME_SLOTS.forEach((time) => {
                newState[`${selectedDay}-${time}`] = false;
              });
              setSelectedSlots(newState);
            }}
          >
            <Text style={styles.quickActionText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <Button
            title="Save Availability"
            onPress={handleSave}
            loading={isSaving}
            fullWidth
            size="lg"
          />
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
  instructionsCard: {
    marginBottom: spacing.md,
    backgroundColor: attorneyColors.bgSecondary,
    borderColor: attorneyColors.border,
  },
  instructionsText: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
    lineHeight: 20,
  },
  daySelector: {
    marginBottom: spacing.md,
  },
  dayButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: attorneyColors.bgSecondary,
    borderWidth: 1,
    borderColor: attorneyColors.border,
  },
  dayButtonSelected: {
    backgroundColor: attorneyColors.accent,
    borderColor: attorneyColors.accent,
  },
  dayButtonText: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  dayButtonTextSelected: {
    color: '#FFFFFF',
  },
  dayToggleCard: {
    marginBottom: spacing.md,
    backgroundColor: attorneyColors.bgSecondary,
    borderColor: attorneyColors.border,
  },
  dayToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dayToggleLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
  },
  dayToggleHint: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
  },
  timeSlotsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
    marginBottom: spacing.sm,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: attorneyColors.bgSecondary,
    borderWidth: 1,
    borderColor: attorneyColors.border,
    minWidth: 90,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: attorneyColors.accent,
    borderColor: attorneyColors.accent,
  },
  timeSlotText: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
    fontWeight: fontWeight.medium,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickActionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  quickActionText: {
    fontSize: fontSize.sm,
    color: attorneyColors.accent,
    fontWeight: fontWeight.medium,
  },
  saveContainer: {
    marginTop: spacing.md,
  },
});
