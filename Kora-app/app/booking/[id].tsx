import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { spaceApi, bookingApi } from '../../services/api';

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [space, setSpace] = useState<any>(null);
  const [fetchingSpace, setFetchingSpace] = useState(true);

  const [checkIn, setCheckIn] = useState('2026-10-12');
  const [checkOut, setCheckOut] = useState('2026-10-15');
  const [guestCount, setGuestCount] = useState('2');
  const [guestPhone, setGuestPhone] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('20:00');

  // Calculate duration
  const stayDuration = React.useMemo(() => {
    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = end.getTime() - start.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 1;
    } catch (e) {
      return 1;
    }
  }, [checkIn, checkOut]);

  React.useEffect(() => {
    fetchSpace();
  }, [id]);

  const fetchSpace = async () => {
    try {
      const resp = await spaceApi.getSpace(id as string);
      setSpace(resp.data);
    } catch (err) {
      console.error(err);
      // Fallback for demo
      setSpace({
        id: id,
        name: 'The Zuma Serenity Suite',
        address: 'Maitama, Abuja',
        price_per_night: 145000,
        images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCadTyGDNHcMqYi6SvjAuAfp2Iugg8VnMV3iGHqWPGzDntkDZtlULM-VoTKCCcd4epMdjCQ5oChPpbZe0qi56_A6Q1Htw5cnHLfRogArJjK-B2MuSHsiFoc5k58XPUvfdLuq_AwAr8hTJ5U5xDUSW0vizpvNExQtCgXADp_f0nufsm6rytgH1JMdBka-Qwf9GH_C2TPWOnsyyRuCnwqzEsmYYcU4OANtCaxbYodBGQLzmJwAgZYSYVrvCbLtggQDQPIAXxKX1TYpWVS']
      });
    } finally {
      setFetchingSpace(false);
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
      return images;
    }
    if (Array.isArray(images) && images.length > 0) return images[0];
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCadTyGDNHcMqYi6SvjAuAfp2Iugg8VnMV3iGHqWPGzDntkDZtlULM-VoTKCCcd4epMdjCQ5oChPpbZe0qi56_A6Q1Htw5cnHLfRogArJjK-B2MuSHsiFoc5k58XPUvfdLuq_AwAr8hTJ5U5xDUSW0vizpvNExQtCgXADp_f0nufsm6rytgH1JMdBka-Qwf9GH_C2TPWOnsyyRuCnwqzEsmYYcU4OANtCaxbYodBGQLzmJwAgZYSYVrvCbLtggQDQPIAXxKX1TYpWVS';
  };

  const handleConfirm = async () => {
    if (!firstName || !lastName || !email || !guestPhone) {
      Alert.alert('Missing Details', 'Please fill in all guest information including phone number.');
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await bookingApi.createBooking({
        space_id: id as string,
        date: checkIn,
        start_time: startTime,
        end_time: endTime,
        guests: parseInt(guestCount) || 1,
        guest_email: email,
        guest_phone: guestPhone
      });
      Alert.alert('Booking Confirmed', 'Your stay has been successfully booked!', [
        { text: 'View Bookings', onPress: () => router.replace('/(tabs)/bookings') }
      ]);
    } catch (err: any) {
      Alert.alert('Booking Failed', err.response?.data?.message || 'Please check the details and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingSpace) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background }}>
        <StatusBar barStyle="dark-content" />
        {/* <Text style={{ color: Colors.light.primary, fontWeight: '600' }}>Loading details...</Text> */}
      </View>
    );
  }

  if (!space) return null;

  const nightlyRate = Number(space.price_per_night ?? space.price_per_hour ?? 0);

  const subtotal = nightlyRate * stayDuration;
  const serviceFee = 25000;
  const taxes = subtotal * 0.075;
  const total = subtotal + serviceFee + taxes;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Booking</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="help-circle-outline" size={24} color={Colors.light.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <Text style={[styles.progressText, styles.progressTextActive]}>DETAILS</Text>
          </View>
          <View style={[styles.progressLine, styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <Text style={[styles.progressText, styles.progressTextActive]}>PAYMENT</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={styles.progressDot} />
            <Text style={styles.progressText}>CONFIRM</Text>
          </View>
        </View>

        {/* Stay Summary Card */}
        <View style={styles.summaryCard}>
          <Image source={{ uri: getImageUri(space.images) }} style={styles.summaryImage} />
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>{space.name}</Text>
            <Text style={styles.summaryLocation}>{space.address || space.area || 'Abuja'}</Text>
            <View style={styles.summaryDetails}>
              <View style={styles.summaryDetailItem}>
                <Ionicons name="calendar-outline" size={12} color={Colors.light.onSurfaceVariant} />
                <Text style={styles.summaryDetailText}>{new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}</Text>
              </View>
              <View style={styles.summaryDetailItem}>
                <Ionicons name="people-outline" size={12} color={Colors.light.onSurfaceVariant} />
                <Text style={styles.summaryDetailText}>{guestCount} Guests</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stay Details Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stay Details</Text>

          <View style={styles.quickDateContainer}>
            <Text style={styles.quickDateLabel}>QUICK SELECT:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickDateScroll}>
              <TouchableOpacity style={styles.dateChip} onPress={() => {
                const today = new Date().toISOString().split('T')[0];
                setCheckIn(today);
                const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
                setCheckOut(tomorrow.toISOString().split('T')[0]);
              }}>
                <Text style={styles.dateChipText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateChip} onPress={() => {
                const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
                setCheckIn(tomorrow.toISOString().split('T')[0]);
                const nextDay = new Date(); nextDay.setDate(nextDay.getDate() + 2);
                setCheckOut(nextDay.toISOString().split('T')[0]);
              }}>
                <Text style={styles.dateChipText}>Tomorrow</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateChip} onPress={() => {
                const d = new Date(); d.setDate(d.getDate() + (6 - d.getDay()));
                setCheckIn(d.toISOString().split('T')[0]);
                const monday = new Date(d); monday.setDate(monday.getDate() + 2);
                setCheckOut(monday.toISOString().split('T')[0]);
              }}>
                <Text style={styles.dateChipText}>Next Weekend</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>CHECK-IN DATE</Text>
              <TextInput
                style={styles.input}
                value={checkIn}
                onChangeText={setCheckIn}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>CHECK-OUT DATE</Text>
              <TextInput
                style={styles.input}
                value={checkOut}
                onChangeText={setCheckOut}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>
          <View style={[styles.formGroup, { marginTop: 16 }]}>
            <Text style={styles.label}>NUMBER OF GUESTS</Text>
            <TextInput
              style={styles.input}
              value={guestCount}
              onChangeText={setGuestCount}
              placeholder="e.g. 2"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.formRow, { marginTop: 16 }]}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>START TIME</Text>
              <TextInput
                style={styles.input}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="14:00"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>END TIME</Text>
              <TextInput
                style={styles.input}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="20:00"
              />
            </View>
          </View>
        </View>

        {/* Guest Information Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest Information</Text>
          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>FIRST NAME</Text>
              <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="John" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>LAST NAME</Text>
              <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Doe" />
            </View>
          </View>
          <View style={[styles.formGroup, { marginTop: 16 }]}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="john.doe@example.com" keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={[styles.formGroup, { marginTop: 16 }]}>
            <Text style={styles.label}>PHONE NUMBER</Text>
            <TextInput style={styles.input} value={guestPhone} onChangeText={setGuestPhone} placeholder="+234 ..." keyboardType="phone-pad" />
          </View>
        </View>

        {/* AI Optional Add-on */}
        <View style={styles.addonCard}>
          <View style={styles.addonHeader}>
            <Ionicons name="sparkles" size={20} color={Colors.light.onSecondary} />
            <Text style={styles.addonTitle}>Kora AI Suggestion</Text>
          </View>
          <Text style={styles.addonDesc}>Based on your arrival time (7:00 PM), would you like us to pre-order dinner from our partner restaurants? It will be ready upon your arrival.</Text>
          <TouchableOpacity style={styles.addonBtn}>
            <Text style={styles.addonBtnText}>View Dinner Options (+₦15,000 avg)</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.paymentOptionLeft}>
              <Ionicons name="card-outline" size={24} color={paymentMethod === 'card' ? Colors.light.primary : Colors.light.outline} />
              <Text style={styles.paymentOptionText}>Credit or Debit Card</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'card' && styles.radioActive]}>
              {paymentMethod === 'card' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'transfer' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('transfer')}
          >
            <View style={styles.paymentOptionLeft}>
              <Ionicons name="cash-outline" size={24} color={paymentMethod === 'transfer' ? Colors.light.primary : Colors.light.outline} />
              <Text style={styles.paymentOptionText}>Bank Transfer</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'transfer' && styles.radioActive]}>
              {paymentMethod === 'transfer' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'Crypto' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('Crypto')}
          >
            <View style={styles.paymentOptionLeft}>
              <Ionicons name="logo-bitcoin" size={24} color={paymentMethod === 'Crypto' ? Colors.light.primary : Colors.light.outline} />
              <Text style={styles.paymentOptionText}>Crypto</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'Crypto' && styles.radioActive]}>
              {paymentMethod === 'Crypto' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>₦{nightlyRate.toLocaleString()} x {stayDuration} nights</Text>
            <Text style={styles.priceValue}>₦{subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Kora Service Fee</Text>
            <Text style={styles.priceValue}>₦{serviceFee.toLocaleString()}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Taxes (VAT 7.5%)</Text>
            <Text style={styles.priceValue}>₦{taxes.toLocaleString()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRowTotal}>
            <Text style={styles.priceTotalLabel}>Total (NGN)</Text>
            <Text style={styles.priceTotalValue}>₦{total.toLocaleString()}</Text>
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={loading}>
          <Text style={styles.confirmBtnText}>{loading ? 'Processing...' : 'Confirm & Pay'}</Text>
          <Ionicons name="lock-closed" size={16} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.secureText}>Your payment is securely processed by Paystack.</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(216, 194, 186, 0.3)',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  progressStep: {
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.surfaceVariant,
  },
  progressDotActive: {
    backgroundColor: Colors.light.primary,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.onSurfaceVariant,
    letterSpacing: 1,
  },
  progressTextActive: {
    color: Colors.light.primary,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.light.surfaceVariant,
    marginHorizontal: 8,
    marginTop: -16,
  },
  progressLineActive: {
    backgroundColor: Colors.light.primary,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#f6f3f2',
    borderRadius: 20,
    padding: 12,
    gap: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(216, 194, 186, 0.3)',
  },
  summaryImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  summaryInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.onSurface,
    marginBottom: 4,
  },
  summaryLocation: {
    fontSize: 12,
    color: Colors.light.onSurfaceVariant,
    marginBottom: 8,
  },
  summaryDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryDetailText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.onSurfaceVariant,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.onSurface,
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  formGroup: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.outline,
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    height: 52,
    backgroundColor: '#f6f3f2',
    borderWidth: 1,
    borderColor: 'rgba(216, 194, 186, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.light.onSurface,
  },
  addonCard: {
    backgroundColor: Colors.light.secondaryContainer,
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
  },
  addonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.onSecondaryContainer,
  },
  addonDesc: {
    fontSize: 14,
    color: 'rgba(79, 106, 91, 0.8)',
    lineHeight: 22,
    marginBottom: 16,
  },
  addonBtn: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addonBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.secondary,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(216, 194, 186, 0.5)',
    borderRadius: 16,
    marginBottom: 12,
  },
  paymentOptionActive: {
    borderColor: Colors.light.primary,
    backgroundColor: 'rgba(135, 77, 50, 0.05)',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.onSurface,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: Colors.light.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.light.onSurfaceVariant,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.onSurface,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(216, 194, 186, 0.3)',
    marginVertical: 16,
  },
  priceRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.onSurface,
  },
  priceTotalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  confirmBtn: {
    backgroundColor: Colors.light.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.onPrimary,
  },
  secureText: {
    fontSize: 12,
    color: Colors.light.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
  },
  quickDateContainer: {
    marginBottom: 16,
  },
  quickDateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.outline,
    marginBottom: 8,
    letterSpacing: 1,
  },
  quickDateScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f6f3f2',
    borderWidth: 1,
    borderColor: 'rgba(216, 194, 186, 0.3)',
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.onSurface,
  }
});
