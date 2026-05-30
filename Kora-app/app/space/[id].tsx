import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image, SafeAreaView, Platform, StatusBar, Linking, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { spaceApi } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

export default function SpaceDetailScreen() {
  const { id } = useLocalSearchParams();
  const [space, setSpace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favourited, setFavourited] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSpace();
  }, [id]);

  const fetchSpace = async () => {
    try {
      const resp = await spaceApi.getSpace(id as string);
      let data = resp.data;

      // Handle the case where the backend returns double-encoded JSON strings
      if (typeof data.amenities === 'string') {
        try { data.amenities = JSON.parse(data.amenities); } catch (e) { }
      }
      if (typeof data.images === 'string') {
        try { data.images = JSON.parse(data.images); } catch (e) { }
      }

      setSpace(data);
    } catch (err) {
      console.error(err);
      // For demo purposes, we will load a dummy space if the API fails so the UI is visible
      setSpace({
        id: id,
        name: 'The Zuma Serenity Suite',
        address: 'Maitama, Abuja',
        price_per_hour: 145000,
        rating: 4.9,
        review_count: 128,
        capacity: 2,
        description: 'Experience unparalleled luxury in the heart of Maitama. The Zuma Serenity Suite offers a perfect blend of minimalist design and high-end comfort. Featuring floor-to-ceiling windows with panoramic city views, bespoke Italian furnishings, and state-of-the-art smart home integration.',
        latitude: 9.0654,
        longitude: 7.4891,
        ownerName: 'Kora Homes',
        ownerRole: 'Host',
        ownerContact: '+234 803 000 0000',
        images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCadTyGDNHcMqYi6SvjAuAfp2Iugg8VnMV3iGHqWPGzDntkDZtlULM-VoTKCCcd4epMdjCQ5oChPpbZe0qi56_A6Q1Htw5cnHLfRogArJjK-B2MuSHsiFoc5k58XPUvfdLuq_AwAr8hTJ5U5xDUSW0vizpvNExQtCgXADp_f0nufsm6rytgH1JMdBka-Qwf9GH_C2TPWOnsyyRuCnwqzEsmYYcU4OANtCaxbYodBGQLzmJwAgZYSYVrvCbLtggQDQPIAXxKX1TYpWVS']
      });
    } finally {
      setLoading(false);
    }
  };
  const getImageUri = (images: any) => {
    if (typeof images === 'string') {
      try {
        const cleaned = images.replace(/^\[|\]$/g, '').trim();
        if (cleaned.startsWith('http')) return cleaned;
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch (e) { }
      return images; // Fallback to raw string if it's just a URL
    }
    if (Array.isArray(images) && images.length > 0) return images[0];
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCadTyGDNHcMqYi6SvjAuAfp2Iugg8VnMV3iGHqWPGzDntkDZtlULM-VoTKCCcd4epMdjCQ5oChPpbZe0qi56_A6Q1Htw5cnHLfRogArJjK-B2MuSHsiFoc5k58XPUvfdLuq_AwAr8hTJ5U5xDUSW0vizpvNExQtCgXADp_f0nufsm6rytgH1JMdBka-Qwf9GH_C2TPWOnsyyRuCnwqzEsmYYcU4OANtCaxbYodBGQLzmJwAgZYSYVrvCbLtggQDQPIAXxKX1TYpWVS';
  };

  const handleShare = async () => {
    if (!space) return;
    try {
      await Share.share({
        message: `Check out ${space.name} in ${space.address} on Kora Smart!`,
        url: Platform.OS === 'ios' ? `https://kora.smart/space/${space.id}` : undefined,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFavourite = () => {
    setFavourited(!favourited);
    Alert.alert(
      !favourited ? 'Added to Favourites' : 'Removed from Favourites',
      `${space.name} has been ${!favourited ? 'added to' : 'removed from'} your favourites.`
    );
  };

  const aiInsight = React.useMemo(() => {
    if (!space) return "";

    const reviews = Array.isArray(space.reviews) ? space.reviews : [];
    const name = space.name || "this property";

    if (reviews.length > 0) {
      const positiveWords = ["excellent", "wonderful", "amazing", "spotless", "perfect", "highly recommended"];
      const word = positiveWords[Math.floor(Math.random() * positiveWords.length)];
      const firstComment = reviews[0].comment || "the stay";
      return `"${name} is ${word}! Guests frequently mention ${firstComment.toLowerCase().replace(/[.!]$/, '')}. With a ${space.rating} rating, it's a top choice for ${space.area}."`;
    }

    const insights = [
      `"${name} is a hidden gem in ${space.area}. Based on its ${space.rating} rating, guests love the premium feel and ${space.beds} bedroom layout."`,
      `"Perfect match for your preference of ${space.type?.replace('_', ' ')} stays. 98% of travelers rated the location as excellent here."`,
      `"Kora AI identifies this as a high-value stay. The ${space.amenities?.length || 5}+ amenities make it perfect for long-term comfort."`
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  }, [space]);

  const openMap = async () => {
    if (!space) return;

    const latitude = space.latitude ?? 9.0654;
    const longitude = space.longitude ?? 7.4891;
    const label = encodeURIComponent(space.name || 'Property');
    const url = Platform.OS === 'ios'
      ? `http://maps.apple.com/?ll=${latitude},${longitude}&q=${label}`
      : `geo:${latitude},${longitude}?q=${label}`;

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Unable to open map.');
    }
  };

  const callHost = () => {
    const phone = space.contact_info || space.ownerContact || '+2348030000000';
    Linking.openURL(`tel:${phone}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!space) return null;

  const coverImage = getImageUri(space.images);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Image Section */}
        <View style={styles.heroSection}>
          <Image source={{ uri: coverImage }} style={styles.heroImage} />

          <SafeAreaView style={styles.heroOverlay}>
            <View style={styles.heroNav}>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.heroNavRight}>
                <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                  <Ionicons name="share-social-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={toggleFavourite}>
                  <Ionicons name={favourited ? "heart" : "heart-outline"} size={24} color={favourited ? "#ff4b4b" : "#fff"} />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Content Section (Overlapping) */}
        <View style={styles.contentSection}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{space.name}</Text>
              <Text style={styles.location}>{space.address}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color={Colors.light.onTertiaryFixed} />
              <Text style={styles.ratingText}>{space.rating}</Text>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>SUPERHOST</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>DESIGNER STAY</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>VERIFIED</Text>
            </View>
          </View>

          {/* AI Concierge Feature */}
          <View style={styles.aiCard}>
            <View style={styles.aiHeaderRow}>
              <Ionicons name="sparkles" size={20} color={Colors.light.onSecondary} />
              <Text style={styles.aiTitle}>Kora AI Insights</Text>
            </View>
            <Text style={styles.aiText}>{aiInsight}</Text>
          </View>

          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The Space</Text>
            <View style={styles.featuresRow}>
              <View style={styles.featureItem}>
                <Ionicons name="people-outline" size={24} color={Colors.light.outline} />
                <Text style={styles.featureText}>{space.capacity} Guests</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="bed-outline" size={24} color={Colors.light.outline} />
                <Text style={styles.featureText}>{space.beds ?? 1} Bedroom</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="water-outline" size={24} color={Colors.light.outline} />
                <Text style={styles.featureText}>{space.bathrooms ?? 1} Baths</Text>
              </View>
            </View>
            <Text style={styles.description}>{space.description}</Text>
          </View>

          {/* Amenities Bento Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Premium Amenities</Text>
            <View style={styles.amenitiesGrid}>
              <View style={[styles.amenityCard, { width: '47%' }]}>
                <Ionicons name="wifi" size={24} color={Colors.light.primary} style={{ marginBottom: 12 }} />
                <Text style={styles.amenityTitle}>Gigabit Wi-Fi</Text>
                <Text style={styles.amenitySub}>500 Mbps+</Text>
              </View>
              <View style={[styles.amenityCard, { width: '47%' }]}>
                <Ionicons name="laptop-outline" size={24} color={Colors.light.primary} style={{ marginBottom: 12 }} />
                <Text style={styles.amenityTitle}>Workspace</Text>
                <Text style={styles.amenitySub}>Ergonomic setup</Text>
              </View>
              <View style={[styles.amenityCard, { width: '100%' }]}>
                <Ionicons name="hardware-chip-outline" size={24} color={Colors.light.primary} style={{ marginBottom: 12 }} />
                <Text style={styles.amenityTitle}>Smart Home</Text>
                <Text style={styles.amenitySub}>Voice-controlled lighting & climate</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity style={styles.mapCard} onPress={openMap} activeOpacity={0.9}>
              <View style={styles.mapPlaceholder}>
                <Text style={styles.mapPlaceholderText}>Map preview</Text>
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.location}>{space.address}</Text>
                <Text style={styles.mapSubtext}>Tap to open directions in your maps app</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner</Text>
            <View style={styles.ownerCard}>

              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>{space.owner ?? space.owner ?? 'Kora Homes'}</Text>
                <Text style={styles.ownerRole}>{space.owner_role ?? space.ownerRole ?? 'Host'}</Text>
                <Text style={styles.ownerContact}>{space.contact_info ?? space.contact_info ?? '+234 803 000 0000'}</Text>
              </View>
              <TouchableOpacity style={styles.callButton} onPress={callHost}>
                <Ionicons name="call" size={20} color={Colors.light.onPrimary} />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.price}>₦{Number(space.price_per_night ?? space.price_per_hour ?? 0).toLocaleString()}</Text>
          <Text style={styles.priceUnit}>/ night</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => router.push(`/booking/${space.id}`)}
        >
          <Text style={styles.bookButtonText}>Reserve Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 120 },
  heroSection: {
    height: 380,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  heroNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heroNavRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  contentSection: {
    marginTop: -32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.onSurface,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.onSurfaceVariant,
    letterSpacing: 1.2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tertiaryFixed,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.onTertiaryFixed,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(216, 194, 186, 0.4)',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 1,
  },
  aiCard: {
    backgroundColor: Colors.light.secondary,
    padding: 20,
    borderRadius: 24,
    marginBottom: 32,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.onSecondary,
    letterSpacing: 1,
  },
  aiText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.onSurface,
    marginBottom: 16,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(216, 194, 186, 0.2)',
    marginBottom: 16,
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.onSurfaceVariant,
  },
  description: {
    fontSize: 16,
    color: Colors.light.onSurfaceVariant,
    lineHeight: 26,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  amenityCard: {
    backgroundColor: '#f6f3f2',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(216, 194, 186, 0.3)',
  },
  amenityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.onSurface,
    marginBottom: 4,
  },
  amenitySub: {
    fontSize: 12,
    color: Colors.light.onSurfaceVariant,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(216, 194, 186, 0.3)',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  priceUnit: {
    fontSize: 14,
    color: Colors.light.onSurfaceVariant,
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  bookButtonText: {
    color: Colors.light.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  mapCard: {
    backgroundColor: 'rgba(249, 246, 244, 0.95)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(216, 194, 186, 0.45)',
    overflow: 'hidden',
  },
  mapPlaceholder: {
    height: 160,
    borderRadius: 18,
    backgroundColor: 'rgba(228, 226, 225, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapPlaceholderText: {
    color: Colors.light.onSurfaceVariant,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  locationInfo: {
    gap: 6,
  },
  mapSubtext: {
    fontSize: 13,
    color: Colors.light.onSurfaceVariant,
    marginTop: 4,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#f8f5f3',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(216, 194, 186, 0.35)',
  },
  ownerAvatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#eee',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.onSurface,
    marginBottom: 4,
  },
  ownerRole: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
    marginBottom: 6,
  },
  ownerContact: {
    fontSize: 14,
    color: Colors.light.onSurfaceVariant,
  },
  callButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  callButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
});
