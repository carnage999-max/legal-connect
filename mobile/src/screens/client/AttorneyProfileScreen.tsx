import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Card, Button } from '../../components';
import api from '../../services/api';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../utils/theme';

type AttorneyProfileScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ params: { attorneyId: string; matterId?: string } }, 'params'>;
};

interface AttorneyProfile {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
  };
  bar_number: string;
  years_of_experience: number;
  hourly_rate: number;
  bio: string;
  practice_areas: { id: string; name: string }[];
  jurisdictions: { id: string; name: string; state: string }[];
  average_rating: number;
  total_reviews: number;
  total_cases: number;
  success_rate: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  client_name: string;
}

export function AttorneyProfileScreen({ navigation, route }: AttorneyProfileScreenProps) {
  const { attorneyId, matterId } = route.params;
  const [attorney, setAttorney] = useState<AttorneyProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');

  const fetchData = useCallback(async () => {
    try {
      const [profileData, reviewsData] = await Promise.all([
        api.getAttorneyProfile(attorneyId),
        api.getAttorneyReviews(attorneyId).catch(() => ({ results: [] })),
      ]);
      setAttorney(profileData);
      setReviews(reviewsData.results || reviewsData || []);
    } catch (error) {
      console.error('Failed to fetch attorney profile:', error);
      Alert.alert('Error', 'Failed to load attorney profile');
    } finally {
      setIsLoading(false);
    }
  }, [attorneyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i <= rating ? '★' : '☆'}
        </Text>
      );
    }
    return stars;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.clientAccent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!attorney) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Attorney not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {attorney.user.avatar ? (
            <Image source={{ uri: attorney.user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {attorney.user.first_name?.[0]}
                {attorney.user.last_name?.[0]}
              </Text>
            </View>
          )}
          <Text style={styles.attorneyName}>
            {attorney.user.first_name} {attorney.user.last_name}
          </Text>
          <Text style={styles.barNumber}>Bar #{attorney.bar_number}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>{renderStars(attorney.average_rating)}</View>
            <Text style={styles.ratingText}>
              {attorney.average_rating?.toFixed(1) || '0.0'} ({attorney.total_reviews} reviews)
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{attorney.years_of_experience}</Text>
            <Text style={styles.statLabel}>Years Exp.</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{attorney.total_cases || 0}</Text>
            <Text style={styles.statLabel}>Cases</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${attorney.hourly_rate}</Text>
            <Text style={styles.statLabel}>Per Hour</Text>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.tabActive]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>
              About
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
              Reviews ({attorney.total_reviews})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'about' ? (
          <View style={styles.aboutContent}>
            {/* Bio */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{attorney.bio || 'No bio available'}</Text>
            </Card>

            {/* Practice Areas */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Practice Areas</Text>
              <View style={styles.tagsContainer}>
                {attorney.practice_areas?.map((area) => (
                  <View key={area.id} style={styles.tag}>
                    <Text style={styles.tagText}>{area.name}</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Jurisdictions */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Licensed Jurisdictions</Text>
              <View style={styles.tagsContainer}>
                {attorney.jurisdictions?.map((jurisdiction) => (
                  <View key={jurisdiction.id} style={styles.tag}>
                    <Text style={styles.tagText}>
                      {jurisdiction.name}, {jurisdiction.state}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        ) : (
          <View style={styles.reviewsContent}>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.client_name || 'Anonymous'}</Text>
                    <View style={styles.reviewStars}>{renderStars(review.rating)}</View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                </Card>
              ))
            ) : (
              <View style={styles.emptyReviews}>
                <Text style={styles.emptyText}>No reviews yet</Text>
              </View>
            )}
          </View>
        )}

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Button
            title="Book Consultation"
            onPress={() =>
              navigation.navigate('BookAppointment', {
                attorneyId: attorney.id,
                matterId,
              })
            }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.white,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.clientAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  attorneyName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  barNumber: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  star: {
    fontSize: 18,
    color: '#F59E0B',
  },
  ratingText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.clientAccent,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.clientAccent,
  },
  tabText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  tabTextActive: {
    color: colors.clientAccent,
  },
  aboutContent: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  bioText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.clientAccentMuted,
  },
  tagText: {
    fontSize: fontSize.sm,
    color: colors.clientAccent,
  },
  reviewsContent: {
    padding: spacing.md,
  },
  reviewCard: {
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewerName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  reviewDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  emptyReviews: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  actionContainer: {
    padding: spacing.md,
  },
});
