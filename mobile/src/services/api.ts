import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { AuthTokens, ApiError } from '../types';

// Production API URL
const PRODUCTION_API_URL = 'https://api.legalconnectapp.com/api/v1';

// Your computer's local IP address - update this if your IP changes (for development only)
const LOCAL_DEV_IP = '10.92.114.26';

// Set to true to use local development API, false to use production
const USE_LOCAL_API = false;

// Determine the correct API URL based on the environment
const getApiBaseUrl = (): string => {
  // First check for environment variable
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Always use production API unless explicitly set to local
  if (!USE_LOCAL_API) {
    return PRODUCTION_API_URL;
  }

  // For local development ONLY (when USE_LOCAL_API is true)
  const localPort = '8000';

  // For physical devices running Expo Go, use the configured local IP
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];

  if (debuggerHost && debuggerHost !== 'localhost') {
    // Use the Expo debugger host IP (your computer's IP)
    return `http://${debuggerHost}:${localPort}/api/v1`;
  }

  if (Platform.OS === 'android') {
    // Android physical device needs the actual IP
    return `http://${LOCAL_DEV_IP}:${localPort}/api/v1`;
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost directly
    return `http://localhost:${localPort}/api/v1`;
  }

  // Fallback - use production API
  return PRODUCTION_API_URL;
};

const API_BASE_URL = getApiBaseUrl();

// Log the API URL for debugging
console.log('[API] Using base URL:', API_BASE_URL);
console.log('[API] Platform:', Platform.OS);
console.log('[API] DEV mode:', __DEV__);

