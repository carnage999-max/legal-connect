import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

export interface NotificationData {
  type: 'new_message' | 'appointment_reminder' | 'new_request' | 'payment_received' | 'document_signed';
  id?: string;
  conversationId?: string;
  appointmentId?: string;
  requestId?: string;
  paymentId?: string;
  documentId?: string;
  title?: string;
  body?: string;
}

class NotificationService {
  private pushToken: string | null = null;

  async initialize(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await this.setupAndroidChannels();
    }

    // Request permissions
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.log('Push notification permission denied');
      return null;
    }

    // Get push token
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'legal-connect',
      });
      this.pushToken = tokenData.data;

      // Register token with backend
      await this.registerTokenWithBackend();

      return this.pushToken;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  private async setupAndroidChannels(): Promise<void> {
    // Default channel for general notifications
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#065F46',
    });

    // Channel for messages
    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Messages',
      description: 'Notifications for new messages',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#065F46',
    });

    // Channel for appointments
    await Notifications.setNotificationChannelAsync('appointments', {
      name: 'Appointments',
      description: 'Appointment reminders and updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#065F46',
    });

    // Channel for legal matters
    await Notifications.setNotificationChannelAsync('matters', {
      name: 'Legal Matters',
      description: 'Updates about your legal matters',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#065F46',
    });
  }

  private async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  private async registerTokenWithBackend(): Promise<void> {
    if (!this.pushToken) return;

    try {
      await api.registerPushToken(this.pushToken);
      console.log('Push token registered with backend');
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  }

  async unregisterToken(): Promise<void> {
    if (!this.pushToken) return;

    try {
      await api.unregisterPushToken(this.pushToken);
      this.pushToken = null;
      console.log('Push token unregistered');
    } catch (error) {
      console.error('Failed to unregister push token:', error);
    }
  }

  // Schedule a local notification
  async scheduleLocalNotification(
    title: string,
    body: string,
    data: NotificationData,
    triggerSeconds?: number
  ): Promise<string> {
    const trigger = triggerSeconds
      ? { seconds: triggerSeconds }
      : null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger,
    });

    return notificationId;
  }

  // Cancel a scheduled notification
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get all pending notifications
  async getPendingNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Set badge count (iOS)
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  // Get badge count
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  // Dismiss all delivered notifications
  async dismissAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  // Handle notification data and return navigation path
  getNavigationPathFromNotification(data: NotificationData): {
    screen: string;
    params: Record<string, any>;
  } | null {
    switch (data.type) {
      case 'new_message':
        return {
          screen: 'Messaging',
          params: { conversationId: data.conversationId },
        };
      case 'appointment_reminder':
        return {
          screen: 'AppointmentDetail',
          params: { appointmentId: data.appointmentId },
        };
      case 'new_request':
        return {
          screen: 'RequestDetail',
          params: { requestId: data.requestId },
        };
      case 'payment_received':
        return {
          screen: 'Payments',
          params: { paymentId: data.paymentId },
        };
      case 'document_signed':
        return {
          screen: 'Documents',
          params: { documentId: data.documentId },
        };
      default:
        return null;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
