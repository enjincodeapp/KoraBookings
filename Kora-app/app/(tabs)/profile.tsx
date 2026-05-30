import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error(e);
    } finally {
      await logout();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1f81hO0hyuNdZYMIXnHyoeFKscs-I5oJ9PhqeEeAzcIru_bxIuLO0iizyFXhLVP17vYHFbMcCH1GMd0ymeZQu9uLHIgQ98UxFSejxmj3ykcAIQFR6HYfZXdqQBYlZXg4rYZs0McGd_D71Ey33oN_dsyi6DF-gVNcjqgse-vELcvGGJRBS-LUY9VHqNRVYVoIvbnKQexC1BTHqidnaY_SOzsknpBCD1AOL2OVYRmDIc7lOrbjQJt5eQbXbNBLiBUWTeMcJNngjR_Va' }}
            style={styles.profileImage}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.profileName}>{user?.name || 'Aida'}</Text>
            <Text style={styles.profileStatus}>KORA ELITE MEMBER</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={24} color={Colors.light.onSurface} />
          </TouchableOpacity>
        </View>

        {/* Membership Tier */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membership Tier</Text>
          <View style={styles.tierCard}>
            <View style={styles.tierHeader}>
              <View>
                <Text style={styles.tierLabel}>CURRENT STATUS</Text>
                <Text style={styles.tierValue}>Gold</Text>
              </View>
              <Ionicons name="medal" size={32} color="#D4AF37" />
            </View>
            
            <View style={styles.tierStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Nights Stayed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>8,450</Text>
                <Text style={styles.statLabel}>Kora Points</Text>
              </View>
            </View>
            
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '65%' }]} />
            </View>
            <Text style={styles.progressText}>3 nights away from Platinum status</Text>
          </View>
        </View>

        {/* AI Travel Intelligence */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>AI Travel Intelligence</Text>
            <TouchableOpacity><Text style={styles.editText}>EDIT</Text></TouchableOpacity>
          </View>
          
          <View style={styles.prefGrid}>
            <View style={styles.prefCard}>
              <Ionicons name="thermometer-outline" size={24} color={Colors.light.primary} style={styles.prefIcon} />
              <Text style={styles.prefTitle}>Room Temp</Text>
              <Text style={styles.prefValue}>22°C Preferred</Text>
            </View>
            <View style={styles.prefCard}>
              <Ionicons name="cafe-outline" size={24} color={Colors.light.primary} style={styles.prefIcon} />
              <Text style={styles.prefTitle}>Morning</Text>
              <Text style={styles.prefValue}>Espresso Setup</Text>
            </View>
            <View style={styles.prefCard}>
              <Ionicons name="bed-outline" size={24} color={Colors.light.primary} style={styles.prefIcon} />
              <Text style={styles.prefTitle}>Pillows</Text>
              <Text style={styles.prefValue}>Firm Memory Foam</Text>
            </View>
            <View style={styles.prefCard}>
              <Ionicons name="sunny-outline" size={24} color={Colors.light.primary} style={styles.prefIcon} />
              <Text style={styles.prefTitle}>Lighting</Text>
              <Text style={styles.prefValue}>Warm Ambient</Text>
            </View>
          </View>
        </View>

        {/* Saved Stays */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Stays</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedScroll}>
            <TouchableOpacity style={styles.savedCard}>
              <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCadTyGDNHcMqYi6SvjAuAfp2Iugg8VnMV3iGHqWPGzDntkDZtlULM-VoTKCCcd4epMdjCQ5oChPpbZe0qi56_A6Q1Htw5cnHLfRogArJjK-B2MuSHsiFoc5k58XPUvfdLuq_AwAr8hTJ5U5xDUSW0vizpvNExQtCgXADp_f0nufsm6rytgH1JMdBka-Qwf9GH_C2TPWOnsyyRuCnwqzEsmYYcU4OANtCaxbYodBGQLzmJwAgZYSYVrvCbLtggQDQPIAXxKX1TYpWVS' }} style={styles.savedImage} />
              <View style={styles.savedInfo}>
                <Text style={styles.savedTitle}>The Zuma Serenity Suite</Text>
                <Text style={styles.savedLocation}>Maitama</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.savedCard}>
              <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCv5D5fSgksfbXZwBfeMSax0AVw_0MkcMeajbaasy1QF_Nc_EFdHgKSovti1cnDo8OYa9zxt2uIOojXq9rYLx-hSGjwJN5U2a9ZBW7LfvViJCiw5IIopR7Y0BrqQFbLYNpKAsdzp3-zPqkovinX9AP6rSkUBFKEBQhyiwmvTWbsWWSzER5qospVzmxE3Psy8iColY0ctibO_RgcfM8KeGjcZC6C7QoCrOb1EPioEP9wnPyNnZ4d3RFEOBanRzQma9ZCqDaIMYv_UHgM' }} style={styles.savedImage} />
              <View style={styles.savedInfo}>
                <Text style={styles.savedTitle}>The Ivory Pavilion</Text>
                <Text style={styles.savedLocation}>Guzape</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.light.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(135,77,50,0.2)',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.onSurface,
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 1,
  },
  settingsBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(216, 194, 186, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.onSurface,
    marginBottom: 16,
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
    letterSpacing: 1,
  },
  tierCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  tierLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  tierValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  tierStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  prefGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  prefCard: {
    width: '47%',
    backgroundColor: '#f6f3f2',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(216, 194, 186, 0.3)',
  },
  prefIcon: {
    marginBottom: 12,
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.onSurface,
    marginBottom: 4,
  },
  prefValue: {
    fontSize: 12,
    color: Colors.light.onSurfaceVariant,
  },
  savedScroll: {
    gap: 16,
  },
  savedCard: {
    width: 200,
  },
  savedImage: {
    width: '100%',
    height: 140,
    borderRadius: 20,
    marginBottom: 12,
  },
  savedInfo: {
    paddingHorizontal: 4,
  },
  savedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.onSurface,
    marginBottom: 4,
  },
  savedLocation: {
    fontSize: 12,
    color: Colors.light.onSurfaceVariant,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff0f0',
    borderRadius: 16,
    marginTop: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.error,
  }
});
