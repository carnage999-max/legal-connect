import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { ClientNavigator } from './ClientNavigator';
import { AttorneyNavigator } from './AttorneyNavigator';
import { colors } from '../utils/theme';

export function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  const linking: LinkingOptions<any> = {
    prefixes: ['legalconnect://'],
    config: {
      screens: {
        // Auth
        Login: 'login',
        Register: 'register',
        // Client primary
        Home: 'home',
        Matters: 'matters',
        Messages: 'messages',
        Documents: 'documents',
        Account: 'account',
        // Nested examples
        Messaging: 'messages/:conversationId',
        MatterDetail: 'matters/:matterId',
        DocumentsList: 'documents/list',
      },
    },
    // Fallback logging for quick testing
    getInitialURL: async () => null,
    subscribe(listener) {
      const onReceiveURL = ({ url }: { url: string }) => listener(url);
      const subscription = (global as any).Linking?.addEventListener?.('url', onReceiveURL);
      return () => subscription && subscription.remove();
    },
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.clientAccent} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.user_type === 'attorney' ? (
        <AttorneyNavigator />
      ) : (
        <ClientNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});
