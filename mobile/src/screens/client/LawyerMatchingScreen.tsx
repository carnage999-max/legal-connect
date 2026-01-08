import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Card, Button } from '../../components';
import api from '../../services/api';
import { AttorneyProfile } from '../../types';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type LawyerMatchingScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ params: { matterId: string } }, 'params'>;
};

export function LawyerMatchingScreen({ navigation, route }: LawyerMatchingScreenProps) {
  const { matterId } = route.params;
  const [attorneys, setAttorneys] = useState<AttorneyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<{
    practiceArea?: string;
    minRating?: number;
    maxFee?: number;
  }>({});

  const fetchAttorneys = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getMatchingAttorneys(matterId);
      setAttorneys(data.results || data || []);
    } catch (error) {
      console.error('Failed to fetch attorneys:', error);
      Alert.alert('Error', 'Failed to load matching attorneys');
    } finally {
      setIsLoading(false);
    }
  }, [matterId]);

  useEffect(() => {
    fetchAttorneys();
  }, [fetchAttorneys]);

  const handleViewProfile = (attorney: AttorneyProfile) => {
    navigation.navigate('AttorneyProfile', { attorneyId: attorney.id, matterId });
  };

  const handleBookAppointment = (attorney: AttorneyProfile) => {
    navigation.navigate('BookAppointment', { attorneyId: attorney.id, matterId });
  };

  const handleSelectAttorney = async (attorney: AttorneyProfile) => {
    Alert.alert(
      'Confirm Selection',
      `Are you sure you want to select ${attorney.user.full_name} as your attorney for this matter? They will need to accept before the engagement begins.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Select Attorney',
          onPress: async () => {
            try {
              await api.selectAttorney(matterId, attorney.user.id);
              Alert.alert(
                'Attorney Selected',
                'The attorney has been notified and will review your matter. You will be notified once they accept.',
                [{ text: 'OK', onPress: () => navigation.navigate('MatterDetail', { matterId }) }]
              );
            } catch (error: any) {
              const message = error.response?.data?.detail || 'Failed to select attorney';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={[styles.star, i <= rating && styles.starFilled]}>
          ★
        </Text>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderAttorneyCard = ({ item }: { item: AttorneyProfile }) => (
    <Card variant="outlined" style={styles.attorneyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {item.user.avatar ? (
            <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.user.first_name[0]}
                {item.user.last_name[0]}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.attorneyName}>{item.user.full_name}</Text>
          <Text style={styles.firmName}>{item.firm_name || 'Independent Practice'}</Text>
          <View style={styles.ratingContainer}>
            {renderStars(Math.round(item.average_rating))}
            <Text style={styles.ratingText}>
              {item.average_rating?.toFixed(1) || 'N/A'} ({item.total_reviews} reviews)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.practiceAreas}>
        {item.practice_areas?.slice(0, 3).map((area) => (
          <View key={area.id} style={styles.practiceAreaBadge}>
            <Text style={styles.practiceAreaText}>{area.name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.bio} numberOfLines={3}>
        {item.bio || 'No bio available'}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.years_of_experience}</Text>
          <Text style={styles.statLabel}>Years Exp.</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>${item.consultation_fee}</Text>
          <Text style={styles.statLabel}>Consultation</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>${item.hourly_rate}/hr</Text>
          <Text style={styles.statLabel}>Hourly Rate</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Button
          title="View Profile"
          onPress={() => handleViewProfile(item)}
          variant="outline"
          size="sm"
          style={styles.actionButton}
        />
        <Button
          title="Select Attorney"
          onPress={() => handleSelectAttorney(item)}
          size="sm"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No attorneys available</Text>
      <Text style={styles.emptyText}>
        We couldn't find any attorneys matching your criteria at this time.
        This could be due to conflict checks or availability.
      </Text>
      <Button
        title="Broaden Search"
        onPress={() => navigation.goBack()}
        variant="outline"
        style={styles.emptyButton}
      />
      <Button
        title="Contact Support"
        onPress={() => Alert.alert('Support', 'Please email support@legalconnect.com')}
        variant="ghost"
      />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.clientAccent} />
          <Text style={styles.loadingText}>Finding available attorneys...</Text>
          <Text style={styles.loadingSubtext}>
            Running conflict checks and matching your criteria
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Available Attorneys</Text>
        <Text style={styles.subtitle}>
          {attorneys.length} attorneys matched and conflict-free
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollableFilters
          onFilterChange={setSelectedFilters}
          selectedFilters={selectedFilters}
        />
      </View>

      {/* Attorney List */}
      <FlatList
        data={attorneys}
        renderItem={renderAttorneyCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// Simple filter component
function ScrollableFilters({
  onFilterChange,
  selectedFilters,
}: {
  onFilterChange: (filters: any) => void;
  selectedFilters: any;
}) {
  const filters = ['All', 'Top Rated', 'Lowest Fee', 'Most Experienced'];

  return (
    <View style={styles.filterScroll}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterChip,
            selectedFilters.active === filter && styles.filterChipActive,
          ]}
          onPress={() => onFilterChange({ active: filter })}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedFilters.active === filter && styles.filterChipTextActive,
            ]}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  loadingSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  header: {
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
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScroll: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundTertiary,
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
  listContent: {
    padding: spacing.md,
  },
  attorneyCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.clientAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  headerInfo: {
    flex: 1,
  },
  attorneyName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  firmName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: spacing.xs,
  },
  star: {
    fontSize: fontSize.sm,
    color: colors.border,
  },
  starFilled: {
    color: colors.warning,
  },
  ratingText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  practiceAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  practiceAreaBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.clientAccentMuted,
  },
  practiceAreaText: {
    fontSize: fontSize.xs,
    color: colors.clientAccent,
    fontWeight: fontWeight.medium,
  },
  bio: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  emptyButton: {
    marginBottom: spacing.sm,
  },
});
