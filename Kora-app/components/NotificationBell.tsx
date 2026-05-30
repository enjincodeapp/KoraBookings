import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { notificationApi } from '../services/api';

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationTranslate = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(notificationTranslate, {
      toValue: showNotifications ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [showNotifications]);

  useEffect(() => {
    refreshUnreadCount();
  }, []);

  const refreshUnreadCount = async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      setUnreadCount(res.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await notificationApi.getNotifications('all');
      setNotifications(res.data.data);
      setUnreadCount(res.data.data.filter((n: NotificationItem) => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await notificationApi.markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await notificationApi.markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const openNotifications = () => {
    setShowNotifications(true);
    loadNotifications();
  };

  const closeNotifications = () => setShowNotifications(false);

  return (
    <>
      <TouchableOpacity style={styles.bell} onPress={openNotifications}>
        <Ionicons name="notifications-outline" size={24} color={Colors.light.secondary} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={showNotifications} transparent animationType="fade" onRequestClose={closeNotifications}>
        <View style={styles.modalWrapper}>
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeNotifications} />
          <Animated.View
            style={[
              styles.panel,
              {
                transform: [
                  {
                    translateX: notificationTranslate.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 320],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Notifications</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={loadNotifications} disabled={loadingNotifications} style={styles.iconButton}>
                  <Ionicons name="refresh" size={20} color={Colors.light.onSurfaceVariant} />
                </TouchableOpacity>
                <TouchableOpacity onPress={closeNotifications} style={styles.iconButton}>
                  <Ionicons name="close" size={20} color={Colors.light.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
                <Ionicons name="checkmark-done" size={16} color={Colors.light.secondary} />
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
            )}
            {loadingNotifications ? (
              <ActivityIndicator style={styles.loader} color={Colors.light.secondary} />
            ) : notifications.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="notifications-off-outline" size={32} color={Colors.light.onSurfaceVariant} />
                <Text style={styles.emptyText}>No notifications yet</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {notifications.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.item, !item.is_read && styles.itemUnread]}
                    activeOpacity={item.is_read ? 1 : 0.6}
                    disabled={item.is_read}
                    onPress={() => handleMarkAsRead(item.id)}
                  >
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      {!item.is_read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.itemText}>{item.message}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  panel: {
    position: 'absolute',
    top: 72,
    right: 0,
    bottom: 0,
    width: 320,
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.onSurface,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(135, 77, 50, 0.12)',
  },
  itemUnread: {
    backgroundColor: 'rgba(135, 77, 50, 0.06)',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
    marginLeft: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.onSurface,
  },
  itemText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.onSurfaceVariant,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    marginBottom: 12,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.secondary,
  },
  loader: {
    marginTop: 32,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.onSurfaceVariant,
  },
});
