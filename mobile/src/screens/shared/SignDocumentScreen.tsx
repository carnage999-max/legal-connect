import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Card, Button } from '../../components';
import api from '../../services/api';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type SignDocumentScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ params: { documentId: string; signatureId: string } }, 'params'>;
};

interface Point {
  x: number;
  y: number;
}

const { width } = Dimensions.get('window');
const SIGNATURE_WIDTH = width - spacing.md * 4;
const SIGNATURE_HEIGHT = 200;

export function SignDocumentScreen({ navigation, route }: SignDocumentScreenProps) {
  const { documentId, signatureId } = route.params;
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isSigning, setIsSigning] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleTouchStart = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    setCurrentPath(`M${locationX},${locationY}`);
  };

  const handleTouchMove = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    setCurrentPath((prev) => `${prev} L${locationX},${locationY}`);
  };

  const handleTouchEnd = () => {
    if (currentPath) {
      setPaths((prev) => [...prev, currentPath]);
      setCurrentPath('');
    }
  };

  const clearSignature = () => {
    setPaths([]);
    setCurrentPath('');
  };

  const hasSignature = paths.length > 0 || currentPath.length > 0;

  const handleSubmit = async () => {
    if (!hasSignature) {
      Alert.alert('Error', 'Please draw your signature');
      return;
    }

    if (!agreed) {
      Alert.alert('Error', 'Please agree to the terms');
      return;
    }

    setIsSigning(true);
    try {
      // Convert paths to SVG data
      const signatureData = `<svg width="${SIGNATURE_WIDTH}" height="${SIGNATURE_HEIGHT}">
        ${[...paths, currentPath]
          .filter(Boolean)
          .map((p) => `<path d="${p}" stroke="black" fill="none" stroke-width="2"/>`)
          .join('')}
      </svg>`;

      await api.signDocument(signatureId, signatureData);

      Alert.alert('Success', 'Document signed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to sign document';
      Alert.alert('Error', message);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Instructions */}
        <Card style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Sign Document</Text>
          <Text style={styles.instructionsText}>
            Draw your signature in the box below. This electronic signature will be
            legally binding.
          </Text>
        </Card>

        {/* Signature Pad */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Your Signature</Text>
          <View
            style={styles.signaturePad}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Svg width={SIGNATURE_WIDTH} height={SIGNATURE_HEIGHT}>
              {paths.map((path, index) => (
                <Path
                  key={index}
                  d={path}
                  stroke={colors.textPrimary}
                  strokeWidth={2}
                  fill="none"
                />
              ))}
              {currentPath && (
                <Path
                  d={currentPath}
                  stroke={colors.textPrimary}
                  strokeWidth={2}
                  fill="none"
                />
              )}
            </Svg>

            {!hasSignature && (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>Sign here</Text>
              </View>
            )}
          </View>

          <View style={styles.signatureActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearSignature}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Agreement Checkbox */}
        <TouchableOpacity
          style={styles.agreementRow}
          onPress={() => setAgreed(!agreed)}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.agreementText}>
            I agree that this electronic signature is the legal equivalent of my
            manual signature on this document.
          </Text>
        </TouchableOpacity>

        {/* Legal Notice */}
        <Card style={styles.legalCard}>
          <Text style={styles.legalTitle}>Legal Notice</Text>
          <Text style={styles.legalText}>
            By signing this document electronically, you acknowledge that you have
            read and understood the document contents. Your electronic signature
            carries the same legal weight as a handwritten signature.
          </Text>
        </Card>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            title="Submit Signature"
            onPress={handleSubmit}
            loading={isSigning}
            disabled={!hasSignature || !agreed}
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
  instructionsCard: {
    marginBottom: spacing.md,
  },
  instructionsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  instructionsText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  signatureSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  signaturePad: {
    width: SIGNATURE_WIDTH,
    height: SIGNATURE_HEIGHT,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    position: 'relative',
  },
  placeholderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: fontSize.lg,
    color: colors.border,
  },
  signatureActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },
  clearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  clearButtonText: {
    fontSize: fontSize.sm,
    color: colors.clientAccent,
    fontWeight: fontWeight.medium,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.clientAccent,
    borderColor: colors.clientAccent,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: fontWeight.bold,
  },
  agreementText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  legalCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundTertiary,
  },
  legalTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  legalText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  submitContainer: {
    marginTop: spacing.md,
  },
});
