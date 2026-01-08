import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type HelpCenterScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_SECTIONS: { title: string; items: FAQItem[] }[] = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I create a new legal matter?',
        answer: 'To create a new legal matter, go to the Dashboard and tap "New Matter" or navigate to the Matters tab and tap the + button. Follow the step-by-step wizard to describe your legal issue, add relevant parties, and submit for attorney matching.',
      },
      {
        question: 'How does attorney matching work?',
        answer: 'After you submit a legal matter, our system performs a conflict check and then matches you with qualified attorneys based on their practice areas, jurisdictions, and availability. You can review attorney profiles and select the one that best fits your needs.',
      },
      {
        question: 'Is my information secure?',
        answer: 'Yes, we take security seriously. All data is encrypted in transit and at rest. We use industry-standard security practices to protect your personal and legal information. Attorney-client privilege is maintained throughout the platform.',
      },
    ],
  },
  {
    title: 'Account & Profile',
    items: [
      {
        question: 'How do I update my profile information?',
        answer: 'Go to the Account tab, then tap "Edit Profile". You can update your name, phone number, address, and profile photo. Note that your email address cannot be changed after registration.',
      },
      {
        question: 'How do I change my password?',
        answer: 'Navigate to Account > Edit Profile, then scroll down and tap "Change Password". You\'ll need to enter your current password and then your new password twice to confirm.',
      },
      {
        question: 'Can I delete my account?',
        answer: 'Yes, you can delete your account from the Account tab by scrolling to the bottom and tapping "Delete Account". This action is permanent and will remove all your data from our system.',
      },
    ],
  },
  {
    title: 'Matters & Cases',
    items: [
      {
        question: 'What happens after I submit a matter?',
        answer: 'After submission, your matter goes through a conflict check to ensure no conflicts of interest exist. Once cleared, it enters the attorney matching phase where compatible attorneys can review and accept your case.',
      },
      {
        question: 'Can I edit my matter after submission?',
        answer: 'You can edit matters that are still in draft status. Once submitted, certain fields become locked to maintain the integrity of the conflict check and matching process. Contact your assigned attorney for any necessary changes.',
      },
      {
        question: 'How do I communicate with my attorney?',
        answer: 'Once an attorney is assigned to your matter, you can communicate through the Messages tab. All conversations are secure and encrypted. You can also schedule appointments directly through the app.',
      },
    ],
  },
  {
    title: 'Payments & Billing',
    items: [
      {
        question: 'How do I add a payment method?',
        answer: 'Go to Account > Payment Methods and tap "Add Payment Method". We accept major credit cards and debit cards. Your payment information is securely stored and processed.',
      },
      {
        question: 'When am I charged for services?',
        answer: 'Billing varies depending on the attorney\'s fee structure (hourly, flat fee, or contingency). You\'ll see the fee structure and estimated costs before accepting any engagement. Invoices are sent through the app and can be paid directly.',
      },
      {
        question: 'Can I get a refund?',
        answer: 'Refund policies vary by attorney and engagement type. Please review the terms of your specific engagement or contact your attorney directly for refund inquiries.',
      },
    ],
  },
  {
    title: 'Documents',
    items: [
      {
        question: 'What file types can I upload?',
        answer: 'You can upload PDF, Word documents (.doc, .docx), images (.jpg, .png), and text files. The maximum file size is 25MB per document.',
      },
      {
        question: 'Are my documents secure?',
        answer: 'Yes, all documents are encrypted and stored securely in the cloud. Only you and your assigned attorney have access to your documents. We use enterprise-grade security measures to protect your files.',
      },
      {
        question: 'Can I sign documents electronically?',
        answer: 'Yes, Legal Connect supports electronic signatures. When your attorney sends a document for signature, you\'ll receive a notification and can sign directly within the app.',
      },
    ],
  },
];

export function HelpCenterScreen({ navigation }: HelpCenterScreenProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:info@legalconnectapp.com?subject=Support Request');
  };

  const handleVisitWebsite = () => {
    Linking.openURL('https://www.legalconnectapp.com');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionCard} onPress={handleContactSupport}>
            <Ionicons name="mail-outline" size={28} color={colors.clientAccent} />
            <Text style={styles.quickActionText}>Email Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} onPress={handleVisitWebsite}>
            <Ionicons name="globe-outline" size={28} color={colors.clientAccent} />
            <Text style={styles.quickActionText}>Visit Website</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Sections */}
        <Text style={styles.sectionHeader}>Frequently Asked Questions</Text>

        {FAQ_SECTIONS.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.faqSection}>
            <Text style={styles.faqSectionTitle}>{section.title}</Text>
            <Card variant="outlined" style={styles.faqCard}>
              {section.items.map((item, itemIndex) => {
                const itemKey = `${sectionIndex}-${itemIndex}`;
                const isExpanded = expandedItems.has(itemKey);

                return (
                  <View key={itemIndex}>
                    <TouchableOpacity
                      style={[
                        styles.faqItem,
                        itemIndex < section.items.length - 1 && styles.faqItemBorder,
                      ]}
                      onPress={() => toggleItem(itemKey)}
                    >
                      <Text style={styles.faqQuestion}>{item.question}</Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                    {isExpanded && (
                      <View style={styles.faqAnswerContainer}>
                        <Text style={styles.faqAnswer}>{item.answer}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </Card>
          </View>
        ))}

        {/* Contact Section */}
        <Card style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactText}>
            Our support team is available Monday through Friday, 9 AM to 6 PM EST.
          </Text>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
            <Ionicons name="mail" size={20} color={colors.white} />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

export default HelpCenterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    padding: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  sectionHeader: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  faqSection: {
    marginBottom: spacing.lg,
  },
  faqSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  faqCard: {
    padding: 0,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  faqItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqQuestion: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  faqAnswerContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  faqAnswer: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  contactCard: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  contactTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  contactText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.clientAccent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  contactButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
});
