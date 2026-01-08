import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components';
import api from '../../services/api';
import { attorneyColors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type CreateInvoiceScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface Client {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface InvoiceItem {
  description: string;
  quantity: string;
  unitPrice: string;
}

export function CreateInvoiceScreen({ navigation }: CreateInvoiceScreenProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: '1', unitPrice: '' },
  ]);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await api.getAttorneyClients();
      setClients(data.results || []);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: '1', unitPrice: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return sum + quantity * unitPrice;
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedClient) {
      newErrors.client = 'Please select a client';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    const hasValidItem = items.some(
      (item) => item.description && parseFloat(item.unitPrice) > 0
    );
    if (!hasValidItem) {
      newErrors.items = 'At least one item with description and price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateInvoice = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const invoiceItems = items
        .filter((item) => item.description && parseFloat(item.unitPrice) > 0)
        .map((item) => ({
          description: item.description,
          quantity: parseFloat(item.quantity) || 1,
          unit_price: parseFloat(item.unitPrice),
          total: (parseFloat(item.quantity) || 1) * parseFloat(item.unitPrice),
        }));

      const subtotal = calculateSubtotal();

      await api.createInvoice({
        client_id: selectedClient!.id,
        items: invoiceItems,
        subtotal,
        total: subtotal,
        due_date: dueDate,
        notes,
      });

      Alert.alert('Success', 'Invoice created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to create invoice';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Client Selection */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Client</Text>
            <TouchableOpacity
              style={[styles.picker, errors.client && styles.pickerError]}
              onPress={() => setShowClientPicker(!showClientPicker)}
            >
              <Text
                style={[
                  styles.pickerText,
                  !selectedClient && styles.pickerPlaceholder,
                ]}
              >
                {selectedClient
                  ? `${selectedClient.user.first_name} ${selectedClient.user.last_name}`
                  : 'Select a client'}
              </Text>
              <Ionicons
                name={showClientPicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={attorneyColors.textSecondary}
              />
            </TouchableOpacity>
            {errors.client && <Text style={styles.errorText}>{errors.client}</Text>}

            {showClientPicker && (
              <View style={styles.clientList}>
                {clients.map((client) => (
                  <TouchableOpacity
                    key={client.id}
                    style={[
                      styles.clientOption,
                      selectedClient?.id === client.id && styles.clientOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedClient(client);
                      setShowClientPicker(false);
                      setErrors((prev) => ({ ...prev, client: '' }));
                    }}
                  >
                    <Text
                      style={[
                        styles.clientOptionText,
                        selectedClient?.id === client.id && styles.clientOptionTextSelected,
                      ]}
                    >
                      {client.user.first_name} {client.user.last_name}
                    </Text>
                    <Text style={styles.clientEmail}>{client.user.email}</Text>
                  </TouchableOpacity>
                ))}
                {clients.length === 0 && (
                  <Text style={styles.noClients}>No clients found</Text>
                )}
              </View>
            )}
          </Card>

          {/* Due Date */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Due Date</Text>
            <TextInput
              style={[styles.input, errors.dueDate && styles.inputError]}
              value={dueDate}
              onChangeText={(text) => {
                setDueDate(text);
                setErrors((prev) => ({ ...prev, dueDate: '' }));
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={attorneyColors.textSecondary}
            />
            {errors.dueDate && <Text style={styles.errorText}>{errors.dueDate}</Text>}
          </Card>

          {/* Invoice Items */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Items</Text>
              <TouchableOpacity onPress={addItem} style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color={attorneyColors.accent} />
              </TouchableOpacity>
            </View>
            {errors.items && <Text style={styles.errorText}>{errors.items}</Text>}

            {items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemLabel}>Item {index + 1}</Text>
                  {items.length > 1 && (
                    <TouchableOpacity onPress={() => removeItem(index)}>
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={attorneyColors.error}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  value={item.description}
                  onChangeText={(text) => updateItem(index, 'description', text)}
                  placeholder="Description"
                  placeholderTextColor={attorneyColors.textSecondary}
                />
                <View style={styles.itemDetails}>
                  <View style={styles.qtyField}>
                    <Text style={styles.fieldLabel}>Qty</Text>
                    <TextInput
                      style={styles.smallInput}
                      value={item.quantity}
                      onChangeText={(text) => updateItem(index, 'quantity', text)}
                      keyboardType="numeric"
                      placeholder="1"
                      placeholderTextColor={attorneyColors.textSecondary}
                    />
                  </View>
                  <View style={styles.priceField}>
                    <Text style={styles.fieldLabel}>Unit Price ($)</Text>
                    <TextInput
                      style={styles.smallInput}
                      value={item.unitPrice}
                      onChangeText={(text) => updateItem(index, 'unitPrice', text)}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={attorneyColors.textSecondary}
                    />
                  </View>
                  <View style={styles.totalField}>
                    <Text style={styles.fieldLabel}>Total</Text>
                    <Text style={styles.itemTotal}>
                      {formatCurrency(
                        (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </Card>

          {/* Notes */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes or payment instructions..."
              placeholderTextColor={attorneyColors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Card>

          {/* Summary */}
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(calculateSubtotal())}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(calculateSubtotal())}</Text>
            </View>
          </Card>

          {/* Create Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Create Invoice"
              onPress={handleCreateInvoice}
              loading={isLoading}
              fullWidth
              size="lg"
              color={attorneyColors.accent}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: attorneyColors.bgPrimary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    backgroundColor: attorneyColors.bgSecondary,
    borderColor: attorneyColors.border,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
    marginBottom: spacing.sm,
  },
  addButton: {
    marginBottom: spacing.sm,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: attorneyColors.bgPrimary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: attorneyColors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pickerError: {
    borderColor: attorneyColors.error,
  },
  pickerText: {
    fontSize: fontSize.md,
    color: attorneyColors.textPrimary,
  },
  pickerPlaceholder: {
    color: attorneyColors.textSecondary,
  },
  clientList: {
    marginTop: spacing.sm,
    backgroundColor: attorneyColors.bgPrimary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: attorneyColors.border,
    maxHeight: 200,
  },
  clientOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: attorneyColors.border,
  },
  clientOptionSelected: {
    backgroundColor: `${attorneyColors.accent}20`,
  },
  clientOptionText: {
    fontSize: fontSize.md,
    color: attorneyColors.textPrimary,
  },
  clientOptionTextSelected: {
    color: attorneyColors.accent,
    fontWeight: fontWeight.medium,
  },
  clientEmail: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
  },
  noClients: {
    fontSize: fontSize.sm,
    color: attorneyColors.textSecondary,
    textAlign: 'center',
    padding: spacing.md,
  },
  input: {
    backgroundColor: attorneyColors.bgPrimary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: attorneyColors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: attorneyColors.textPrimary,
  },
  inputError: {
    borderColor: attorneyColors.error,
  },
  textArea: {
    minHeight: 100,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: attorneyColors.error,
    marginTop: spacing.xs,
  },
  itemRow: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: attorneyColors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: attorneyColors.textSecondary,
  },
  itemDetails: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  qtyField: {
    flex: 1,
  },
  priceField: {
    flex: 2,
  },
  totalField: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  fieldLabel: {
    fontSize: fontSize.xs,
    color: attorneyColors.textSecondary,
    marginBottom: spacing.xs,
  },
  smallInput: {
    backgroundColor: attorneyColors.bgPrimary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: attorneyColors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: fontSize.sm,
    color: attorneyColors.textPrimary,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.accent,
    paddingVertical: spacing.xs,
  },
  summaryCard: {
    backgroundColor: attorneyColors.bgSecondary,
    borderColor: attorneyColors.border,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: fontSize.md,
    color: attorneyColors.textSecondary,
  },
  summaryValue: {
    fontSize: fontSize.md,
    color: attorneyColors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: attorneyColors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: attorneyColors.textPrimary,
  },
  totalValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: attorneyColors.accent,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },
});