class ApiService {
  private api: AxiosInstance;
  private refreshingToken: Promise<string | null> | null = null;
  private onAuthStateChange: ((isAuthenticated: boolean) => void) | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000, // 15 second timeout
    });

    this.setupInterceptors();
  }

  // Allow AuthContext to subscribe to auth state changes (e.g., when refresh fails)
  setAuthStateChangeCallback(callback: (isAuthenticated: boolean) => void) {
    this.onAuthStateChange = callback;
  }

  // Public method to get the current API URL (useful for debugging)
  getBaseUrl(): string {
    return API_BASE_URL;
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 errors - try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            } else {
              // Refresh failed - no valid refresh token
              await this.handleAuthFailure();
            }
          } catch (refreshError) {
            // Refresh request itself failed
            await this.handleAuthFailure();
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Handle authentication failure - clear tokens and notify listeners
  private async handleAuthFailure() {
    await this.clearTokens();
    if (this.onAuthStateChange) {
      this.onAuthStateChange(false);
    }
  }

  // Token Management
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('access_token');
    } catch {
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('refresh_token');
    } catch {
      return null;
    }
  }

  async setTokens(tokens: AuthTokens): Promise<void> {
    await SecureStore.setItemAsync('access_token', tokens.access);
    await SecureStore.setItemAsync('refresh_token', tokens.refresh);
  }

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshingToken) {
      return this.refreshingToken;
    }

    this.refreshingToken = (async () => {
      try {
        const refreshToken = await this.getRefreshToken();
        if (!refreshToken) return null;

        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access, refresh: newRefreshToken } = response.data;

        // Save the new access token
        await SecureStore.setItemAsync('access_token', access);

        // If server rotates refresh tokens, save the new one
        if (newRefreshToken) {
          await SecureStore.setItemAsync('refresh_token', newRefreshToken);
        }

        return access;
      } catch (error) {
        console.log('[API] Token refresh failed:', error);
        return null;
      } finally {
        this.refreshingToken = null;
      }
    })();

    return this.refreshingToken;
  }

  // Auth Endpoints
  async login(email: string, password: string): Promise<AuthTokens> {
    const response = await this.api.post('/auth/token/', { email, password });
    await this.setTokens(response.data);
    return response.data;
  }

  async register(data: {
    email: string;
    password1: string;
    password2: string;
    first_name: string;
    last_name: string;
    user_type: string;
  }) {
    const response = await this.api.post('/auth/registration/', data);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout/');
    } finally {
      await this.clearTokens();
    }
  }

  async resetPassword(email: string) {
    const response = await this.api.post('/auth/password/reset/', { email });
    return response.data;
  }

  // User Endpoints
  async getProfile() {
    const response = await this.api.get('/users/profile/');
    return response.data;
  }

  async updateProfile(data: any) {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      const response = await this.api.patch('/users/profile/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await this.api.patch('/users/profile/', data);
    return response.data;
  }

  async uploadAvatar(formData: FormData) {
    const response = await this.api.post('/users/profile/avatar/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async changePassword(
    dataOrOld: { old_password: string; new_password: string } | string,
    maybeNew?: string
  ) {
    const payload =
      typeof dataOrOld === 'string'
        ? { old_password: dataOrOld, new_password: maybeNew as string }
        : dataOrOld;
    const response = await this.api.post('/users/password/change/', payload);
    return response.data;
  }

  // Attorneys Endpoints
  async getAttorneys(params?: Record<string, any>) {
    const response = await this.api.get('/attorneys/', { params });
    return response.data;
  }

  async getAttorneyProfile(id: string) {
    const response = await this.api.get(`/attorneys/${id}/`);
    return response.data;
  }

  // Current attorney's own profile (detailed, private fields)
  async getMyAttorneyProfile() {
    const response = await this.api.get('/attorneys/profile/');
    return response.data;
  }

  async getMatchingAttorneys(matterId: string) {
    const response = await this.api.get(`/conflicts/matter/${matterId}/available-attorneys/`);
    return response.data;
  }

  async requestConflictCheck(matterId: string) {
    const response = await this.api.post('/conflicts/check/', { matter_id: matterId });
    return response.data;
  }

  // Matters Endpoints
  async getMatters(params?: Record<string, any>) {
    const response = await this.api.get('/matters/', { params });
    return response.data;
  }

  async getMatter(id: string) {
    const response = await this.api.get(`/matters/${id}/`);
    return response.data;
  }

  async createMatter(data: any) {
    const response = await this.api.post('/matters/', data);
    return response.data;
  }

  async updateMatter(id: string, data: any) {
    const response = await this.api.patch(`/matters/${id}/`, data);
    return response.data;
  }

  async submitMatter(id: string) {
    const response = await this.api.post(`/matters/${id}/submit/`);
    return response.data;
  }

  async getClientDashboard() {
    const response = await this.api.get('/matters/dashboard/client/');
    return response.data;
  }

  // Matter Parties
  async getMatterParties(matterId: string) {
    const response = await this.api.get(`/matters/${matterId}/parties/`);
    return response.data;
  }

  async addMatterParty(matterId: string, data: any) {
    const response = await this.api.post(`/matters/${matterId}/parties/`, data);
    return response.data;
  }

  async removeMatterParty(matterId: string, partyId: string) {
    const response = await this.api.delete(`/matters/${matterId}/parties/${partyId}/`);
    return response.data;
  }

  // Conflicts Endpoints
  async runConflictCheck(matterId: string) {
    const response = await this.api.post('/conflicts/check/', { matter_id: matterId });
    return response.data;
  }

  async getConflictCheckResult(checkId: string) {
    const response = await this.api.get(`/conflicts/check/${checkId}/`);
    return response.data;
  }

  // Messaging Endpoints
  async getConversations() {
    const response = await this.api.get('/messaging/conversations/');
    return response.data;
  }

  async getConversation(id: string) {
    const response = await this.api.get(`/messaging/conversations/${id}/`);
    return response.data;
  }

  async createConversation(participantIds: string[], matterId?: string, title?: string) {
    const response = await this.api.post('/messaging/conversations/create/', {
      participant_ids: participantIds,
      matter_id: matterId,
      title,
    });
    return response.data;
  }

  async getMessages(conversationId: string, params?: Record<string, any>) {
    const response = await this.api.get(`/messaging/conversations/${conversationId}/messages/`, { params });
    return response.data;
  }

  async sendMessage(conversationId: string, data: { content: string; attachment?: FormData }) {
    if (data.attachment) {
      data.attachment.append('content', data.content);
      const response = await this.api.post(
        `/messaging/conversations/${conversationId}/messages/`,
        data.attachment,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    }

    const response = await this.api.post(
      `/messaging/conversations/${conversationId}/messages/`,
      { content: data.content }
    );
    return response.data;
  }

  async markMessageAsRead(messageIds: string[]) {
    const response = await this.api.post('/messaging/mark-read/', { message_ids: messageIds });
    return response.data;
  }

  async getUnreadMessageCount() {
    const response = await this.api.get('/messaging/unread-count/');
    return response.data;
  }

  // Documents Endpoints
  async getDocuments(params?: Record<string, any>) {
    const response = await this.api.get('/documents/', { params });
    return response.data;
  }

  async getDocument(id: string) {
    const response = await this.api.get(`/documents/${id}/`);
    return response.data;
  }

  async uploadDocument(formData: FormData) {
    const response = await this.api.post('/documents/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async requestSignature(documentId: string, signerIds: string[]) {
    const response = await this.api.post(`/documents/${documentId}/request-signature/`, {
      signer_ids: signerIds,
    });
    return response.data;
  }

  async getPendingSignatures() {
    const response = await this.api.get('/documents/signatures/pending/');
    return response.data;
  }

  async signDocument(signatureId: string, signatureData: string) {
    const response = await this.api.post(`/documents/signatures/${signatureId}/sign/`, {
      signature_data: signatureData,
    });
    return response.data;
  }

  // Scheduling Endpoints
  async getAppointments(params?: Record<string, any>) {
    const response = await this.api.get('/scheduling/appointments/', { params });
    return response.data;
  }

  async getAppointment(id: string) {
    const response = await this.api.get(`/scheduling/appointments/${id}/`);
    return response.data;
  }

  async createAppointment(data: any) {
    const response = await this.api.post('/scheduling/appointments/create/', data);
    return response.data;
  }

  async rescheduleAppointment(appointmentId: string, data: any) {
    const response = await this.api.post(`/scheduling/appointments/${appointmentId}/reschedule/`, data);
    return response.data;
  }

  async completeAppointment(appointmentId: string) {
    const response = await this.api.post(`/scheduling/appointments/${appointmentId}/complete/`);
    return response.data;
  }

  async getUpcomingAppointments() {
    const response = await this.api.get('/scheduling/appointments/upcoming/');
    return response.data;
  }

  async getAvailableSlots(params: { attorney_id: string; date: string; duration_minutes?: number }) {
    const payload = {
      attorney_id: params.attorney_id,
      date: params.date,
      duration_minutes: params.duration_minutes ?? 30,
    };
    const response = await this.api.post('/scheduling/available-slots/', payload);
    return response.data;
  }

  // Payments Endpoints
  async getPayments() {
    const response = await this.api.get('/payments/');
    return response.data;
  }

  async createPayment(data: any) {
    const response = await this.api.post('/payments/create/', data);
    return response.data;
  }

  async getPaymentMethods() {
    const response = await this.api.get('/payments/methods/');
    return response.data;
  }

  async addPaymentMethod(paymentMethodId: string) {
    const response = await this.api.post('/payments/methods/add/', {
      stripe_payment_method_id: paymentMethodId,
    });
    return response.data;
  }

  async requestRefund(paymentId: string, reason?: string) {
    const response = await this.api.post('/payments/refund/', {
      payment_id: paymentId,
      reason,
    });
    return response.data;
  }

  // Invoices
  async getInvoices() {
    const response = await this.api.get('/payments/invoices/');
    return response.data;
  }

  async createInvoice(data: any) {
    const response = await this.api.post('/payments/invoices/create/', data);
    return response.data;
  }

  async getInvoice(invoiceId: string) {
    const response = await this.api.get(`/payments/invoices/${invoiceId}/`);
    return response.data;
  }

  // Notifications Endpoints
  async getNotifications(params?: Record<string, any>) {
    const response = await this.api.get('/notifications/', { params });
    return response.data;
  }

  async markNotificationsAsRead(notificationIds: string[]) {
    const response = await this.api.post('/notifications/mark-read/', { notification_ids: notificationIds });
    return response.data;
  }

  async getUnreadNotificationCount() {
    const response = await this.api.get('/notifications/unread-count/');
    return response.data;
  }

  async getNotificationPreferences() {
    const response = await this.api.get('/notifications/preferences/');
    return response.data;
  }

  async updateNotificationPreferences(data: any) {
    const response = await this.api.patch('/notifications/preferences/', data);
    return response.data;
  }

  async registerPushToken(token: string) {
    const response = await this.api.post('/notifications/devices/register/', {
      token,
      platform: require('react-native').Platform.OS,
    });
    return response.data;
  }

  async unregisterPushToken(token: string) {
    const response = await this.api.post('/notifications/devices/unregister/', { token });
    return response.data;
  }

  // Attorney-specific Endpoints
  async getIncomingRequests(params?: Record<string, any>) {
    const response = await this.api.get('/matters/dashboard/attorney/requests/', { params });
    return response.data;
  }

  async getAttorneyDashboard() {
    const response = await this.api.get('/attorneys/dashboard/');
    return response.data;
  }

  async getAttorneyMatters(params?: Record<string, any>) {
    const response = await this.api.get('/matters/', { params });
    return response.data;
  }

  async getAttorneyClients() {
    const response = await this.api.get('/attorneys/clients/');
    return response.data;
  }

  async getPayouts(params?: Record<string, any>) {
    const response = await this.api.get('/payments/payouts/', { params });
    return response.data;
  }

  async getEarningsSummary() {
    const response = await this.api.get('/payments/earnings-summary/');
    return response.data;
  }

  async getPayoutHistory(params?: Record<string, any>) {
    const response = await this.api.get('/payments/payouts/', { params });
    return response.data;
  }

  async getAttorneyAvailability() {
    const response = await this.api.get('/attorneys/availability/');
    return response.data;
  }

  async updateAttorneyAvailability(data: any) {
    const response = await this.api.post('/attorneys/availability/', data);
    return response.data;
  }

  async deleteAttorneyAvailability(slotId: string) {
    const response = await this.api.delete(`/attorneys/availability/${slotId}/`);
    return response.data;
  }

  async respondToRequest(matterId: string, data: { action: 'accept' | 'decline'; reason?: string }) {
    const response = await this.api.post(`/matters/${matterId}/respond/`, data);
    return response.data;
  }

  async selectAttorney(matterId: string, attorneyId: string) {
    const response = await this.api.post(`/matters/${matterId}/select-attorney/`, {
      attorney_id: attorneyId
    });
    return response.data;
  }

  async confirmAppointment(appointmentId: string) {
    const response = await this.api.post(`/scheduling/appointments/${appointmentId}/confirm/`);
    return response.data;
  }

  async cancelAppointment(appointmentId: string) {
    const response = await this.api.post(`/scheduling/appointments/${appointmentId}/cancel/`);
    return response.data;
  }

  // Documents Additional Methods
  async downloadDocument(documentId: string) {
    const response = await this.api.get(`/documents/${documentId}/download/`);
    return response.data;
  }

  async deleteDocument(documentId: string) {
    const response = await this.api.delete(`/documents/${documentId}/`);
    return response.data;
  }

  // Payment Methods Additional
  async removePaymentMethod(methodId: string) {
    const response = await this.api.delete(`/payments/methods/${methodId}/delete/`);
    return response.data;
  }

  async setDefaultPaymentMethod(methodId: string) {
    const response = await this.api.post(`/payments/methods/${methodId}/set-default/`);
    return response.data;
  }

  // User Account
  async deleteAccount() {
    const response = await this.api.delete('/users/delete-account/');
    return response.data;
  }

  // Attorney Reviews
  async getAttorneyReviews(attorneyId: string) {
    const response = await this.api.get(`/attorneys/${attorneyId}/reviews/`);
    return response.data;
  }

  async createReview(data: { attorney_id: string; rating: number; comment: string }) {
    const response = await this.api.post('/attorneys/reviews/create/', data);
    return response.data;
  }

  // Practice Areas and Jurisdictions
  async getPracticeAreas() {
    const response = await this.api.get('/attorneys/practice-areas/');
    return response.data;
  }

  async getJurisdictions() {
    const response = await this.api.get('/attorneys/jurisdictions/');
    return response.data;
  }

  // Attorney Onboarding
  async completeAttorneyOnboarding(data: any) {
    const response = await this.api.post('/attorneys/onboarding/', data);
    return response.data;
  }
}

export const api = new ApiService();
export default api;
