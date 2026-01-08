import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  DashboardScreen as ClientDashboard,
  NewMatterScreen,
  LawyerMatchingScreen,
  MattersListScreen,
  MatterDetailScreen,
  AppointmentsScreen,
} from '../screens/client';
import {
  MessagingScreen,
  ConversationsListScreen,
  DocumentsScreen,
  PaymentsScreen,
  ProfileScreen,
  EditProfileScreen,
  ChangePasswordScreen,
  NotificationsScreen,
  HelpCenterScreen,
} from '../screens/shared';
import { colors, fontSize, fontWeight } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

type IconName = keyof typeof Ionicons.glyphMap;

// Dashboard Stack
function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { color: colors.textPrimary, fontWeight: fontWeight.semibold },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="DashboardHome"
        component={ClientDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="NewMatter"
        component={NewMatterScreen}
        options={{ title: 'New Legal Matter' }}
      />
      <Stack.Screen
        name="MatterDetail"
        component={MatterDetailScreen}
        options={{ title: 'Matter Details' }}
      />
      <Stack.Screen
        name="LawyerMatching"
        component={LawyerMatchingScreen}
        options={{ title: 'Find Attorney' }}
      />
      <Stack.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{ title: 'Appointments' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
}

// Matters Stack
function MattersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { color: colors.textPrimary, fontWeight: fontWeight.semibold },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="MattersList"
        component={MattersListScreen}
        options={{ title: 'My Matters' }}
      />
      <Stack.Screen
        name="NewMatter"
        component={NewMatterScreen}
        options={{ title: 'New Legal Matter' }}
      />
      <Stack.Screen
        name="MatterDetail"
        component={MatterDetailScreen}
        options={{ title: 'Matter Details' }}
      />
      <Stack.Screen
        name="LawyerMatching"
        component={LawyerMatchingScreen}
        options={{ title: 'Find Attorney' }}
      />
    </Stack.Navigator>
  );
}

// Messages Stack
function MessagesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { color: colors.textPrimary, fontWeight: fontWeight.semibold },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="ConversationsList"
        component={ConversationsListScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen
        name="Messaging"
        component={MessagingScreen}
        options={{ title: 'Chat' }}
      />
    </Stack.Navigator>
  );
}

// Documents Stack
function DocumentsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { color: colors.textPrimary, fontWeight: fontWeight.semibold },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="DocumentsList"
        component={DocumentsScreen}
        options={{ title: 'Documents' }}
      />
    </Stack.Navigator>
  );
}

// Account Stack
function AccountStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { color: colors.textPrimary, fontWeight: fontWeight.semibold },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Account' }}
      />
      <Stack.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{ title: 'Payments' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
      <Stack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{ title: 'Help Center' }}
      />
    </Stack.Navigator>
  );
}

function TabBarIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return (
    <View style={styles.tabIconContainer}>
      <Ionicons
        name={name}
        size={24}
        color={focused ? colors.clientAccent : colors.textSecondary}
      />
      {focused && <View style={styles.tabIndicator} />}
    </View>
  );
}

export function ClientNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.clientAccent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: fontWeight.medium,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Matters"
        component={MattersStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'briefcase' : 'briefcase-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'chatbubbles' : 'chatbubbles-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'document-text' : 'document-text-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.clientAccent,
    marginTop: 2,
  },
});
