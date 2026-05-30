import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

export default function BookingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Bookings</Text>
          <TouchableOpacity><Text style={styles.viewAllText}>VIEW ALL HISTORY</Text></TouchableOpacity>
        </View>

        {/* Booking Card 1 */}
        <View style={styles.bookingCard}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLnmPBz96O1F9uogKKJdXpwasdxR3Q6MYXknbgwd9pWZ0Q5PRCClBqqEmfaXiKk56V9Qt0pJQK6k7WfLtBZPn8wm6Zm5V2UKt3C_zCYg44Yv85XLnKZmUnDHX2_IDfjRoE3OsVjSJnfpl5G2WsdV3EtFTJeaqjS3QnmiELxxMFqsAf7wc91dYorye5CawXW7nc1tGeQGqXyU988Niq9uoqr0usv7gJbGcLm1q789FJgqLNQWyX5ZlcJACmVHlpP6nWPYlQyxbxGPlB' }} 
            style={styles.bookingImage} 
          />
          <View style={styles.bookingContent}>
            <View>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingTitle}>The Residence Abuja</Text>
                <View style={styles.badgeConfirmed}>
                  <Text style={styles.badgeTextConfirmed}>CONFIRMED</Text>
                </View>
              </View>
              <Text style={styles.bookingLocation}>Maitama District • Suite 402</Text>
              
              <View style={styles.bookingDetailsRow}>
                <View style={styles.bookingDetailItem}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.light.onSurfaceVariant} />
                  <Text style={styles.bookingDetailText}>Oct 12 - Oct 15</Text>
                </View>
                <View style={styles.bookingDetailItem}>
                  <Ionicons name="person-outline" size={14} color={Colors.light.onSurfaceVariant} />
                  <Text style={styles.bookingDetailText}>2 Guests</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.bookingFooter}>
              <TouchableOpacity>
                <Text style={styles.manageBtnText}>Manage Stay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Booking Card 2 */}
        <View style={styles.bookingCard}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1raXkZPv1mYpWBUOEBymgZ9ECgL8NYMHA9HlNVTKyABDE_yIKwiwKhsNOrcx5hmoeA-kwPF1ggjJrEZUBWW0hzKiF14TgS0Mqvf9Gq6IabrWSFCUnx3_OU4J2k3a3N0Emf04uO_wHtwWA4TB1YpHq_Tqmk43TmFe5Wx8E-tqeGHzEFfJbUP-RQVXHtqnFlbBOPUiNzd5YdM39za-wMCLqBl5BQ9Ly_kSGehH6qmDpdSH7znFZPzUxEw_XhhoPHrIYuEQrOuyKQbRb' }} 
            style={styles.bookingImage} 
          />
          <View style={styles.bookingContent}>
            <View>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingTitle}>Azure Heights</Text>
                <View style={styles.badgePending}>
                  <Text style={styles.badgeTextPending}>PENDING</Text>
                </View>
              </View>
              <Text style={styles.bookingLocation}>Wuse II • Executive Loft</Text>
              
              <View style={styles.bookingDetailsRow}>
                <View style={styles.bookingDetailItem}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.light.onSurfaceVariant} />
                  <Text style={styles.bookingDetailText}>Nov 02 - Nov 05</Text>
                </View>
                <View style={styles.bookingDetailItem}>
                  <Ionicons name="person-outline" size={14} color={Colors.light.onSurfaceVariant} />
                  <Text style={styles.bookingDetailText}>1 Guest</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.bookingFooter}>
              <TouchableOpacity>
                <Text style={styles.manageBtnText}>Complete Booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

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
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.light.surface,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.onSurface,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.onSurface,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
    letterSpacing: 1,
  },
  bookingCard: {
    backgroundColor: '#f6f3f2',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(216, 194, 186, 0.3)',
  },
  bookingImage: {
    width: '100%',
    height: 160,
  },
  bookingContent: {
    padding: 20,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.onSurface,
  },
  badgeConfirmed: {
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTextConfirmed: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.onSecondary,
  },
  badgePending: {
    backgroundColor: 'rgba(73, 100, 85, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTextPending: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.secondary,
  },
  bookingLocation: {
    fontSize: 14,
    color: Colors.light.onSurfaceVariant,
    marginBottom: 16,
  },
  bookingDetailsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  bookingDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookingDetailText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(83, 67, 62, 0.6)',
  },
  bookingFooter: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  manageBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
  }
});
