import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Input } from '../../components';
import api from '../../services/api';
import { PracticeArea, Jurisdiction } from '../../types';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type NewMatterScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const MATTER_TYPES = [
  { value: 'civil', label: 'Civil', description: 'Lawsuits, disputes' },
  { value: 'criminal', label: 'Criminal', description: 'Defense or charges' },
  { value: 'family', label: 'Family', description: 'Divorce, custody' },
  { value: 'contract', label: 'Contract', description: 'Agreements, breach' },
  { value: 'corporate', label: 'Corporate', description: 'Business matters' },
  { value: 'real_estate', label: 'Real Estate', description: 'Property issues' },
  { value: 'immigration', label: 'Immigration', description: 'Visas, status' },
  { value: 'other', label: 'Other', description: 'Other legal issues' },
];

const STEPS = ['Type', 'Details', 'Parties', 'Review'];

export function NewMatterScreen({ navigation }: NewMatterScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [matterType, setMatterType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [parties, setParties] = useState<{ name: string; type: string; isClient: boolean }[]>([
    { name: '', type: 'plaintiff', isClient: true },
  ]);
  const [jurisdiction, setJurisdiction] = useState('');
  const [urgency, setUrgency] = useState('normal');

  // Reference data
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);

  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    try {
      const [jurisdictionsData, practiceAreasData] = await Promise.all([
        api.getJurisdictions(),
        api.getPracticeAreas(),
      ]);
      setJurisdictions(jurisdictionsData.results || jurisdictionsData || []);
      setPracticeAreas(practiceAreasData.results || practiceAreasData || []);
    } catch (error) {
      console.error('Failed to load reference data:', error);
    }
  };

  const addParty = () => {
    setParties([...parties, { name: '', type: 'other', isClient: false }]);
  };

  const removeParty = (index: number) => {
    if (parties.length > 1) {
      setParties(parties.filter((_, i) => i !== index));
    }
  };

  const updateParty = (index: number, field: string, value: any) => {
    const newParties = [...parties];
    newParties[index] = { ...newParties[index], [field]: value };
    setParties(newParties);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!matterType;
      case 1:
        return title.trim().length > 0 && description.trim().length > 0;
      case 2:
        return parties.every((p) => p.name.trim().length > 0);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const matterData = {
        title,
        description,
        matter_type: matterType,
        jurisdiction: jurisdiction || undefined,
        parties: parties.map((p) => ({
          name: p.name,
          party_type: 'individual', // Default to individual, options: individual, organization, government
          role: p.type === 'plaintiff' ? 'related' : (p.type === 'defendant' ? 'opposing' : 'other'),
        })),
      };

      const matter = await api.createMatter(matterData);

      // Submit for review
      await api.submitMatter(matter.id);

      // Request conflict check (this enables attorney matching)
      await api.requestConflictCheck(matter.id);

      Alert.alert(
        'Matter Submitted',
        'Your case has been submitted and conflict checks are complete. View your matched attorneys.',
        [
          {
            text: 'View Matches',
            onPress: () => navigation.replace('LawyerMatching', { matterId: matter.id }),
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to create matter:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to submit your case. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, index) => (
        <View key={step} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              index <= currentStep && styles.stepCircleActive,
              index < currentStep && styles.stepCircleCompleted,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                index <= currentStep && styles.stepNumberActive,
              ]}
            >
              {index < currentStep ? '✓' : index + 1}
            </Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              index === currentStep && styles.stepLabelActive,
            ]}
          >
            {step}
          </Text>
          {index < STEPS.length - 1 && <View style={styles.stepLine} />}
        </View>
      ))}
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What type of legal issue is this?</Text>
            <Text style={styles.stepDescription}>
              Select the category that best describes your legal matter.
            </Text>
            <View style={styles.typeGrid}>
              {MATTER_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeCard,
                    matterType === type.value && styles.typeCardActive,
                  ]}
                  onPress={() => setMatterType(type.value)}
                >
                  <Text
                    style={[
                      styles.typeLabel,
                      matterType === type.value && styles.typeLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                  <Text style={styles.typeDescription}>{type.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Describe your legal issue</Text>
            <Text style={styles.stepDescription}>
              Provide a title and detailed description of your situation.
            </Text>

            <Input
              label="Issue Title"
              placeholder="Brief title for your case"
              value={title}
              onChangeText={setTitle}
              containerStyle={{ marginTop: spacing.md }}
            />

            <View style={styles.textAreaContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe your legal issue in detail. Include relevant facts, dates, and any questions you have."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.charCount}>
                {description.length} / 2000 characters
              </Text>
            </View>

            <View style={styles.urgencyContainer}>
              <Text style={styles.label}>Urgency Level</Text>
              <View style={styles.urgencyButtons}>
                {['low', 'normal', 'high', 'urgent'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.urgencyButton,
                      urgency === level && styles.urgencyButtonActive,
                    ]}
                    onPress={() => setUrgency(level)}
                  >
                    <Text
                      style={[
                        styles.urgencyText,
                        urgency === level && styles.urgencyTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Parties involved</Text>
            <Text style={styles.stepDescription}>
              List all parties involved in this matter for conflict checking.
            </Text>

            {parties.map((party, index) => (
              <Card key={index} variant="outlined" style={styles.partyCard}>
                <View style={styles.partyHeader}>
                  <Text style={styles.partyTitle}>Party {index + 1}</Text>
                  {parties.length > 1 && (
                    <TouchableOpacity onPress={() => removeParty(index)}>
                      <Text style={styles.removeParty}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Input
                  label="Full Name"
                  placeholder="Enter party's full name"
                  value={party.name}
                  onChangeText={(value) => updateParty(index, 'name', value)}
                />

                <View style={styles.partyTypeContainer}>
                  <Text style={styles.label}>Role</Text>
                  <View style={styles.partyTypeButtons}>
                    {['plaintiff', 'defendant', 'other'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.partyTypeButton,
                          party.type === type && styles.partyTypeButtonActive,
                        ]}
                        onPress={() => updateParty(index, 'type', type)}
                      >
                        <Text
                          style={[
                            styles.partyTypeText,
                            party.type === type && styles.partyTypeTextActive,
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.clientCheckbox}
                  onPress={() => updateParty(index, 'isClient', !party.isClient)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      party.isClient && styles.checkboxChecked,
                    ]}
                  >
                    {party.isClient && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>This is me</Text>
                </TouchableOpacity>
              </Card>
            ))}

            <Button
              title="+ Add Another Party"
              onPress={addParty}
              variant="outline"
              fullWidth
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review your submission</Text>
            <Text style={styles.stepDescription}>
              Please review your information before submitting.
            </Text>

            <Card variant="outlined" style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Type:</Text>
                <Text style={styles.reviewValue}>
                  {MATTER_TYPES.find((t) => t.value === matterType)?.label}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Title:</Text>
                <Text style={styles.reviewValue}>{title}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Urgency:</Text>
                <Text style={[styles.reviewValue, { textTransform: 'capitalize' }]}>
                  {urgency}
                </Text>
              </View>
            </Card>

            <Card variant="outlined" style={styles.reviewCard}>
              <Text style={styles.reviewSectionTitle}>Description</Text>
              <Text style={styles.reviewDescription}>{description}</Text>
            </Card>

            <Card variant="outlined" style={styles.reviewCard}>
              <Text style={styles.reviewSectionTitle}>Parties</Text>
              {parties.map((party, index) => (
                <View key={index} style={styles.reviewParty}>
                  <Text style={styles.reviewValue}>
                    {party.name} ({party.type})
                    {party.isClient && ' - You'}
                  </Text>
                </View>
              ))}
            </Card>

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                By submitting, you acknowledge that the information provided is accurate.
                Your data will be used to check for conflicts and match you with attorneys.
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderStepIndicator()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Back"
          onPress={handleBack}
          variant="outline"
          style={styles.footerButton}
        />
        <Button
          title={currentStep === STEPS.length - 1 ? 'Submit' : 'Continue'}
          onPress={handleNext}
          disabled={!canProceed()}
          loading={isSubmitting}
          style={styles.footerButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.clientAccent,
  },
  stepCircleCompleted: {
    backgroundColor: colors.success,
  },
  stepNumber: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  stepNumberActive: {
    color: colors.white,
  },
  stepLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  stepLabelActive: {
    color: colors.clientAccent,
    fontWeight: fontWeight.medium,
  },
  stepLine: {
    width: 20,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  typeCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  typeCardActive: {
    borderColor: colors.clientAccent,
    backgroundColor: colors.clientAccentMuted,
  },
  typeLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  typeLabelActive: {
    color: colors.clientAccent,
  },
  typeDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  textAreaContainer: {
    marginBottom: spacing.md,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    minHeight: 150,
  },
  charCount: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  urgencyContainer: {
    marginBottom: spacing.md,
  },
  urgencyButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  urgencyButtonActive: {
    borderColor: colors.clientAccent,
    backgroundColor: colors.clientAccentMuted,
  },
  urgencyText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  urgencyTextActive: {
    color: colors.clientAccent,
  },
  partyCard: {
    marginBottom: spacing.md,
  },
  partyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  partyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  removeParty: {
    fontSize: fontSize.sm,
    color: colors.error,
  },
  partyTypeContainer: {
    marginBottom: spacing.sm,
  },
  partyTypeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  partyTypeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  partyTypeButtonActive: {
    borderColor: colors.clientAccent,
    backgroundColor: colors.clientAccentMuted,
  },
  partyTypeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  partyTypeTextActive: {
    color: colors.clientAccent,
    fontWeight: fontWeight.medium,
  },
  clientCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.clientAccent,
    borderColor: colors.clientAccent,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: fontWeight.bold,
  },
  checkboxLabel: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  reviewCard: {
    marginBottom: spacing.md,
  },
  reviewRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  reviewLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    width: 80,
  },
  reviewValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  reviewSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  reviewDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  reviewParty: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  disclaimer: {
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
  },
  disclaimerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
