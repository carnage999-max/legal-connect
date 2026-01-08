import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  DashboardScreen as AttorneyDashboard,
  RequestsScreen,
  CalendarScreen,
  ManageAvailabilityScreen,
  BillingScreen,
  ClientsListScreen,
  ClientDetailScreen,
  CreateInvoiceScreen,
} from '../screens/attorney';
import {
  MessagingScreen,
  ConversationsListScreen,
  DocumentsScreen,
  PaymentsScreen,
  ProfileScreen,
  EditProfileScreen,
  ChangePasswordScreen,
  HelpCenterScreen,
  AddPaymentMethodScreen,
} from '../screens/shared';
import { attorneyColors, fontSize, fontWeight } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

type IconName = keyof typeof Ionicons.glyphMap;

function TabBarIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return (
    <View style={styles.tabIconContainer}>
      <Ionicons
        name={name}
        size={24}
        color={focused ? attorneyColors.accent : attorneyColors.textSecondary}
      />
      {focused && <View style={styles.tabIndicator} />}
    </View>
  );
}

// Dashboard Stack
function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: attorneyColors.bgPrimary },
        headerTitleStyle: { color: attorneyColors.textPrimary, fontWeight: fontWeight.semibold },
        headerShadowVisible: false,
        headerTintColor: attorneyColors.textPrimary,
      }}
    >
      <Stack.Screen
        name="DashboardHome"
        component={AttorneyDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="Billing"
        component={BillingScreen}
        options={{ title: 'Billing & Earnings' }}
      />
      <Stack.Screen
        name="CreateInvoice"
        component={CreateInvoiceScreen}
        options={{ title: 'Create Invoice' }}
      />
      <Stack.Screen
        name="AddPaymentMethod"
        component={AddPaymentMethodScreen}
        options={{ title: 'Add Payment Method' }}
      />
    </Stack.Navigator>
  );
}

// Requests Stack
function RequestsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: attorneyColors.bgPrimary },
        headerTitleStyle: { color: attorneyColors.textPrimary, fontWeight: fontWeight.semibold },
        headerShadowVisible: false,
        headerTintColor: attorneyColors.textPrimary,
      }}
    >
      <Stack.Screen
        name="RequestsList"
        component={RequestsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Calendar Stack
function CalendarStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: attorneyColors.bgPrimary },
        headerTitleStyle: { color: attorneyColors.textPrimary, fontWeight: fontWeight.semibold },
        headerShadowVisible: false,
        headerTintColor: attorneyColors.textPrimary,
      }}
    >
      <Stack.Screen
        name="CalendarHome"
        component={CalendarScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ManageAvailability"
        component={ManageAvailabilityScreen}
        options={{ title: 'Manage Availability' }}
      />
    </Stack.Navigator>
  );
}

// Clients Stack
function ClientsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: attorneyColors.bgPrimary },
        headerTitleStyle: { color: attorneyColors.textPrimary, fontWeight: fontWeight.semibold },
        headerShadowVisible: false,
        headerTintColor: attorneyColors.textPrimary,
      }}
    >
      <Stack.Screen
        name="ClientsList"
        component={ClientsListScreen}
        options={{ title: 'My Clients' }}
      />
      <Stack.Screen
        name="ClientDetail"
        component={ClientDetailScreen}
        options={{ title: 'Client Details' }}
      />
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
      <Stack.Screen
        name="Documents"
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
        headerStyle: { backgroundColor: attorneyColors.bgPrimary },
        headerTitleStyle: { color: attorneyColors.textPrimary, fontWeight: fontWeight.semibold },
        headerShadowVisible: false,
        headerTintColor: attorneyColors.textPrimary,
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

export function AttorneyNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: attorneyColors.bgSecondary,
          borderTopColor: attorneyColors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: attorneyColors.accent,
        tabBarInactiveTintColor: attorneyColors.textSecondary,
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: fontWeight.medium,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'grid' : 'grid-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Requests"
        component={RequestsStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'mail' : 'mail-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'calendar' : 'calendar-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientsStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'people' : 'people-outline'} focused={focused} />
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
    backgroundColor: attorneyColors.accent,
    marginTop: 2,
  },
});
