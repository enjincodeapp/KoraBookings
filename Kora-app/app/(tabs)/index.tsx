import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, SafeAreaView, Platform, StatusBar, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useRouter } from 'expo-router';
import logo from '../../assets/images/logo.png';
import { spaceApi } from '../../services/api';
import NotificationBell from '../../components/NotificationBell';

export default function ExploreScreen() {
  const router = useRouter();
  const [showChat, setShowChat] = useState(false);
  const [asokoroSpaces, setAsokoroSpaces] = useState([]);
  const [wuseSpaces, setWuseSpaces] = useState([]);
  const [aiRecommended, setAiRecommended] = useState([]);
  const [bestValue, setBestValue] = useState([]);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSearchResults, setAiSearchResults] = useState([]);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchError, setAiSearchError] = useState('');

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [asokoroRes, wuseRes, aiRes, bestRes] = await Promise.all([
        spaceApi.getTrendingAsokoro(),
        spaceApi.getTrendingWuse(),
        spaceApi.getAiRecommended(),
        spaceApi.getBestValue()
      ]);

      setAsokoroSpaces(asokoroRes.data);
      setWuseSpaces(wuseRes.data);
      setAiRecommended(aiRes.data);
      setBestValue(bestRes.data);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    }
  };

    fetchData();
  }, []);

  const firstAi = aiRecommended[0];
  const nextAi = aiRecommended.slice(1, 3);
  const [imageErrors, setImageErrors] = useState({});
  
  const getImageUri = (space) => {
    let images = space?.images;
    
    // Handle string representation of array (e.g., "[https://...]")
    if (typeof images === 'string') {
      try {
        // Remove brackets if present and parse
        const cleaned = images.replace(/^\[|\]$/g, '').trim();
        if (cleaned.startsWith('http')) {
          return cleaned;
        }
        images = JSON.parse(images);
      } catch (e) {
        console.log('Failed to parse images string:', e);
      }
    }
    
    if (Array.isArray(images) && images.length > 0 && images[0]) {
      return images[0];
    }
    return 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/543182214.jpg?k=96c34a4b74c291bfeb5fd9a4c18b87fa9893a3b36b4221c499487ae8ee30b5d0&o=';
  };

  const handleImageError = (id) => {
    console.log(`Image failed to load for space ${id}`);
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const handleAiSearch = async () => {
    if (!aiSearchQuery.trim()) return;

    setIsAiSearching(true);
    setAiSearchError('');

    try {
      const response = await spaceApi.aiSearch(aiSearchQuery.trim());
      setAiSearchResults(response.data);
    } catch (error) {
      console.error('AI search error:', error);
      setAiSearchError('Could not fetch AI results. Try again.');
      setAiSearchResults([]);
    } finally {
      setIsAiSearching(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* TopAppBar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={logo}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <NotificationBell />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* AI Concierge Search Input */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="sparkles" size={20} color={Colors.light.primary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ask Kora Ai to find you a space..."
              placeholderTextColor={Colors.light.onSurfaceVariant}
              value={aiSearchQuery}
              onChangeText={setAiSearchQuery}
              onSubmitEditing={handleAiSearch}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleAiSearch}>
              <Text style={styles.searchButtonText}>{isAiSearching ? 'Searching...' : 'Search'}</Text>
            </TouchableOpacity>
          </View>
          {aiSearchError ? <Text style={styles.errorText}>{aiSearchError}</Text> : null}
          {aiSearchResults.length > 0 ? (
            <View style={styles.aiSearchResults}>
              <Text style={styles.aiSearchTitle}>AI Search Results</Text>
              {aiSearchResults.map((space) => (
                <TouchableOpacity key={space.id} style={styles.aiResultCard} onPress={() => router.push(`/space/${space.id}`)}>
                  <Image source={{ uri: getImageUri(space) }} style={styles.aiResultImage} />
                  <View style={styles.aiResultInfo}>
                    <Text style={styles.aiResultName} numberOfLines={1}>{space.name}</Text>
                    <Text style={styles.aiResultMeta}>{space.area}, {space.type?.replace('_', ' ')}</Text>
                    <Text style={styles.aiResultPrice}>₦{Number(space.price_per_night ?? space.price_per_hour ?? 0).toLocaleString()} /night</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
          <Text style={styles.searchHint}>Try "Modern penthouse in Maitama with high-speed internet"</Text>
        </View>

        {/* AI Picks For You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>AI picks for you</Text>
              <Ionicons name="star" size={16} color={Colors.light.secondary} style={{ marginLeft: 8 }} />
            </View>
            <TouchableOpacity><Text style={styles.viewAllText}>VIEW ALL</Text></TouchableOpacity>
          </View>


          {/* Large Feature Card */}
          {firstAi ? (
            <TouchableOpacity style={styles.largeCard} onPress={() => router.push(`/space/${firstAi.id}`)}>
              <Image
                source={{ uri: getImageUri(firstAi) }}
                style={styles.largeCardImage}
                onError={() => handleImageError(firstAi.id)}
                defaultSource={require('../../assets/images/logo.png')}
              />
              <View style={styles.largeCardOverlay}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>AI RECOMMENDED</Text>
                </View>
                <Text style={styles.largeCardTitle}>{firstAi.name}</Text>
                <View style={styles.largeCardFooter}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="location-outline" size={14} color="#fff" />
                    <Text style={styles.largeCardLocation}>{firstAi.area}, Abuja</Text>
                  </View>
                  <Text style={styles.largeCardPrice}>
                    ₦{Number(firstAi.price_per_night ?? firstAi.price_per_hour ?? 0).toLocaleString()}
                    <Text style={{ fontSize: 12, fontWeight: 'normal' }}>/night</Text>
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.largeCard, styles.largeCardEmpty]}>
              <Text style={styles.emptyText}>Loading AI recommendation…</Text>
            </View>
          )}

          <View style={styles.smallCardsContainer}>
            {nextAi.map((space) => (
              <TouchableOpacity key={space.id} style={styles.smallCard} onPress={() => router.push(`/space/${space.id}`)}>
                <Image
                  source={{ uri: getImageUri(space) }}
                  style={styles.smallCardImage}
                  onError={() => handleImageError(space.id)}
                />
                <View style={styles.smallCardOverlay}>
                  <Text style={styles.smallCardTitle}>{space.name}</Text>
                  <Text style={styles.smallCardLocation}>{space.area?.toUpperCase()} • {space.type?.replace('_', ' ')}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending in Asokoro */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending in Asokoro</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.navButton}><Ionicons name="chevron-back" size={20} color={Colors.light.primary} /></TouchableOpacity>
              <TouchableOpacity style={styles.navButton}><Ionicons name="chevron-forward" size={20} color={Colors.light.primary} /></TouchableOpacity>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {asokoroSpaces.map((space) => (
              <TouchableOpacity key={space.id} style={styles.trendingCard} onPress={() => router.push(`/space/${space.id}`)}>
                <Image source={{ uri: getImageUri(space) }} style={styles.trendingImage} onError={() => handleImageError(space.id)} />
                <View style={styles.trendingInfo}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.trendingTitle}>{space.name}</Text>
                    <Text style={styles.trendingRating}><Ionicons name="star" size={12} /> {space.rating ? Number(space.rating).toFixed(1) : 'N/A'}</Text>
                  </View>
                  <Text style={styles.trendingLocation}>{space.area?.toUpperCase()} • {space.type?.replace('_', ' ')}</Text>
                  <Text style={styles.trendingPrice}>
                    ₦{Number(space.price_per_night ?? space.price_per_hour ?? 0).toLocaleString()}
                    <Text style={styles.trendingPriceNight}>/night</Text>
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trending in Wuse */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending in Wuse</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.navButton}><Ionicons name="chevron-back" size={20} color={Colors.light.primary} /></TouchableOpacity>
              <TouchableOpacity style={styles.navButton}><Ionicons name="chevron-forward" size={20} color={Colors.light.primary} /></TouchableOpacity>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {wuseSpaces.map((space) => (
              <TouchableOpacity key={space.id} style={styles.trendingCard} onPress={() => router.push(`/space/${space.id}`)}>
                <Image source={{ uri: getImageUri(space) }} style={styles.trendingImage} onError={() => handleImageError(space.id)} />
                <View style={styles.trendingInfo}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.trendingTitle}>{space.name}</Text>
                    <Text style={styles.trendingRating}><Ionicons name="star" size={12} /> {space.rating ? Number(space.rating).toFixed(1) : 'N/A'}</Text>
                  </View>
                  <Text style={styles.trendingLocation}>{space.area?.toUpperCase()} • {space.type?.replace('_', ' ')}</Text>
                  <Text style={styles.trendingPrice}>
                    ₦{Number(space.price_per_night ?? space.price_per_hour ?? 0).toLocaleString()}
                    <Text style={styles.trendingPriceNight}>/night</Text>
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Best Value */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Best value for your budget</Text>
          <TouchableOpacity style={styles.valueCard}>
            <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApOkaFCnH8ie-rhkSo48lQ3d19vc93KoPv6I2GGs8PVuWIlbPkQpnPKoX7_0kg0FMWCA6M5ZKYw7wn2vShpW3PWYxjBUxs9JSQZWmUWH68jK7sXv2C1vZPsTtoi8dF5Qx3V29sWFgRlA0XKYPWJP94D21Bc6HqFDVXkK11vVpx2jTSORKOiiWzgZYrY9s-06CKFToWamzJqVIS1Trm37UTZU8oOWZFl5Sd14T_0WNBwsnFrk2t8qRcWhYOLRh2kYG-HVVFC-_Xb8JJ' }} style={styles.valueImage} />
            <View style={styles.valueInfo}>
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.valueTitle}>The Urban Pod</Text>
                  <View style={styles.valueBadge}><Text style={styles.valueBadgeText}>BEST DEAL</Text></View>
                </View>
                <Text style={styles.valueDesc} numberOfLines={1}>Efficient workspace, high-speed Wi-Fi.</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <Text style={styles.valuePrice}>₦35,000<Text style={styles.trendingPriceNight}>/night</Text></Text>
                <Text style={styles.valueVerified}><Ionicons name="checkmark-circle" size={14} /> Verified</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Chat Support FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowChat(true)}>
        <Ionicons name="chatbubble-ellipses" size={28} color={Colors.light.onPrimary} />
      </TouchableOpacity>


      {/* Chat Modal */}
      <Modal visible={showChat} animationType="slide" transparent={true} onRequestClose={() => setShowChat(false)}>
        <View style={styles.chatOverlay}>
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatHeaderTitle}>Support Chat</Text>
              <TouchableOpacity onPress={() => setShowChat(false)}>
                <Ionicons name="close" size={24} color={Colors.light.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
            <View style={styles.chatMessages}>
              {/* Placeholder for messages */}
            </View>
            <View style={styles.chatInputContainer}>
              <TextInput placeholder="Type a message..." style={styles.chatInput} placeholderTextColor={Colors.light.onSurfaceVariant} />
              <TouchableOpacity>
                <Ionicons name="send" size={24} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(252, 249, 248, 0.9)',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 120,
    height: 45,
  },
  // profileImage: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   borderWidth: 1,
  //   borderColor: 'rgba(135,77,50,0.2)',
  // },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },
  searchSection: {
    marginBottom: 32,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 211, 179, 0.4)',
    borderRadius: 16,
    height: 64,
    paddingLeft: 48,
    paddingRight: 12,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.onSurface,
  },
  searchButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  searchHint: {
    fontSize: 12,
    color: 'rgba(135, 77, 50, 0.7)',
    marginTop: 8,
    paddingHorizontal: 8,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.onSurface,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
    letterSpacing: 1,
  },
  largeCard: {
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
  },
  largeCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  largeCardOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  badge: {
    backgroundColor: Colors.light.secondaryContainer,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.onSecondaryContainer,
  },
  largeCardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  largeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  largeCardLocation: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  largeCardPrice: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  largeCardEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e7e2d7',
  },
  emptyText: {
    color: Colors.light.onSurfaceVariant,
    fontSize: 16,
    fontWeight: '600',
  },
  smallCardsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  smallCard: {
    flex: 1,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
  },
  smallCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  smallCardOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  smallCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  smallCardLocation: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(133, 115, 108, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingCard: {
    width: 240,
  },
  trendingImage: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    marginBottom: 12,
  },
  trendingInfo: {
    paddingHorizontal: 8,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.onSurface,
  },
  trendingRating: {
    fontSize: 12,
    color: Colors.light.secondary,
    fontWeight: '600',
  },
  trendingLocation: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.onSurfaceVariant,
    marginTop: 4,
    marginBottom: 8,
  },
  trendingPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  trendingPriceNight: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.light.onSurfaceVariant,
  },
  valueCard: {
    flexDirection: 'row',
    backgroundColor: '#f6f3f2',
    borderRadius: 20,
    padding: 12,
    gap: 16,
    marginBottom: 16,
  },
  valueImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  valueInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.onSurface,
  },
  valueBadge: {
    backgroundColor: 'rgba(73, 100, 85, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  valueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.secondary,
  },
  valueDesc: {
    fontSize: 14,
    color: Colors.light.onSurfaceVariant,
    marginTop: 4,
  },
  valuePrice: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  valueVerified: {
    fontSize: 12,
    color: Colors.light.onSurfaceVariant,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  chatOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    height: '70%',
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.onSurface,
  },
  chatMessages: {
    flex: 1,
    // Placeholder styling
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(135,77,50,0.2)',
    paddingVertical: 50,
  },
  chatInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.onSurface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.surfaceVariant,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 12,
  },
  aiSearchResults: {
    marginTop: 16,
    gap: 12,
  },
  aiSearchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.onSurface,
    marginBottom: 12,
  },
  aiResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.outline,
  },
  aiResultImage: {
    width: 96,
    height: 96,
  },
  aiResultInfo: {
    flex: 1,
    padding: 12,
  },
  aiResultName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.onSurface,
    marginBottom: 4,
  },
  aiResultMeta: {
    fontSize: 12,
    color: Colors.light.onSurfaceVariant,
    marginBottom: 6,
  },
  aiResultPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
  },
});