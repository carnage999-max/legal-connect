import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Button } from '../../components';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { attorneyColors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type AttorneyOnboardingScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface PracticeArea {
  id: string;
  name: string;
}

interface Jurisdiction {
  id: string;
  name: string;
  state_code: string;
}

export function AttorneyOnboardingScreen({ navigation }: AttorneyOnboardingScreenProps) {
  const { refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Reference data
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);

  // Form state - Step 1: Bar Information
  const [barNumber, setBarNumber] = useState('');
  const [barState, setBarState] = useState('');
  const [barAdmissionDate, setBarAdmissionDate] = useState<Date | null>(null);
  const [showBarDatePicker, setShowBarDatePicker] = useState(false);
  const [yearsOfExperience, setYearsOfExperience] = useState('');

  // Form state - Step 2: Professional Info
  const [headline, setHeadline] = useState('');
  const [biography, setBiography] = useState('');
  const [education, setEducation] = useState('');
  const [languages, setLanguages] = useState('English');

  // Form state - Step 3: Practice Areas & Jurisdictions
  const [selectedPracticeAreas, setSelectedPracticeAreas] = useState<string[]>([]);
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>([]);

  // Form state - Step 4: Fees
  const [feeStructure, setFeeStructure] = useState('hourly');
  const [hourlyRate, setHourlyRate] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [freeConsultation, setFreeConsultation] = useState(false);

  // Form state - Step 5: Office Info
  const [officeAddress, setOfficeAddress] = useState('');
  const [officeCity, setOfficeCity] = useState('');
  const [officeState, setOfficeState] = useState('');
  const [officePostalCode, setOfficePostalCode] = useState('');
  const [officePhone, setOfficePhone] = useState('');

  useEffect(() => {
    fetchReferenceData();
  }, []);

  const fetchReferenceData = async () => {
    try {
      const [areasResponse, jurisdictionsResponse] = await Promise.all([
        api.getPracticeAreas(),
        api.getJurisdictions(),
      ]);
      setPracticeAreas(areasResponse.results || areasResponse || []);
      setJurisdictions(jurisdictionsResponse.results || jurisdictionsResponse || []);
    } catch (error) {
      console.error('Failed to fetch reference data:', error);
      Alert.alert('Error', 'Failed to load practice areas and jurisdictions');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePracticeArea = (id: string) => {
    setSelectedPracticeAreas((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleJurisdiction = (id: string) => {
    setSelectedJurisdictions((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]
    );
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateForApi = (date: Date | null): string | null => {
    if (!date) return null;
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const handleBarDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowBarDatePicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      setBarAdmissionDate(selectedDate);
      if (Platform.OS === 'ios') {
        setShowBarDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowBarDatePicker(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!barNumber.trim()) {
          Alert.alert('Required', 'Please enter your bar number');
          return false;
        }
        if (!barState.trim()) {
          Alert.alert('Required', 'Please enter your bar state');
          return false;
        }
        return true;
      case 2:
        if (!headline.trim()) {
          Alert.alert('Required', 'Please enter a professional headline');
          return false;
        }
        if (!biography.trim()) {
          Alert.alert('Required', 'Please enter your biography');
          return false;
        }
        return true;
      case 3:
        // Only enforce selection if options are available
        if (practiceAreas.length > 0 && selectedPracticeAreas.length === 0) {
          Alert.alert('Required', 'Please select at least one practice area');
          return false;
        }
        if (jurisdictions.length > 0 && selectedJurisdictions.length === 0) {
          Alert.alert('Required', 'Please select at least one jurisdiction');
          return false;
        }
        return true;
      case 4:
        if (!hourlyRate.trim()) {
          Alert.alert('Required', 'Please enter your hourly rate');
          return false;
        }
        return true;
      case 5:
        return true; // Office info is optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSaving(true);
    try {
      const data = {
        bar_number: barNumber,
        bar_state: barState,
        bar_admission_date: formatDateForApi(barAdmissionDate),
        years_of_experience: parseInt(yearsOfExperience) || 0,
        headline,
        biography,
        education,
        languages,
        practice_area_ids: selectedPracticeAreas,
        jurisdiction_ids: selectedJurisdictions,
        fee_structure: feeStructure,
        hourly_rate: parseFloat(hourlyRate) || 0,
        consultation_fee: parseFloat(consultationFee) || 0,
        free_consultation: freeConsultation,
        malpractice_insurance: false,
        office_address: officeAddress,
        office_city: officeCity,
        office_state: officeState,
        office_postal_code: officePostalCode,
        office_phone: officePhone,
      };

      await api.completeAttorneyOnboarding(data);
      await refreshUser();

      Alert.alert(
        'Profile Complete!',
        'Your attorney profile has been set up successfully. You can now start accepting clients.',
        [{ text: 'OK', onPress: () => navigation.replace('DashboardHome') }]
      );
    } catch (error: any) {
      console.error('Onboarding error:', error);
      const message = error.response?.data?.detail ||
        error.response?.data?.message ||
        Object.values(error.response?.data || {}).flat().join('\n') ||
        'Failed to complete profile setup';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5].map((step) => (
        <View key={step} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= step && styles.stepCircleActive,
              currentStep > step && styles.stepCircleCompleted,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                currentStep >= step && styles.stepNumberActive,
              ]}
            >
              {currentStep > step ? '✓' : step}
            </Text>
          </View>
          {step < 5 && <View style={styles.stepLine} />}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Bar Information</Text>
      <Text style={styles.stepDescription}>
        Enter your bar license details for verification.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bar Number *</Text>
        <TextInput
          style={styles.input}
          value={barNumber}
          onChangeText={setBarNumber}
          placeholder="Enter your bar number"
          placeholderTextColor={attorneyColors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bar State *</Text>
        <TextInput
          style={styles.input}
          value={barState}
          onChangeText={setBarState}
          placeholder="e.g., California, New York"
          placeholderTextColor={attorneyColors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bar Admission Date</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowBarDatePicker(true)}
        >
          <Text style={[styles.dateText, !barAdmissionDate && styles.placeholderText]}>
            {barAdmissionDate ? formatDate(barAdmissionDate) : 'Select date'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={attorneyColors.textSecondary} />
        </TouchableOpacity>
        {showBarDatePicker && (
          <DateTimePicker
            value={barAdmissionDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleBarDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Years of Experience</Text>
        <TextInput
          style={styles.input}
          value={yearsOfExperience}
          onChangeText={setYearsOfExperience}
          placeholder="e.g., 5"
          placeholderTextColor={attorneyColors.textSecondary}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Professional Profile</Text>
      <Text style={styles.stepDescription}>
        Tell potential clients about yourself.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Professional Headline *</Text>
        <TextInput
          style={styles.input}
          value={headline}
          onChangeText={setHeadline}
          placeholder="e.g., Experienced Family Law Attorney"
          placeholderTextColor={attorneyColors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Biography *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={biography}
          onChangeText={setBiography}
          placeholder="Tell clients about your experience and approach..."
          placeholderTextColor={attorneyColors.textSecondary}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Education</Text>
        <TextInput
          style={styles.input}
          value={education}
          onChangeText={setEducation}
          placeholder="e.g., J.D., Harvard Law School"
          placeholderTextColor={attorneyColors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Languages</Text>
        <TextInput
          style={styles.input}
          value={languages}
          onChangeText={setLanguages}
          placeholder="e.g., English, Spanish"
          placeholderTextColor={attorneyColors.textSecondary}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Practice Areas & Jurisdictions</Text>
      <Text style={styles.stepDescription}>
        Select your areas of expertise and where you're licensed.
      </Text>

      <Text style={styles.sectionLabel}>Practice Areas *</Text>
      <View style={styles.chipContainer}>
        {practiceAreas.length === 0 && (
          <Text style={styles.stepDescription}>No practice areas available right now.</Text>
        )}
        {practiceAreas.map((area) => (
          <TouchableOpacity
            key={area.id}
            style={[
              styles.chip,
              selectedPracticeAreas.includes(area.id) && styles.chipSelected,
            ]}
            onPress={() => togglePracticeArea(area.id)}
          >
            <Text
              style={[
                styles.chipText,
                selectedPracticeAreas.includes(area.id) && styles.chipTextSelected,
              ]}
            >
              {area.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Jurisdictions *</Text>
      <View style={styles.chipContainer}>
        {jurisdictions.length === 0 && (
          <Text style={styles.stepDescription}>No jurisdictions available right now.</Text>
        )}
        {jurisdictions.map((jurisdiction) => (
          <TouchableOpacity
            key={jurisdiction.id}
            style={[
              styles.chip,
              selectedJurisdictions.includes(jurisdiction.id) && styles.chipSelected,
            ]}
            onPress={() => toggleJurisdiction(jurisdiction.id)}
          >
            <Text
              style={[
                styles.chipText,
                selectedJurisdictions.includes(jurisdiction.id) && styles.chipTextSelected,
              ]}
            >
              {jurisdiction.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Fee Information</Text>
      <Text style={styles.stepDescription}>
        Set your rates so clients know what to expect.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fee Structure</Text>
        <View style={styles.radioGroup}>
          {['hourly', 'flat', 'contingency'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.radioButton,
                feeStructure === type && styles.radioButtonActive,
              ]}
              onPress={() => setFeeStructure(type)}
            >
              <Text
                style={[
                  styles.radioButtonText,
                  feeStructure === type && styles.radioButtonTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Hourly Rate ($) *</Text>
        <TextInput
          style={styles.input}
          value={hourlyRate}
          onChangeText={setHourlyRate}
          placeholder="e.g., 250"
          placeholderTextColor={attorneyColors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Consultation Fee ($)</Text>
        <TextInput
          style={styles.input}
          value={consultationFee}
          onChangeText={setConsultationFee}
          placeholder="e.g., 100 (leave empty for free)"
          placeholderTextColor={attorneyColors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setFreeConsultation(!freeConsultation)}
      >
        <View style={[styles.checkbox, freeConsultation && styles.checkboxChecked]}>
          {freeConsultation && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Offer free initial consultation</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Office Information</Text>
      <Text style={styles.stepDescription}>
        Where can clients reach you? (Optional)
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Office Address</Text>
        <TextInput
          style={styles.input}
          value={officeAddress}
          onChangeText={setOfficeAddress}
          placeholder="Street address"
          placeholderTextColor={attorneyColors.textSecondary}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={officeCity}
            onChangeText={setOfficeCity}
            placeholder="City"
            placeholderTextColor={attorneyColors.textSecondary}
          />
        </View>
        <View style={styles.rowSpacer} />
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            value={officeState}
            onChangeText={setOfficeState}
            placeholder="State"
            placeholderTextColor={attorneyColors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Postal Code</Text>
          <TextInput
            style={styles.input}
            value={officePostalCode}
            onChangeText={setOfficePostalCode}
            placeholder="ZIP"
            placeholderTextColor={attorneyColors.textSecondary}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.rowSpacer} />
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={officePhone}
            onChangeText={setOfficePhone}
            placeholder="Phone number"
            placeholderTextColor={attorneyColors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={attorneyColors.accent} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderStepIndicator()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Back"
          onPress={currentStep > 1 ? handleBack : () => navigation.goBack()}
          variant="outline"
          style={styles.footerButton}
        />
        <Button
          title={currentStep === 5 ? 'Complete Setup' : 'Continue'}
          onPress={currentStep === 5 ? handleSubmit : handleNext}
          loading={isSaving}
          style={styles.footerButton}
        />
      </View>
    </SafeAreaView>
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
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: attorneyColors.textSecondary,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: attorneyColors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: attorneyColors.border,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: attorneyColors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: attorneyColors.accent,
  },
  stepCircleCompleted: {
    backgroundColor: '#10B981',
  },
  stepNumber: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textSecondary,
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: attorneyColors.border,
    marginHorizontal: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    fontSize: fontSize.md,
    color: attorneyColors.textSecondary,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: attorneyColors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: attorneyColors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: attorneyColors.textPrimary,
    backgroundColor: attorneyColors.bgSecondary,
  },
  textArea: {
    minHeight: 150,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: attorneyColors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: attorneyColors.bgSecondary,
  },
  dateText: {
    fontSize: fontSize.md,
    color: attorneyColors.textPrimary,
  },
  placeholderText: {
    color: attorneyColors.textSecondary,
  },
  sectionLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: attorneyColors.bgSecondary,
    borderWidth: 1,
    borderColor: attorneyColors.border,
  },
  chipSelected: {
    backgroundColor: attorneyColors.accent,
    borderColor: attorneyColors.accent,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: fontWeight.medium,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  radioButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: attorneyColors.border,
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: attorneyColors.accent,
    backgroundColor: attorneyColors.accent + '20',
  },
  radioButtonText: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
  },
  radioButtonTextActive: {
    color: attorneyColors.accent,
    fontWeight: fontWeight.medium,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: attorneyColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: attorneyColors.accent,
    borderColor: attorneyColors.accent,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: fontWeight.bold,
  },
  checkboxLabel: {
    fontSize: fontSize.sm,
    color: attorneyColors.textPrimary,
  },
  row: {
    flexDirection: 'row',
  },
  rowSpacer: {
    width: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: attorneyColors.border,
    backgroundColor: attorneyColors.bgPrimary,
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
