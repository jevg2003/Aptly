import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Vibration,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { SessionContext } from '../lib/SessionContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ObsidianHeaderProps {
  title: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  subtitle?: string;
  hideNotificationsBell?: boolean;
}

export const ObsidianHeader: React.FC<ObsidianHeaderProps> = ({
  title,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
  subtitle,
  hideNotificationsBell = false,
}) => {
  const session = useContext(SessionContext);
  const currentUserId = session?.user?.id;

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch and Subscribe to Notifications
  useEffect(() => {
    if (!currentUserId || hideNotificationsBell) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.is_read).length);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to Realtime notifications for this specific user
    const channel = supabase
      .channel(`user-notifications:${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new;
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
            
            // Premium micro-vibration upon receiving message/update
            try {
              Vibration.vibrate(100);
            } catch (e) {}
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotif = payload.new;
            setNotifications((prev) =>
              prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n))
            );
            setNotifications((prev) => {
              setUnreadCount(prev.filter((n) => !n.is_read).length);
              return prev;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, hideNotificationsBell]);

  const markAllAsRead = async () => {
    if (!currentUserId) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUserId)
        .eq('is_read', false);

      if (!error) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error('Error marking notifications as read:', e);
    }
  };

  const handleNotificationPress = async (notification: any) => {
    if (!notification.is_read) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notification.id);

        if (!error) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (e) {
        console.error('Error updating notification read state:', e);
      }
    }
  };

  const renderNotificationItem = ({ item }: { item: any }) => {
    let iconName: keyof typeof Ionicons.glyphMap = 'notifications-outline';
    let iconColor = '#94a3b8';
    let bgGlow = 'rgba(255, 255, 255, 0.05)';

    if (item.type === 'application_accepted') {
      iconName = 'sparkles';
      iconColor = '#00E676';
      bgGlow = 'rgba(0, 230, 118, 0.08)';
    } else if (item.type === 'application_rejected') {
      iconName = 'close-circle';
      iconColor = '#FF3B30';
      bgGlow = 'rgba(255, 59, 48, 0.08)';
    } else if (item.type === 'new_message') {
      iconName = 'chatbubble-ellipses';
      iconColor = '#00A3FF';
      bgGlow = 'rgba(0, 163, 255, 0.08)';
    }

    const relativeTime = () => {
      try {
        const diffMs = Date.now() - new Date(item.created_at).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `Hace ${diffHrs} h`;
        return new Date(item.created_at).toLocaleDateString([], {
          day: 'numeric',
          month: 'short',
        });
      } catch (e) {
        return 'Reciente';
      }
    };

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.8}
        style={[styles.notifCard, !item.is_read && styles.notifUnreadCard]}
      >
        <View style={[styles.notifIconWrapper, { backgroundColor: bgGlow }]}>
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>

        <View style={styles.notifContent}>
          <View style={styles.notifHeaderRow}>
            <Text style={styles.notifTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.notifTime}>{relativeTime()}</Text>
          </View>
          <Text style={styles.notifBody}>{item.body}</Text>
        </View>

        {!item.is_read && <View style={styles.unreadIndicatorDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Left Action Area */}
          <View style={styles.actionContainer}>
            {leftIcon && (
              <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
                <Ionicons name={leftIcon} size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Center Title Area */}
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          {/* Right Action Area with persistent notifications campanita and badge */}
          <View style={[styles.actionContainer, styles.rightActionArea]}>
            {!hideNotificationsBell && currentUserId && (
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            {rightIcon && (
              <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
                <Ionicons name={rightIcon} size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Glassmorphic Notifications Tray Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.modalHeaderTitle}>Notificaciones</Text>

              {unreadCount > 0 ? (
                <TouchableOpacity onPress={markAllAsRead} style={styles.modalMarkReadBtn}>
                  <Text style={styles.modalMarkReadText}>Marcar leídos</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ width: 85 }} />
              )}
            </View>

            {/* List area */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00A3FF" />
              </View>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderNotificationItem}
                contentContainerStyle={styles.listScrollContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="notifications-off-outline" size={60} color="rgba(255,255,255,0.08)" />
                    <Text style={styles.emptyTitle}>¡Todo al día!</Text>
                    <Text style={styles.emptySubtitle}>
                      No tienes notificaciones por ahora. Te avisaremos cuando ocurra algo importante.
                    </Text>
                  </View>
                }
              />
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#050505',
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 50,
  },
  actionContainer: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActionArea: {
    flexDirection: 'row',
    width: 'auto',
    gap: 8,
    justifyContent: 'flex-end',
    minWidth: 44,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF005C',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#050505',
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '900',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 5, 0.96)',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalMarkReadBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  modalMarkReadText: {
    color: '#00A3FF',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 40,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative',
  },
  notifUnreadCard: {
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: '#16161A',
  },
  notifIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  notifContent: {
    flex: 1,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  notifTime: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  notifBody: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  unreadIndicatorDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF005C',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
});
