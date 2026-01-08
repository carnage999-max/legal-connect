import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components';
import api from '../../services/api';
import { Document } from '../../types';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type DocumentsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ params?: { matterId?: string } }, 'params'>;
};

type IconName = keyof typeof Ionicons.glyphMap;

const FILE_ICONS: Record<string, IconName> = {
  pdf: 'document-text',
  doc: 'document',
  docx: 'document',
  xls: 'grid',
  xlsx: 'grid',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  default: 'attach',
};

const DOCUMENT_TYPES = [
  { value: 'contract', label: 'Contract' },
  { value: 'agreement', label: 'Agreement' },
  { value: 'evidence', label: 'Evidence' },
  { value: 'correspondence', label: 'Correspondence' },
  { value: 'court_filing', label: 'Court Filing' },
  { value: 'id', label: 'ID Document' },
  { value: 'financial', label: 'Financial' },
  { value: 'other', label: 'Other' },
];

export function DocumentsScreen({ navigation, route }: DocumentsScreenProps) {
  const matterId = route.params?.matterId;
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentType, setDocumentType] = useState('other');
  const [documentDescription, setDocumentDescription] = useState('');

  const categories = ['all', 'contracts', 'correspondence', 'evidence', 'other'];

  const fetchDocuments = useCallback(async () => {
    try {
      const params: Record<string, any> = {};
      if (matterId) params.matter_id = matterId;
      if (selectedCategory !== 'all') params.document_type = selectedCategory;

      const data = await api.getDocuments(params);
      setDocuments(data.results || data || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [matterId, selectedCategory]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/*',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setSelectedFile(file);
        // Auto-fill title from filename
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setDocumentTitle(nameWithoutExt);
        setShowUploadModal(true);
      }
    } catch (error) {
      console.error('Failed to select document:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    if (!documentTitle.trim()) {
      Alert.alert('Error', 'Please enter a document title');
      return;
    }

    if (!matterId) {
      Alert.alert('Error', 'Documents must be associated with a matter. Please upload from a specific matter.');
      setShowUploadModal(false);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'application/octet-stream',
      } as any);
      formData.append('matter', matterId);
      formData.append('title', documentTitle.trim());
      formData.append('document_type', documentType);
      if (documentDescription.trim()) {
        formData.append('description', documentDescription.trim());
      }

      await api.uploadDocument(formData);
      Alert.alert('Success', 'Document uploaded successfully');
      setShowUploadModal(false);
      resetUploadForm();
      fetchDocuments();
    } catch (error: any) {
      console.error('Failed to upload document:', error);
      const message = error.response?.data?.detail ||
                     error.response?.data?.message ||
                     'Failed to upload document. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setDocumentTitle('');
    setDocumentType('other');
    setDocumentDescription('');
  };

  const handleViewDocument = async (document: Document) => {
    try {
      const data = await api.downloadDocument(document.id);
      if (data.download_url) {
        await Linking.openURL(data.download_url);
      }
    } catch (error) {
      console.error('Failed to open document:', error);
      Alert.alert('Error', 'Failed to open document');
    }
  };

  const handleDeleteDocument = (document: Document) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.title || document.original_filename}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteDocument(document.id);
              Alert.alert('Success', 'Document deleted');
              fetchDocuments();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const getFileIcon = (filename: string): IconName => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return FILE_ICONS[ext] || FILE_ICONS.default;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <Card variant="outlined" style={styles.documentCard}>
      <TouchableOpacity
        style={styles.documentContent}
        onPress={() => handleViewDocument(item)}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={getFileIcon(item.original_filename || item.title)}
            size={24}
            color={colors.clientAccent}
          />
        </View>

        <View style={styles.documentInfo}>
          <Text style={styles.documentName} numberOfLines={1}>
            {item.title || item.original_filename}
          </Text>
          <Text style={styles.documentMeta}>
            {formatFileSize(item.file_size)} • {new Date(item.created_at).toLocaleDateString()}
          </Text>
          {item.document_type && item.document_type !== 'other' && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.document_type.replace('_', ' ')}</Text>
            </View>
          )}
        </View>

        <View style={styles.documentStatus}>
          {item.requires_signature && !item.signature_completed && (
            <View style={styles.signatureBadge}>
              <Ionicons name="pencil-outline" size={12} color="#92400E" />
              <Text style={styles.signatureText}>Sign</Text>
            </View>
          )}
          {item.signature_completed && (
            <View style={[styles.signatureBadge, styles.signedBadge]}>
              <Ionicons name="checkmark" size={12} color="#065F46" />
              <Text style={styles.signedText}>Signed</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.documentActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewDocument(item)}
        >
          <Ionicons name="eye-outline" size={18} color={colors.clientAccent} />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteDocument(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#DC2626" />
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Documents</Text>
      <Text style={styles.emptyText}>
        {matterId
          ? 'Upload documents to securely store and share them with your legal team.'
          : 'Select a matter to view and upload documents.'}
      </Text>
      {matterId && (
        <Button
          title="Upload Document"
          onPress={handleSelectFile}
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Documents</Text>
        {matterId && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleSelectFile}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={18} color={colors.white} />
                <Text style={styles.uploadButtonText}>Upload</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategory === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === item && styles.filterChipTextActive,
                ]}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Document List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.clientAccent} />
        </View>
      ) : (
        <FlatList
          data={documents}
          renderItem={renderDocument}
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

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Document</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedFile && (
              <View style={styles.selectedFileContainer}>
                <Ionicons
                  name={getFileIcon(selectedFile.name)}
                  size={32}
                  color={colors.clientAccent}
                />
                <View style={styles.selectedFileInfo}>
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.selectedFileSize}>
                    {formatFileSize(selectedFile.size)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={documentTitle}
                onChangeText={setDocumentTitle}
                placeholder="Enter document title"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeGrid}>
                {DOCUMENT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeChip,
                      documentType === type.value && styles.typeChipActive,
                    ]}
                    onPress={() => setDocumentType(type.value)}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        documentType === type.value && styles.typeChipTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={documentDescription}
                onChangeText={setDocumentDescription}
                placeholder="Add a description..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
                onPress={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.clientAccent,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  uploadButtonText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
  filterContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterList: {
    paddingHorizontal: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundTertiary,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.clientAccent,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: fontWeight.medium,
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
  documentCard: {
    marginBottom: spacing.md,
  },
  documentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.clientAccentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  documentMeta: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundTertiary,
    marginTop: spacing.xs,
  },
  categoryText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  documentStatus: {
    alignItems: 'flex-end',
  },
  signatureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: '#FEF3C7',
    gap: 4,
  },
  signatureText: {
    fontSize: fontSize.xs,
    color: '#92400E',
    fontWeight: fontWeight.medium,
  },
  signedBadge: {
    backgroundColor: '#D1FAE5',
  },
  signedText: {
    color: '#065F46',
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  actionText: {
    fontSize: fontSize.sm,
    color: colors.clientAccent,
    fontWeight: fontWeight.medium,
  },
  deleteText: {
    color: '#DC2626',
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
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.clientAccentMuted,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  selectedFileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  selectedFileName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  selectedFileSize: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundTertiary,
  },
  typeChipActive: {
    backgroundColor: colors.clientAccent,
  },
  typeChipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  typeChipTextActive: {
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  submitButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.clientAccent,
    borderRadius: borderRadius.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: fontSize.md,
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
});
